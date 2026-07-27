"use client";

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  CHARACTER_STORAGE_KEY,
  LEGACY_CHARACTER_STORAGE_KEY,
  clampMeasurement,
  createDefaultCharacter,
  normalizeCharacterProfile,
} from "./config";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterMeasurementId,
  CharacterProfile,
  CharacterWardrobe,
} from "./types";

const CHARACTER_CHANGE_EVENT = "physique:character-change";
const DEFAULT_SNAPSHOT = JSON.stringify(createDefaultCharacter());
let memorySnapshot = DEFAULT_SNAPSHOT;

function readStoredSnapshot() {
  try {
    return (
      window.localStorage.getItem(CHARACTER_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_CHARACTER_STORAGE_KEY) ??
      memorySnapshot
    );
  } catch {
    return memorySnapshot;
  }
}

function parseSnapshot(snapshot: string): CharacterProfile {
  try {
    return normalizeCharacterProfile(JSON.parse(snapshot));
  } catch {
    return createDefaultCharacter();
  }
}

function writeStoredProfile(profile: CharacterProfile) {
  const snapshot = JSON.stringify(profile);
  memorySnapshot = snapshot;
  try {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, snapshot);
  } catch {
    // The in-memory snapshot keeps editing functional when storage is blocked.
  }
  window.dispatchEvent(new Event(CHARACTER_CHANGE_EVENT));
}

function subscribeToProfile(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CHARACTER_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHARACTER_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHARACTER_CHANGE_EVENT, onStoreChange);
  };
}

export function useCharacterProfile() {
  const snapshot = useSyncExternalStore(
    subscribeToProfile,
    readStoredSnapshot,
    () => DEFAULT_SNAPSHOT,
  );
  const profile = useMemo(() => parseSnapshot(snapshot), [snapshot]);

  const updateProfile = useCallback(
    (update: (current: CharacterProfile) => CharacterProfile) => {
      const current = parseSnapshot(readStoredSnapshot());
      writeStoredProfile(update(current));
    },
    [],
  );

  const updateMeasurement = useCallback(
    (id: CharacterMeasurementId, value: number) => {
      if (!Number.isFinite(value)) return;
      updateProfile((current) => ({
        ...current,
        measurements: {
          ...current.measurements,
          [id]: clampMeasurement(id, value),
        },
      }));
    },
    [updateProfile],
  );

  const updateName = useCallback(
    (name: string) => {
      updateProfile((current) => ({
        ...current,
        name: name.slice(0, 32),
      }));
    },
    [updateProfile],
  );

  const updateBodyColor = useCallback(
    (bodyColor: string) => {
      updateProfile((current) => ({
        ...current,
        appearance: {
          ...current.appearance,
          bodyColor,
        },
      }));
    },
    [updateProfile],
  );

  const updateBodyType = useCallback(
    (bodyType: CharacterBodyType) => {
      updateProfile((current) => ({
        ...current,
        bodyType,
      }));
    },
    [updateProfile],
  );

  const updateAppearance = useCallback(
    <K extends keyof CharacterAppearance>(
      id: K,
      value: CharacterAppearance[K],
    ) => {
      updateProfile((current) => ({
        ...current,
        appearance: {
          ...current.appearance,
          [id]: value,
        },
      }));
    },
    [updateProfile],
  );

  const updateWardrobe = useCallback(
    <K extends keyof CharacterWardrobe>(
      id: K,
      value: CharacterWardrobe[K],
    ) => {
      updateProfile((current) => ({
        ...current,
        wardrobe: {
          ...current.wardrobe,
          [id]: value,
        },
      }));
    },
    [updateProfile],
  );

  const resetProfile = useCallback(() => {
    writeStoredProfile(createDefaultCharacter());
  }, []);

  return {
    profile,
    updateMeasurement,
    updateName,
    updateBodyColor,
    updateBodyType,
    updateAppearance,
    updateWardrobe,
    resetProfile,
  };
}

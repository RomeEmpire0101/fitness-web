"use client";

import {
  type SetStateAction,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  createDefaultFitnessData,
  FitnessData,
  FITNESS_STORAGE_KEY,
  normalizeFitnessData,
} from "@/lib/fitnessData";

const FITNESS_CHANGE_EVENT = "formforge:fitness-data-change";
const DEFAULT_SNAPSHOT = JSON.stringify(createDefaultFitnessData());
let memorySnapshot = DEFAULT_SNAPSHOT;

function readSnapshot() {
  try {
    return window.localStorage.getItem(FITNESS_STORAGE_KEY) ?? memorySnapshot;
  } catch {
    return memorySnapshot;
  }
}

function parseSnapshot(snapshot: string): FitnessData {
  try {
    return normalizeFitnessData(JSON.parse(snapshot));
  } catch {
    return createDefaultFitnessData();
  }
}

function writeData(data: FitnessData) {
  const snapshot = JSON.stringify(data);
  memorySnapshot = snapshot;
  try {
    window.localStorage.setItem(FITNESS_STORAGE_KEY, snapshot);
  } catch {
    // Keep the current in-memory session usable when persistence is blocked.
  }
  window.dispatchEvent(new Event(FITNESS_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === FITNESS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(FITNESS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FITNESS_CHANGE_EVENT, onStoreChange);
  };
}

export function useFitnessData() {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => DEFAULT_SNAPSHOT,
  );
  const data = useMemo(() => parseSnapshot(snapshot), [snapshot]);
  const setData = useCallback((action: SetStateAction<FitnessData>) => {
    const current = parseSnapshot(readSnapshot());
    writeData(
      typeof action === "function"
        ? action(current)
        : action,
    );
  }, []);

  return [data, setData] as const;
}

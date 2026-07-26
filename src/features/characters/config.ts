import {
  CharacterAppearanceOption,
  CharacterMeasurementDefinition,
  CharacterMeasurementId,
  CharacterProfile,
} from "./types";

export const CHARACTER_STORAGE_KEY = "physique:character:v3";

export const CHARACTER_MEASUREMENTS: CharacterMeasurementDefinition[] = [
  {
    id: "heightCm",
    label: "Height",
    shortLabel: "Height",
    unit: "cm",
    min: 145,
    max: 210,
    step: 1,
    description: "Changes stature and scene framing",
  },
  {
    id: "weightKg",
    label: "Weight",
    shortLabel: "Weight",
    unit: "kg",
    min: 42,
    max: 150,
    step: 1,
    description: "Changes the character's overall build",
  },
];

export const CHARACTER_APPEARANCE_OPTIONS: CharacterAppearanceOption[] = [
  { id: "sand", label: "Sand", bodyColor: "#c98f72" },
  { id: "olive", label: "Olive", bodyColor: "#ad7658" },
  { id: "bronze", label: "Bronze", bodyColor: "#8f5d45" },
  { id: "umber", label: "Umber", bodyColor: "#684334" },
];

export const DEFAULT_CHARACTER_PROFILE: CharacterProfile = {
  id: "local-profile",
  modelId: "adaptive-athlete",
  name: "",
  measurements: {
    heightCm: Math.round(
      (CHARACTER_MEASUREMENTS[0].min + CHARACTER_MEASUREMENTS[0].max) / 2,
    ),
    weightKg: Math.round(
      (CHARACTER_MEASUREMENTS[1].min + CHARACTER_MEASUREMENTS[1].max) / 2,
    ),
  },
  appearance: {
    bodyColor: CHARACTER_APPEARANCE_OPTIONS[0].bodyColor,
    accentColor: "#8c99a8",
  },
};

export const createDefaultCharacter = (): CharacterProfile => ({
  ...DEFAULT_CHARACTER_PROFILE,
  measurements: { ...DEFAULT_CHARACTER_PROFILE.measurements },
  appearance: { ...DEFAULT_CHARACTER_PROFILE.appearance },
});

export const getMeasurementDefinition = (id: CharacterMeasurementId) =>
  CHARACTER_MEASUREMENTS.find((measurement) => measurement.id === id);

export function clampMeasurement(
  id: CharacterMeasurementId,
  value: number,
): number {
  const definition = getMeasurementDefinition(id);
  if (!definition) return value;

  const stepped =
    Math.round(value / definition.step) * definition.step;
  return Math.min(definition.max, Math.max(definition.min, stepped));
}

export function normalizeCharacterProfile(
  candidate: unknown,
): CharacterProfile {
  const fallback = createDefaultCharacter();
  if (!candidate || typeof candidate !== "object") return fallback;

  const partial = candidate as Partial<CharacterProfile>;
  const measurements =
    partial.measurements && typeof partial.measurements === "object"
      ? partial.measurements
      : fallback.measurements;
  const appearance =
    partial.appearance && typeof partial.appearance === "object"
      ? partial.appearance
      : fallback.appearance;

  const height = Number(measurements.heightCm);
  const weight = Number(measurements.weightKg);
  const bodyColor =
    typeof appearance.bodyColor === "string"
      ? appearance.bodyColor
      : fallback.appearance.bodyColor;

  return {
    id: typeof partial.id === "string" ? partial.id : fallback.id,
    modelId:
      partial.modelId === "adaptive-athlete"
        ? partial.modelId
        : fallback.modelId,
    name:
      typeof partial.name === "string"
        ? partial.name.slice(0, 32)
        : fallback.name,
    measurements: {
      heightCm: clampMeasurement(
        "heightCm",
        Number.isFinite(height) ? height : fallback.measurements.heightCm,
      ),
      weightKg: clampMeasurement(
        "weightKg",
        Number.isFinite(weight) ? weight : fallback.measurements.weightKg,
      ),
    },
    appearance: {
      bodyColor,
      accentColor: fallback.appearance.accentColor,
    },
  };
}

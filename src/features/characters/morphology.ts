import { CharacterMeasurements } from "./types";

const BASE_HEIGHT_CM = 175;
const BASE_WEIGHT_KG = 75;
const BASE_BODY_FAT = 18;
const BASE_FFMI =
  (BASE_WEIGHT_KG * (1 - BASE_BODY_FAT / 100)) /
  Math.pow(BASE_HEIGHT_CM / 100, 2);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smootherstep = (edge0: number, edge1: number, value: number) => {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return (
    normalized *
    normalized *
    normalized *
    (normalized * (normalized * 6 - 15) + 10)
  );
};

export type CharacterMorphology = {
  heightScale: number;
  widthScale: number;
  fatLevel: number;
  massIndex: number;
  fatFreeMassIndex: number;
  groundOffset: number;
  cameraDistance: number;
  buildLabel: "Light" | "Balanced" | "Solid" | "Powerful";
};

/**
 * Converts editable measurements into visual proportions. This is a rendering
 * model only: labels describe the silhouette, not health or body composition.
 *
 * Height controls stature. Weight and the user's body-fat estimate separate
 * lean frame mass from the subcutaneous fat layer so a heavier trained body is
 * not automatically rendered as a higher-fat body.
 */
export function deriveCharacterMorphology(
  measurements: CharacterMeasurements,
): CharacterMorphology {
  const heightScale = clamp(measurements.heightCm / BASE_HEIGHT_CM, 0.82, 1.22);
  const heightMeters = measurements.heightCm / 100;
  const massIndex = measurements.weightKg / Math.pow(heightMeters, 2);
  const bodyFatFraction = measurements.bodyFatPct / 100;
  const leanMass = measurements.weightKg * (1 - bodyFatFraction);
  const fatFreeMassIndex = leanMass / Math.pow(heightMeters, 2);

  // Structural width follows fat-free mass relative to height. Fat has its own
  // regional deformation path in the anatomy shaders.
  const structuralFfmi = clamp(fatFreeMassIndex, 13.5, 26);
  const widthScale = clamp(
    Math.sqrt(structuralFfmi / BASE_FFMI),
    0.83,
    1.13,
  );

  const fatLevel = clamp(
    smootherstep(8, 40, measurements.bodyFatPct) +
      clamp((measurements.bodyFatPct - 40) / 25, 0, 0.18),
    0,
    1.18,
  );

  const buildLabel: CharacterMorphology["buildLabel"] =
    fatFreeMassIndex < 16
      ? "Light"
      : fatLevel < 0.18
        ? "Balanced"
        : fatLevel < 0.72
          ? "Solid"
          : "Powerful";

  return {
    heightScale,
    widthScale,
    fatLevel,
    massIndex,
    fatFreeMassIndex,
    groundOffset: (heightScale - 1) * 2.49,
    cameraDistance:
      10.35 +
      Math.max(0, heightScale - 1) * 2.2 +
      Math.max(0, widthScale - 1) * 0.8 +
      fatLevel * 0.42,
    buildLabel,
  };
}

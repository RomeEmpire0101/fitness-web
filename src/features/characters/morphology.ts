import { CharacterMeasurements } from "./types";

const BASE_HEIGHT_CM = 175;
const BASE_WEIGHT_KG = 75;
const BASE_BMI =
  BASE_WEIGHT_KG / Math.pow(BASE_HEIGHT_CM / 100, 2);
const FAT_ONSET_BMI = 24.5;
const HIGH_FAT_BMI = 39;

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
  groundOffset: number;
  cameraDistance: number;
  buildLabel: "Light" | "Balanced" | "Solid" | "Powerful";
};

/**
 * Converts editable measurements into visual proportions. This is a rendering
 * model only: labels describe the silhouette, not health or body composition.
 *
 * Height controls stature. Weight within a plausible lean range changes frame
 * thickness, while excess height-adjusted mass becomes a separate subcutaneous
 * fat signal. This avoids making the head, hands, and feet uniformly wider.
 *
 * Height and weight cannot distinguish muscle from fat, so fatLevel is a
 * bounded visual heuristic rather than a body-fat estimate or diagnosis.
 */
export function deriveCharacterMorphology(
  measurements: CharacterMeasurements,
): CharacterMorphology {
  const heightScale = clamp(measurements.heightCm / BASE_HEIGHT_CM, 0.82, 1.22);
  const heightMeters = measurements.heightCm / 100;
  const massIndex = measurements.weightKg / Math.pow(heightMeters, 2);

  // Structural width grows only through the plausible lean-mass range. Mass
  // above that range is handled by regional fat deformation in the shader.
  const structuralBmi = clamp(massIndex, 17, 25.5);
  const widthScale = clamp(
    Math.sqrt(structuralBmi / BASE_BMI),
    0.83,
    1.025,
  );

  // A broad, eased transition prevents a one-kilogram change from visibly
  // switching the body between "lean" and "fat." Very high values continue
  // adding volume at a reduced rate so the 150 kg editor limit remains useful.
  const primaryFat = smootherstep(FAT_ONSET_BMI, HIGH_FAT_BMI, massIndex);
  const highMassContinuation = clamp(
    (massIndex - HIGH_FAT_BMI) / 44,
    0,
    0.28,
  );
  const fatLevel = clamp(primaryFat + highMassContinuation, 0, 1.28);

  const buildLabel: CharacterMorphology["buildLabel"] =
    massIndex < 18.5
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
    groundOffset: (heightScale - 1) * 2.49,
    cameraDistance:
      10.35 +
      Math.max(0, heightScale - 1) * 2.2 +
      Math.max(0, widthScale - 1) * 0.8 +
      fatLevel * 0.42,
    buildLabel,
  };
}

import { CharacterMeasurements } from "./types";

const BASE_HEIGHT_CM = 175;
const BASE_WEIGHT_KG = 75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type CharacterMorphology = {
  heightScale: number;
  widthScale: number;
  groundOffset: number;
  cameraDistance: number;
  buildLabel: "Light" | "Balanced" | "Solid" | "Powerful";
};

/**
 * Converts editable measurements into visual proportions. This is a rendering
 * model only: labels describe the silhouette, not health or body composition.
 *
 * Width is derived from approximate volume (height × width²) so weight and
 * height remain independent controls instead of both uniformly scaling the rig.
 */
export function deriveCharacterMorphology(
  measurements: CharacterMeasurements,
): CharacterMorphology {
  const heightScale = clamp(measurements.heightCm / BASE_HEIGHT_CM, 0.82, 1.22);
  const relativeMass = measurements.weightKg / BASE_WEIGHT_KG;
  const widthScale = clamp(
    Math.sqrt(relativeMass / heightScale),
    0.76,
    1.36,
  );

  const buildLabel: CharacterMorphology["buildLabel"] =
    widthScale < 0.9
      ? "Light"
      : widthScale < 1.08
        ? "Balanced"
        : widthScale < 1.22
          ? "Solid"
          : "Powerful";

  return {
    heightScale,
    widthScale,
    groundOffset: (heightScale - 1) * 2.49,
    cameraDistance:
      10.35 +
      Math.max(0, heightScale - 1) * 2.2 +
      Math.max(0, widthScale - 1) * 0.8,
    buildLabel,
  };
}

import type { MuscleGroupId } from "@/lib/simulation";

export type CharacterMeasurementId = "heightCm" | "weightKg";

export type CharacterModelId = "adaptive-athlete";

export type CharacterMeasurements = Record<CharacterMeasurementId, number>;

export type CharacterAppearance = {
  bodyColor: string;
  accentColor: string;
};

export type CharacterProfile = {
  id: string;
  modelId: CharacterModelId;
  name: string;
  measurements: CharacterMeasurements;
  appearance: CharacterAppearance;
};

export type CharacterMeasurementDefinition = {
  id: CharacterMeasurementId;
  label: string;
  shortLabel: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
};

export type CharacterAppearanceOption = {
  id: string;
  label: string;
  bodyColor: string;
};

export type CharacterVisualization = {
  growth: number;
  definition: number;
  stimulus: number;
  muscleSignals?: Partial<Record<MuscleGroupId, number>>;
  reducedMotion: boolean;
};

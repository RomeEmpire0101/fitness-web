import type { MuscleGroupId } from "@/lib/simulation";

export type CharacterMeasurementId = "heightCm" | "weightKg";

export type CharacterModelId = "adaptive-athlete";

export type CharacterBodyType = "male" | "female";

export type CharacterHairStyleId =
  | "buzz"
  | "crop"
  | "bob"
  | "long"
  | "ponytail";

export type CharacterTopId = "none" | "tank" | "tee" | "hoodie";

export type CharacterBottomId = "shorts" | "joggers" | "leggings";

export type CharacterShoesId = "trainers" | "high-tops";

export type CharacterHeadwearId = "none" | "cap" | "beanie";

export type CharacterEyewearId = "none" | "sport" | "round";

export type CharacterMeasurements = Record<CharacterMeasurementId, number>;

export type CharacterAppearance = {
  bodyColor: string;
  accentColor: string;
  hairStyle: CharacterHairStyleId;
  hairColor: string;
};

export type CharacterWardrobe = {
  top: CharacterTopId;
  topColor: string;
  bottom: CharacterBottomId;
  bottomColor: string;
  shoes: CharacterShoesId;
  shoeColor: string;
  headwear: CharacterHeadwearId;
  headwearColor: string;
  eyewear: CharacterEyewearId;
};

export type CharacterProfile = {
  id: string;
  modelId: CharacterModelId;
  name: string;
  bodyType: CharacterBodyType;
  measurements: CharacterMeasurements;
  appearance: CharacterAppearance;
  wardrobe: CharacterWardrobe;
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

export type CharacterChoice<T extends string> = {
  id: T;
  label: string;
  description: string;
};

export type CharacterVisualization = {
  growth: number;
  definition: number;
  stimulus: number;
  muscleSignals?: Partial<Record<MuscleGroupId, number>>;
  reducedMotion: boolean;
};

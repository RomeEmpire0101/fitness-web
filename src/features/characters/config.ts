import {
  CharacterAppearanceOption,
  CharacterBodyType,
  CharacterBottomId,
  CharacterChoice,
  CharacterEyewearId,
  CharacterHairStyleId,
  CharacterHeadwearId,
  CharacterMeasurementDefinition,
  CharacterMeasurementId,
  CharacterProfile,
  CharacterShoesId,
  CharacterTopId,
} from "./types";

export const CHARACTER_STORAGE_KEY = "physique:character:v4";
export const LEGACY_CHARACTER_STORAGE_KEY = "physique:character:v3";

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
    description: "Adds frame mass or regional body fat relative to height",
  },
  {
    id: "bodyFatPct",
    label: "Body fat",
    shortLabel: "Body fat",
    unit: "%",
    min: 6,
    max: 45,
    step: 1,
    description: "Sets the starting fat layer and muscle definition",
  },
];

export const CHARACTER_APPEARANCE_OPTIONS: CharacterAppearanceOption[] = [
  { id: "porcelain", label: "Porcelain", bodyColor: "#e7bda3" },
  { id: "sand", label: "Sand", bodyColor: "#c98f72" },
  { id: "olive", label: "Olive", bodyColor: "#ad7658" },
  { id: "bronze", label: "Bronze", bodyColor: "#8f5d45" },
  { id: "umber", label: "Umber", bodyColor: "#684334" },
  { id: "ebony", label: "Ebony", bodyColor: "#422b24" },
];

export const CHARACTER_BODY_TYPES: Array<
  CharacterChoice<CharacterBodyType>
> = [
  {
    id: "male",
    label: "Male",
    description: "Masculine frame and fat distribution",
  },
  {
    id: "female",
    label: "Female",
    description: "Feminine frame and fat distribution",
  },
];

export const CHARACTER_HAIR_STYLES: Array<
  CharacterChoice<CharacterHairStyleId>
> = [
  { id: "buzz", label: "Buzz", description: "Close cropped" },
  { id: "crop", label: "Crop", description: "Short textured top" },
  { id: "bob", label: "Bob", description: "Jaw length" },
  { id: "long", label: "Long", description: "Shoulder length" },
  { id: "ponytail", label: "Ponytail", description: "Tied back" },
];

export const CHARACTER_TOPS: Array<CharacterChoice<CharacterTopId>> = [
  { id: "none", label: "None", description: "Base layer" },
  { id: "tank", label: "Tank", description: "Training tank" },
  { id: "tee", label: "T-shirt", description: "Classic crew" },
  { id: "hoodie", label: "Hoodie", description: "Relaxed layer" },
];

export const CHARACTER_BOTTOMS: Array<CharacterChoice<CharacterBottomId>> = [
  { id: "shorts", label: "Shorts", description: "Training cut" },
  { id: "joggers", label: "Joggers", description: "Tapered fit" },
  { id: "leggings", label: "Leggings", description: "Compression fit" },
];

export const CHARACTER_SHOES: Array<CharacterChoice<CharacterShoesId>> = [
  { id: "trainers", label: "Trainers", description: "Low profile" },
  { id: "high-tops", label: "High-tops", description: "Ankle support" },
];

export const CHARACTER_HEADWEAR: Array<
  CharacterChoice<CharacterHeadwearId>
> = [
  { id: "none", label: "None", description: "No headwear" },
  { id: "cap", label: "Cap", description: "Curved brim" },
  { id: "beanie", label: "Beanie", description: "Soft knit" },
];

export const CHARACTER_EYEWEAR: Array<
  CharacterChoice<CharacterEyewearId>
> = [
  { id: "none", label: "None", description: "No eyewear" },
  { id: "sport", label: "Sport", description: "Wraparound lens" },
  { id: "round", label: "Round", description: "Classic frames" },
];

export const CHARACTER_HAIR_COLORS = [
  { id: "midnight", label: "Midnight", color: "#171514" },
  { id: "espresso", label: "Espresso", color: "#3b2820" },
  { id: "chestnut", label: "Chestnut", color: "#70452f" },
  { id: "copper", label: "Copper", color: "#a45a37" },
  { id: "honey", label: "Honey", color: "#c19a61" },
  { id: "silver", label: "Silver", color: "#a9a9aa" },
];

export const CHARACTER_CLOTHING_COLORS = [
  { id: "ink", label: "Ink", color: "#24272c" },
  { id: "cloud", label: "Cloud", color: "#dfe3e6" },
  { id: "sage", label: "Sage", color: "#748b78" },
  { id: "ocean", label: "Ocean", color: "#386681" },
  { id: "violet", label: "Violet", color: "#6d5a86" },
  { id: "coral", label: "Coral", color: "#b85f52" },
];

export const DEFAULT_CHARACTER_PROFILE: CharacterProfile = {
  id: "local-profile",
  modelId: "adaptive-athlete",
  name: "",
  bodyType: "male",
  measurements: {
    heightCm: 175,
    weightKg: 75,
    bodyFatPct: 18,
  },
  appearance: {
    bodyColor: CHARACTER_APPEARANCE_OPTIONS[0].bodyColor,
    accentColor: "#8c99a8",
    hairStyle: "crop",
    hairColor: CHARACTER_HAIR_COLORS[0].color,
  },
  wardrobe: {
    top: "tee",
    topColor: CHARACTER_CLOTHING_COLORS[2].color,
    bottom: "shorts",
    bottomColor: CHARACTER_CLOTHING_COLORS[0].color,
    shoes: "trainers",
    shoeColor: CHARACTER_CLOTHING_COLORS[1].color,
    headwear: "none",
    headwearColor: CHARACTER_CLOTHING_COLORS[0].color,
    eyewear: "none",
  },
};

export const createDefaultCharacter = (): CharacterProfile => ({
  ...DEFAULT_CHARACTER_PROFILE,
  measurements: { ...DEFAULT_CHARACTER_PROFILE.measurements },
  appearance: { ...DEFAULT_CHARACTER_PROFILE.appearance },
  wardrobe: { ...DEFAULT_CHARACTER_PROFILE.wardrobe },
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
  const wardrobe =
    partial.wardrobe && typeof partial.wardrobe === "object"
      ? partial.wardrobe
      : fallback.wardrobe;

  const height = Number(measurements.heightCm);
  const weight = Number(measurements.weightKg);
  const bodyFat = Number(measurements.bodyFatPct);
  const bodyColor =
    typeof appearance.bodyColor === "string"
      ? appearance.bodyColor
      : fallback.appearance.bodyColor;
  const stringOr = (value: unknown, defaultValue: string) =>
    typeof value === "string" ? value : defaultValue;
  const optionOr = <T extends string>(
    value: unknown,
    choices: ReadonlyArray<CharacterChoice<T>>,
    defaultValue: T,
  ): T =>
    choices.some((choice) => choice.id === value)
      ? (value as T)
      : defaultValue;

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
    bodyType:
      partial.bodyType === "female" || partial.bodyType === "male"
        ? partial.bodyType
        : fallback.bodyType,
    measurements: {
      heightCm: clampMeasurement(
        "heightCm",
        Number.isFinite(height) ? height : fallback.measurements.heightCm,
      ),
      weightKg: clampMeasurement(
        "weightKg",
        Number.isFinite(weight) ? weight : fallback.measurements.weightKg,
      ),
      bodyFatPct: clampMeasurement(
        "bodyFatPct",
        Number.isFinite(bodyFat)
          ? bodyFat
          : fallback.measurements.bodyFatPct,
      ),
    },
    appearance: {
      bodyColor,
      accentColor: stringOr(
        appearance.accentColor,
        fallback.appearance.accentColor,
      ),
      hairStyle: optionOr(
        appearance.hairStyle,
        CHARACTER_HAIR_STYLES,
        fallback.appearance.hairStyle,
      ),
      hairColor: stringOr(
        appearance.hairColor,
        fallback.appearance.hairColor,
      ),
    },
    wardrobe: {
      top: optionOr(
        wardrobe.top,
        CHARACTER_TOPS,
        fallback.wardrobe.top,
      ),
      topColor: stringOr(
        wardrobe.topColor,
        fallback.wardrobe.topColor,
      ),
      bottom: optionOr(
        wardrobe.bottom,
        CHARACTER_BOTTOMS,
        fallback.wardrobe.bottom,
      ),
      bottomColor: stringOr(
        wardrobe.bottomColor,
        fallback.wardrobe.bottomColor,
      ),
      shoes: optionOr(
        wardrobe.shoes,
        CHARACTER_SHOES,
        fallback.wardrobe.shoes,
      ),
      shoeColor: stringOr(
        wardrobe.shoeColor,
        fallback.wardrobe.shoeColor,
      ),
      headwear: optionOr(
        wardrobe.headwear,
        CHARACTER_HEADWEAR,
        fallback.wardrobe.headwear,
      ),
      headwearColor: stringOr(
        wardrobe.headwearColor,
        fallback.wardrobe.headwearColor,
      ),
      eyewear: optionOr(
        wardrobe.eyewear,
        CHARACTER_EYEWEAR,
        fallback.wardrobe.eyewear,
      ),
    },
  };
}

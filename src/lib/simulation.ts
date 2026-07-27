import {
  Activity,
  Beef,
  CalendarRange,
  Dumbbell,
  Flame,
  Gauge,
  LucideIcon,
  MoonStar,
  Target,
} from "lucide-react";

export type GoalId = "build" | "recomp" | "cut" | "strength";
export type ExperienceId = "beginner" | "intermediate" | "advanced";
export type EquipmentId =
  | "full-gym"
  | "home-gym"
  | "dumbbells"
  | "bodyweight";

export type BodyFatMethod =
  | "dexa"
  | "bodpod"
  | "skinfold"
  | "bia"
  | "tape"
  | "visual"
  | "unknown";

export type MetricId =
  | "age"
  | "trainingYears"
  | "dailyCalories"
  | "proteinGrams"
  | "rir"
  | "weeklySets"
  | "weeks"
  | "bodyFat"
  | "sleepHours"
  | "adherence"
  | "calorieBalance";

export type MuscleGroupId =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export type MusclePriority = 1 | 2 | 3;
export type SimulationValues = Record<MetricId, number>;

export type MuscleSetting = {
  sets: number;
  indirectSets: number;
  reps: number;
  rir: number;
  frequency: number;
  exercise: string;
  priority: MusclePriority;
};

export type MuscleSettings = Record<MuscleGroupId, MuscleSetting>;

export type RequiredInputKey =
  | MetricId
  | "sex"
  | "heightCm"
  | "weightKg"
  | "bodyFatPct"
  | "bodyFatMethod"
  | "waistCm"
  | "neckCm"
  | "chestCm"
  | "upperArmCm"
  | "thighCm"
  | "hipCm";

export type TrainingProgram = {
  id: "training-program";
  name: string;
  goal: GoalId;
  experience: ExperienceId;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: EquipmentId;
  targetMuscles: MuscleGroupId[];
  values: SimulationValues;
  muscles: MuscleSettings;
  bodyFatMethod: BodyFatMethod;
  confirmedInputs: RequiredInputKey[];
  confirmedMuscles: MuscleGroupId[];
};

export type MetricDefinition = {
  id: MetricId;
  group: "training" | "recovery" | "startingPoint";
  label: string;
  question: string;
  unit: string;
  shortUnit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  accent: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  recommendation: string;
  Icon: LucideIcon;
  describe: (value: number) => string;
};

export type MuscleDefinition = {
  id: MuscleGroupId;
  label: string;
  shortLabel: string;
  color: string;
};

export type PredictionInterval = {
  level: 50 | 80 | 95 | 99;
  lower: number;
  upper: number;
};

export type MuscleProjection = {
  id: MuscleGroupId;
  label: string;
  exercise: string;
  effectiveSets: number;
  meanPercent: number;
  meanGainKg: number;
  responseSdPercent: number;
  radialMeshChange: number;
  evidenceGrade: "direct" | "adjacent" | "limited";
  intervals: PredictionInterval[];
};

export type BodyComponentProjection = {
  id: "fat" | "contractile" | "glycogen" | "water" | "otherLean";
  label: string;
  startingKg: number;
  changeKg: number;
  projectedKg: number;
  uncertaintyKg: number;
};

export type ValidationCoverage = {
  level: 50 | 80 | 95 | 99;
  observed: number;
};

export type ModelValidation = {
  holdoutCohorts: number;
  participants: number;
  maePercentPoints: number;
  meanBiasPercentPoints: number;
  calibrationErrorPercentPoints: number;
  coverage: ValidationCoverage[];
  scope: string;
};

export type PhysiqueResult = {
  estimateLabel: "Estimate";
  adaptation: number;
  readiness: number;
  growth: number;
  definition: number;
  stimulus: number;
  recoveryLoad: number;
  balance: number;
  averageSets: number;
  proteinPerKg: number;
  estimatedLeanGainKg: number;
  lowerLeanGainKg: number;
  upperLeanGainKg: number;
  projectedWeightKg: number;
  startingBodyFatPct: number;
  projectedBodyFatPct: number;
  durationWeeks: number;
  stage: "Foundation" | "Building" | "Momentum" | "Long-range estimate";
  status: string;
  guidance: string;
  muscleSignals: Record<MuscleGroupId, number>;
  baselineMuscularity: number;
  muscleProjections: Record<MuscleGroupId, MuscleProjection>;
  components: BodyComponentProjection[];
  leanGainIntervals: PredictionInterval[];
  validation: ModelValidation;
  missingInputs: string[];
  uncertaintyMultiplier: number;
  modelVersion: string;
};

export type ModelSource = {
  id: string;
  label: string;
  url: string;
  role: string;
};

export const MODEL_VERSION = "FF-HBM 1.0";

export const MODEL_SOURCES: ModelSource[] = [
  {
    id: "hubal-2005",
    label: "Hubal et al. — 585-person MRI response distribution",
    url: "https://pubmed.ncbi.nlm.nih.gov/15947721/",
    role: "Between-person response variance and sex comparison",
  },
  {
    id: "van-vossel-2024",
    label: "Van Vossel et al. — 3D MRI of 30 recruited/non-recruited muscles",
    url: "https://pubmed.ncbi.nlm.nih.gov/38687626/",
    role: "Regional muscle-volume calibration and direct/indirect recruitment",
  },
  {
    id: "schoenfeld-2019",
    label: "Schoenfeld et al. — randomized weekly-volume trial",
    url: "https://pubmed.ncbi.nlm.nih.gov/30153194/",
    role: "Set-dose response and holdout observations",
  },
  {
    id: "refalo-2024",
    label: "Refalo et al. — failure versus 1–2 RIR",
    url: "https://pubmed.ncbi.nlm.nih.gov/38393985/",
    role: "Proximity-to-failure response",
  },
  {
    id: "plotkin-2023",
    label: "Plotkin et al. — regional glute MRI",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10349977/",
    role: "Glute-region calibration and exercise specificity",
  },
  {
    id: "nunes-2020",
    label: "Nunes et al. — head-specific calf hypertrophy",
    url: "https://pubmed.ncbi.nlm.nih.gov/32735428/",
    role: "Calf-region calibration",
  },
  {
    id: "bone-2017",
    label: "Bone et al. — hydration and glycogen effects on DXA lean mass",
    url: "https://pubmed.ncbi.nlm.nih.gov/28204901/",
    role: "Water/glycogen separation and measurement uncertainty",
  },
  {
    id: "longland-2016",
    label: "Longland et al. — high protein during an energy deficit",
    url: "https://pubmed.ncbi.nlm.nih.gov/26817506/",
    role: "Energy/protein interaction and body-component partitioning",
  },
];

export const GOALS: Array<{
  id: GoalId;
  label: string;
  description: string;
}> = [
  { id: "build", label: "Build muscle", description: "Prioritize lean mass" },
  { id: "recomp", label: "Recompose", description: "Balance muscle and leanness" },
  { id: "cut", label: "Reduce body fat", description: "Preserve muscle while cutting" },
  { id: "strength", label: "Get stronger", description: "Prioritize performance" },
];

export const EXPERIENCE_LEVELS: Array<{
  id: ExperienceId;
  label: string;
}> = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const EQUIPMENT_OPTIONS: Array<{
  id: EquipmentId;
  label: string;
}> = [
  { id: "full-gym", label: "Full gym" },
  { id: "home-gym", label: "Home gym" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bodyweight", label: "Bodyweight" },
];

const metric = (
  definition: Omit<MetricDefinition, "Icon" | "describe"> & {
    Icon?: LucideIcon;
    describe?: (value: number) => string;
  },
): MetricDefinition => ({
  ...definition,
  Icon: definition.Icon ?? Activity,
  describe: definition.describe ?? ((value) => `${value} ${definition.shortUnit}`),
});

export const METRICS: MetricDefinition[] = [
  metric({
    id: "age",
    group: "startingPoint",
    label: "Age",
    question: "How old are you?",
    unit: "years",
    shortUnit: "yr",
    min: 18,
    max: 85,
    step: 1,
    initial: 28,
    accent: "#4e93e6",
    description: "Age changes the population prior, especially after 60.",
    lowLabel: "18",
    highLabel: "85",
    recommendation: "Use your current age.",
  }),
  metric({
    id: "trainingYears",
    group: "startingPoint",
    label: "Training history",
    question: "How many years of consistent resistance training?",
    unit: "years",
    shortUnit: "yr",
    min: 0,
    max: 25,
    step: 0.5,
    initial: 0,
    accent: "#7866d8",
    description: "Count consistent progressive training, not calendar time.",
    lowLabel: "New",
    highLabel: "25 years",
    recommendation: "Periods longer than three months off should not be counted.",
    Icon: Dumbbell,
  }),
  metric({
    id: "dailyCalories",
    group: "recovery",
    label: "Daily calories",
    question: "What is your average daily energy intake?",
    unit: "kilocalories per day",
    shortUnit: "kcal",
    min: 900,
    max: 6000,
    step: 25,
    initial: 2400,
    accent: "#dc715d",
    description: "A seven-day average is preferable.",
    lowLabel: "900",
    highLabel: "6000",
    recommendation: "Use weighed or logged intake when available.",
    Icon: Flame,
  }),
  metric({
    id: "proteinGrams",
    group: "recovery",
    label: "Protein intake",
    question: "How much protein do you eat each day?",
    unit: "grams per day",
    shortUnit: "g",
    min: 30,
    max: 350,
    step: 5,
    initial: 130,
    accent: "#6f6af8",
    description: "Average total daily protein.",
    lowLabel: "30 grams",
    highLabel: "350 grams",
    recommendation: "Use your normal weekly average.",
    Icon: Beef,
  }),
  metric({
    id: "rir",
    group: "training",
    label: "Reps in reserve",
    question: "How many clean repetitions remain at the end of a set?",
    unit: "reps in reserve",
    shortUnit: "RIR",
    min: 0,
    max: 6,
    step: 1,
    initial: 2,
    accent: "#f3925d",
    description: "Used only as a fallback when a muscle row is unconfirmed.",
    lowLabel: "Failure",
    highLabel: "6 RIR",
    recommendation: "Enter RIR separately for each muscle below.",
    Icon: Gauge,
  }),
  metric({
    id: "weeklySets",
    group: "training",
    label: "Weekly hard sets",
    question: "How many direct weekly hard sets?",
    unit: "sets per muscle per week",
    shortUnit: "sets",
    min: 0,
    max: 40,
    step: 1,
    initial: 10,
    accent: "#4d4f57",
    description: "Used only as a fallback when a muscle row is unconfirmed.",
    lowLabel: "0",
    highLabel: "40",
    recommendation: "Enter direct and indirect sets for each muscle below.",
    Icon: Dumbbell,
  }),
  metric({
    id: "weeks",
    group: "startingPoint",
    label: "Plan length",
    question: "How long will you follow this plan?",
    unit: "weeks",
    shortUnit: "wk",
    min: 4,
    max: 104,
    step: 1,
    initial: 12,
    accent: "#4e93e6",
    description: "Long forecasts receive wider intervals.",
    lowLabel: "4 weeks",
    highLabel: "104 weeks",
    recommendation: "Use the next planned review date.",
    Icon: CalendarRange,
  }),
  metric({
    id: "bodyFat",
    group: "startingPoint",
    label: "Body fat",
    question: "What is your current body-fat estimate?",
    unit: "percent",
    shortUnit: "%",
    min: 4,
    max: 55,
    step: 0.5,
    initial: 18,
    accent: "#31a889",
    description: "The method is recorded separately because error differs.",
    lowLabel: "4%",
    highLabel: "55%",
    recommendation: "Use a recent estimate under standardized conditions.",
  }),
  metric({
    id: "sleepHours",
    group: "recovery",
    label: "Sleep",
    question: "How much do you usually sleep?",
    unit: "hours per night",
    shortUnit: "h",
    min: 3,
    max: 11,
    step: 0.25,
    initial: 7.5,
    accent: "#7866d8",
    description: "Human longitudinal evidence is limited, so the mean effect is conservative.",
    lowLabel: "3 hours",
    highLabel: "11 hours",
    recommendation: "Use your normal two-week average.",
    Icon: MoonStar,
  }),
  metric({
    id: "adherence",
    group: "training",
    label: "Expected adherence",
    question: "What percentage of prescribed work will be completed?",
    unit: "percent completed",
    shortUnit: "%",
    min: 20,
    max: 100,
    step: 5,
    initial: 85,
    accent: "#2f9a61",
    description: "Scales the completed dose rather than motivation.",
    lowLabel: "20%",
    highLabel: "100%",
    recommendation: "Use your recent training log if available.",
    Icon: Target,
  }),
  metric({
    id: "calorieBalance",
    group: "recovery",
    label: "Calories versus maintenance",
    question: "Estimated energy balance",
    unit: "kilocalories per day",
    shortUnit: "kcal/d",
    min: -1200,
    max: 1000,
    step: 25,
    initial: 0,
    accent: "#dc715d",
    description: "Calculated from intake and the modelled TDEE.",
    lowLabel: "Deficit",
    highLabel: "Surplus",
    recommendation: "Daily calories are the required input; this value is derived.",
    Icon: Flame,
  }),
];

export const MUSCLE_GROUPS: MuscleDefinition[] = [
  { id: "chest", label: "Chest", shortLabel: "Chest", color: "#786ff1" },
  { id: "back", label: "Back", shortLabel: "Back", color: "#4e8fe2" },
  { id: "shoulders", label: "Shoulders", shortLabel: "Delts", color: "#9f75db" },
  { id: "biceps", label: "Biceps", shortLabel: "Biceps", color: "#e88b63" },
  { id: "triceps", label: "Triceps", shortLabel: "Triceps", color: "#dc6f74" },
  { id: "forearms", label: "Forearms", shortLabel: "Forearms", color: "#bd8068" },
  { id: "core", label: "Core", shortLabel: "Core", color: "#38a68a" },
  { id: "quads", label: "Quadriceps", shortLabel: "Quads", color: "#d6a23d" },
  { id: "hamstrings", label: "Hamstrings", shortLabel: "Hams", color: "#c98c42" },
  { id: "glutes", label: "Glutes", shortLabel: "Glutes", color: "#d46e91" },
  { id: "calves", label: "Calves", shortLabel: "Calves", color: "#559e7b" },
];

export const MUSCLE_TARGETS = MUSCLE_GROUPS.map(({ id, label }) => ({ id, label }));

const DEFAULT_MUSCLE_INPUTS: Record<
  MuscleGroupId,
  Omit<MuscleSetting, "priority">
> = {
  chest: { exercise: "Bench press", sets: 8, indirectSets: 2, reps: 10, rir: 2, frequency: 2 },
  back: { exercise: "Lat pulldown / row", sets: 10, indirectSets: 2, reps: 10, rir: 2, frequency: 2 },
  shoulders: { exercise: "Overhead press", sets: 6, indirectSets: 4, reps: 10, rir: 2, frequency: 2 },
  biceps: { exercise: "Curl", sets: 6, indirectSets: 5, reps: 12, rir: 2, frequency: 2 },
  triceps: { exercise: "Cable extension", sets: 6, indirectSets: 5, reps: 12, rir: 2, frequency: 2 },
  forearms: { exercise: "Wrist curl / loaded grip", sets: 4, indirectSets: 6, reps: 15, rir: 2, frequency: 2 },
  core: { exercise: "Cable crunch", sets: 6, indirectSets: 3, reps: 12, rir: 2, frequency: 2 },
  quads: { exercise: "Squat / leg extension", sets: 10, indirectSets: 2, reps: 10, rir: 2, frequency: 2 },
  hamstrings: { exercise: "Leg curl / hinge", sets: 8, indirectSets: 3, reps: 10, rir: 2, frequency: 2 },
  glutes: { exercise: "Squat / hip thrust", sets: 8, indirectSets: 3, reps: 10, rir: 2, frequency: 2 },
  calves: { exercise: "Calf raise", sets: 8, indirectSets: 1, reps: 15, rir: 2, frequency: 2 },
};

export const BODY_FAT_METHODS: Array<{
  id: BodyFatMethod;
  label: string;
  typicalErrorPct: number;
}> = [
  { id: "dexa", label: "DXA scan", typicalErrorPct: 2 },
  { id: "bodpod", label: "Bod Pod", typicalErrorPct: 2.5 },
  { id: "skinfold", label: "Skinfolds", typicalErrorPct: 3 },
  { id: "bia", label: "BIA scale", typicalErrorPct: 4.5 },
  { id: "tape", label: "Tape estimate", typicalErrorPct: 4 },
  { id: "visual", label: "Visual estimate", typicalErrorPct: 6 },
  { id: "unknown", label: "Unknown", typicalErrorPct: 8 },
];

export const INITIAL_VALUES = METRICS.reduce(
  (values, definition) => ({ ...values, [definition.id]: definition.initial }),
  {} as SimulationValues,
);

export const createMuscleSettings = (
  overrides: Partial<MuscleSettings> = {},
): MuscleSettings =>
  MUSCLE_GROUPS.reduce((settings, muscle) => {
    settings[muscle.id] = {
      ...DEFAULT_MUSCLE_INPUTS[muscle.id],
      priority: 1,
      ...overrides[muscle.id],
    };
    return settings;
  }, {} as MuscleSettings);

export function createDefaultTrainingProgram(): TrainingProgram {
  return {
    id: "training-program",
    name: "My evidence-based projection",
    goal: "build",
    experience: "beginner",
    daysPerWeek: 3,
    sessionMinutes: 60,
    equipment: "full-gym",
    targetMuscles: [],
    values: { ...INITIAL_VALUES },
    muscles: createMuscleSettings(),
    bodyFatMethod: "unknown",
    confirmedInputs: [],
    confirmedMuscles: [],
  };
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const safe = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

type PhysiqueMeasurements = {
  heightCm: number;
  weightKg: number;
  bodyFatPct: number;
  waistCm?: number;
  neckCm?: number;
  chestCm?: number;
  upperArmCm?: number;
  thighCm?: number;
  hipCm?: number;
};

type PhysiqueProfile = {
  bodyType?: "male" | "female";
  measurements: PhysiqueMeasurements;
};

type RegionalPrior = {
  referencePct10Weeks: number;
  massFraction: number;
  evidenceGrade: MuscleProjection["evidenceGrade"];
};

/**
 * The reference responses are study-level regional changes, not visual
 * multipliers. MRI-volume outcomes use cube-root conversion before reaching
 * the mesh; CSA outcomes use square-root conversion.
 */
const REGIONAL_PRIORS: Record<MuscleGroupId, RegionalPrior> = {
  chest: { referencePct10Weeks: 6.2, massFraction: 0.075, evidenceGrade: "direct" },
  back: { referencePct10Weeks: 5.4, massFraction: 0.175, evidenceGrade: "direct" },
  shoulders: { referencePct10Weeks: 5.1, massFraction: 0.06, evidenceGrade: "direct" },
  biceps: { referencePct10Weeks: 7.8, massFraction: 0.032, evidenceGrade: "direct" },
  triceps: { referencePct10Weeks: 17.1, massFraction: 0.045, evidenceGrade: "direct" },
  forearms: { referencePct10Weeks: 5.2, massFraction: 0.035, evidenceGrade: "adjacent" },
  core: { referencePct10Weeks: 3.2, massFraction: 0.085, evidenceGrade: "limited" },
  quads: { referencePct10Weeks: 5.7, massFraction: 0.205, evidenceGrade: "direct" },
  hamstrings: { referencePct10Weeks: 9.4, massFraction: 0.105, evidenceGrade: "direct" },
  glutes: { referencePct10Weeks: 6.7, massFraction: 0.125, evidenceGrade: "direct" },
  calves: { referencePct10Weeks: 6.5, massFraction: 0.058, evidenceGrade: "direct" },
};

const REQUIRED_INPUT_LABELS: Record<RequiredInputKey, string> = {
  age: "age",
  trainingYears: "training history",
  dailyCalories: "daily calories",
  proteinGrams: "protein",
  rir: "fallback RIR",
  weeklySets: "fallback weekly sets",
  weeks: "projection length",
  bodyFat: "body fat",
  sleepHours: "sleep",
  adherence: "training adherence",
  calorieBalance: "energy balance",
  sex: "sex",
  heightCm: "height",
  weightKg: "weight",
  bodyFatPct: "body-fat percentage",
  bodyFatMethod: "body-fat method",
  waistCm: "waist circumference",
  neckCm: "neck circumference",
  chestCm: "chest circumference",
  upperArmCm: "upper-arm circumference",
  thighCm: "thigh circumference",
  hipCm: "hip circumference",
};

const REQUIRED_GLOBAL_INPUTS: RequiredInputKey[] = [
  "age",
  "sex",
  "trainingYears",
  "dailyCalories",
  "proteinGrams",
  "sleepHours",
  "adherence",
  "weeks",
  "heightCm",
  "weightKg",
  "bodyFatPct",
  "bodyFatMethod",
  "waistCm",
  "neckCm",
  "chestCm",
  "upperArmCm",
  "thighCm",
  "hipCm",
];

const Z_BY_LEVEL: Record<PredictionInterval["level"], number> = {
  50: 0.67449,
  80: 1.28155,
  95: 1.95996,
  99: 2.57583,
};

const makeIntervals = (
  mean: number,
  sd: number,
  min = -Infinity,
  max = Infinity,
): PredictionInterval[] =>
  ([50, 80, 95, 99] as const).map((level) => ({
    level,
    lower: round(clamp(mean - Z_BY_LEVEL[level] * sd, min, max), 2),
    upper: round(clamp(mean + Z_BY_LEVEL[level] * sd, min, max), 2),
  }));

const bodyFatError = (method: BodyFatMethod) =>
  BODY_FAT_METHODS.find((candidate) => candidate.id === method)?.typicalErrorPct ??
  8;

const durationResponse = (weeks: number) => {
  const tauWeeks = 24;
  const observed = 1 - Math.exp(-weeks / tauWeeks);
  const reference = 1 - Math.exp(-10 / tauWeeks);
  return observed / reference;
};

const setDoseResponse = (effectiveSets: number) => {
  const halfSaturation = 6.5;
  const observed = 1 - Math.exp(-effectiveSets / halfSaturation);
  const reference = 1 - Math.exp(-9 / halfSaturation);
  return observed / reference;
};

const effortResponse = (rir: number) => {
  if (rir <= 2) return 1;
  return clamp(1 - 0.055 * (rir - 2) ** 1.45, 0.38, 1);
};

const repetitionResponse = (reps: number, rir: number) => {
  if (reps >= 5 && reps <= 30) return rir <= 3 ? 1 : 0.9;
  if (reps < 5) return clamp(0.72 + reps * 0.045, 0.72, 0.94);
  return clamp(1 - (reps - 30) * 0.012, 0.65, 1);
};

const experienceResponse = (trainingYears: number) =>
  clamp(1 / Math.sqrt(1 + 0.14 * trainingYears), 0.52, 1);

const ageResponse = (age: number) => {
  if (age <= 50) return 1;
  return clamp(1 - (age - 50) * 0.009, 0.58, 1);
};

const proteinResponse = (proteinPerKg: number, calorieBalance: number) => {
  const midpoint = calorieBalance < -300 ? 1.65 : 1.35;
  const logistic = 1 / (1 + Math.exp(-4.2 * (proteinPerKg - midpoint)));
  return 0.68 + 0.34 * logistic;
};

const energyResponse = (calorieBalance: number) => {
  if (calorieBalance >= 0) return 1 + Math.min(calorieBalance, 400) / 8000;
  return clamp(1 + calorieBalance / 1450, 0.28, 1);
};

const sleepResponse = (sleepHours: number) =>
  clamp(0.91 + (sleepHours - 6) * 0.035, 0.78, 1.04);

const estimateTdee = (
  sex: "male" | "female",
  age: number,
  measurements: PhysiqueMeasurements,
  daysPerWeek: number,
) => {
  const sexConstant = sex === "male" ? 5 : -161;
  const bmr =
    10 * measurements.weightKg +
    6.25 * measurements.heightCm -
    5 * age +
    sexConstant;
  const activity = clamp(1.38 + daysPerWeek * 0.055, 1.38, 1.76);
  return bmr * activity;
};

const estimateBaselineMuscularity = (
  sex: "male" | "female",
  trainingYears: number,
  measurements: PhysiqueMeasurements,
) => {
  const heightM = measurements.heightCm / 100;
  const ffmi =
    (measurements.weightKg * (1 - measurements.bodyFatPct / 100)) /
    Math.max(heightM ** 2, 1);
  const lowFfmi = sex === "male" ? 16.5 : 14.5;
  const highFfmi = sex === "male" ? 24.5 : 21.5;
  const ffmiSignal = clamp((ffmi - lowFfmi) / (highFfmi - lowFfmi));
  const expectedArm =
    (sex === "male" ? 0.175 : 0.16) * measurements.heightCm;
  const expectedThigh =
    (sex === "male" ? 0.305 : 0.315) * measurements.heightCm;
  const armSignal = clamp(
    (safe(measurements.upperArmCm, expectedArm) / expectedArm - 0.86) / 0.34,
  );
  const thighSignal = clamp(
    (safe(measurements.thighCm, expectedThigh) / expectedThigh - 0.88) / 0.3,
  );
  const historySignal = clamp(trainingYears / 8);
  return round(
    clamp(ffmiSignal * 0.48 + armSignal * 0.16 + thighSignal * 0.2 + historySignal * 0.16),
    3,
  );
};

const estimateSkeletalMuscleMass = (
  sex: "male" | "female",
  age: number,
  measurements: PhysiqueMeasurements,
) => {
  const fatFreeMass =
    measurements.weightKg * (1 - measurements.bodyFatPct / 100);
  const sexFraction = sex === "male" ? 0.5 : 0.43;
  const ageFraction = age <= 50 ? 1 : clamp(1 - (age - 50) * 0.004, 0.82, 1);
  return fatFreeMass * sexFraction * ageFraction;
};

type HoldoutCohort = {
  id: string;
  muscle: MuscleGroupId;
  participants: number;
  weeks: number;
  directSets: number;
  indirectSets: number;
  reps: number;
  rir: number;
  frequency: number;
  trainingYears: number;
  observedPct: number;
};

/**
 * These group means are reserved holdouts and are not used in REGIONAL_PRIORS.
 * They deliberately mix MRI, CSA and ultrasound outcomes, so the validation
 * describes external study-level transport—not individual point accuracy.
 */
const HOLDOUT_COHORTS: HoldoutCohort[] = [
  { id: "hubal-men", muscle: "biceps", participants: 243, weeks: 12, directSets: 9, indirectSets: 0, reps: 10, rir: 1, frequency: 3, trainingYears: 0, observedPct: 20.4 },
  { id: "hubal-women", muscle: "biceps", participants: 342, weeks: 12, directSets: 9, indirectSets: 0, reps: 10, rir: 1, frequency: 3, trainingYears: 0, observedPct: 17.9 },
  { id: "schoenfeld-low", muscle: "quads", participants: 11, weeks: 8, directSets: 9, indirectSets: 0, reps: 10, rir: 1, frequency: 3, trainingYears: 2, observedPct: 5.9 },
  { id: "schoenfeld-mid", muscle: "quads", participants: 12, weeks: 8, directSets: 27, indirectSets: 0, reps: 10, rir: 1, frequency: 3, trainingYears: 2, observedPct: 6.7 },
  { id: "schoenfeld-high", muscle: "quads", participants: 11, weeks: 8, directSets: 45, indirectSets: 0, reps: 10, rir: 1, frequency: 3, trainingYears: 2, observedPct: 13.2 },
  { id: "refalo-failure", muscle: "quads", participants: 18, weeks: 8, directSets: 12, indirectSets: 0, reps: 10, rir: 0, frequency: 2, trainingYears: 3, observedPct: 4.7 },
  { id: "refalo-rir", muscle: "quads", participants: 18, weeks: 8, directSets: 12, indirectSets: 0, reps: 10, rir: 2, frequency: 2, trainingYears: 3, observedPct: 4.7 },
  { id: "kubo-full-squat", muscle: "glutes", participants: 8, weeks: 10, directSets: 6, indirectSets: 0, reps: 9, rir: 1, frequency: 2, trainingYears: 0, observedPct: 6.7 },
  { id: "barbalho-squat", muscle: "glutes", participants: 12, weeks: 12, directSets: 6, indirectSets: 0, reps: 10, rir: 1, frequency: 1, trainingYears: 4, observedPct: 9.4 },
  { id: "barbalho-thrust", muscle: "glutes", participants: 10, weeks: 12, directSets: 6, indirectSets: 0, reps: 10, rir: 1, frequency: 1, trainingYears: 4, observedPct: 3.7 },
];

const predictHoldout = (cohort: HoldoutCohort) => {
  const prior = REGIONAL_PRIORS[cohort.muscle];
  const effectiveSets = cohort.directSets + cohort.indirectSets * 0.4;
  const sessionSets = effectiveSets / Math.max(cohort.frequency, 1);
  const sessionDistribution =
    sessionSets <= 12 ? 1 : clamp(1 - (sessionSets - 12) * 0.018, 0.78, 1);
  return (
    prior.referencePct10Weeks *
    durationResponse(cohort.weeks) *
    setDoseResponse(effectiveSets) *
    effortResponse(cohort.rir) *
    repetitionResponse(cohort.reps, cohort.rir) *
    experienceResponse(cohort.trainingYears) *
    sessionDistribution
  );
};

const computeValidation = (): ModelValidation => {
  const predictions = HOLDOUT_COHORTS.map((cohort) => ({
    ...cohort,
    predicted: predictHoldout(cohort),
  }));
  const errors = predictions.map((row) => row.predicted - row.observedPct);
  const mae =
    errors.reduce((total, error) => total + Math.abs(error), 0) / errors.length;
  const bias = errors.reduce((total, error) => total + error, 0) / errors.length;
  const coverage = ([50, 80, 95, 99] as const).map((level) => {
    const inside = predictions.filter((row) => {
      const studySd = 2.6 + Math.abs(row.predicted) * 0.42;
      const halfWidth = Z_BY_LEVEL[level] * studySd;
      return (
        row.observedPct >= row.predicted - halfWidth &&
        row.observedPct <= row.predicted + halfWidth
      );
    }).length;
    return { level, observed: round((inside / predictions.length) * 100, 1) };
  });
  const calibrationError =
    coverage.reduce(
      (total, row) => total + Math.abs(row.observed - row.level),
      0,
    ) / coverage.length;
  return {
    holdoutCohorts: HOLDOUT_COHORTS.length,
    participants: HOLDOUT_COHORTS.reduce(
      (total, cohort) => total + cohort.participants,
      0,
    ),
    maePercentPoints: round(mae, 2),
    meanBiasPercentPoints: round(bias, 2),
    calibrationErrorPercentPoints: round(calibrationError, 1),
    coverage,
    scope:
      "Study-level regional hypertrophy means held out from coefficient calibration; not a personal-accuracy claim.",
  };
};

export const MODEL_VALIDATION = computeValidation();

/**
 * A deterministic hierarchical probabilistic projection.
 *
 * Population means are anchored to longitudinal regional hypertrophy studies.
 * Person-level genetics/response heterogeneity is represented in the
 * predictive variance, with a shared responder component so uncertainty does
 * not unrealistically cancel when muscles are summed.
 */
export function derivePhysique(
  program: TrainingProgram,
  profileOrMeasurements: PhysiqueProfile | PhysiqueMeasurements,
): PhysiqueResult {
  const profile: PhysiqueProfile =
    "measurements" in profileOrMeasurements
      ? profileOrMeasurements
      : { bodyType: "male", measurements: profileOrMeasurements };
  const sex = profile.bodyType === "female" ? "female" : "male";
  const measurements = profile.measurements;
  const age = safe(program.values.age, 28);
  const trainingYears = safe(program.values.trainingYears, 0);
  const weeks = safe(program.values.weeks, 12);
  const adherence = clamp(safe(program.values.adherence, 85) / 100, 0.2, 1);
  const proteinPerKg =
    safe(program.values.proteinGrams, 130) /
    Math.max(measurements.weightKg, 1);
  const tdee = estimateTdee(sex, age, measurements, program.daysPerWeek);
  const calorieBalance = safe(program.values.dailyCalories, tdee) - tdee;
  const skeletalMuscleMass = estimateSkeletalMuscleMass(sex, age, measurements);

  const confirmed = new Set(program.confirmedInputs ?? []);
  const confirmedMuscles = new Set(program.confirmedMuscles ?? []);
  const missingInputs = REQUIRED_GLOBAL_INPUTS.filter(
    (key) => !confirmed.has(key),
  ).map((key) => REQUIRED_INPUT_LABELS[key]);
  const missingMuscles = MUSCLE_GROUPS.filter(
    (muscle) => !confirmedMuscles.has(muscle.id),
  ).map((muscle) => `${muscle.label} exercise dose`);
  const allMissing = [...missingInputs, ...missingMuscles];
  const methodError = bodyFatError(program.bodyFatMethod);
  const longRangePenalty = Math.max(0, weeks - 24) / 80;
  const uncertaintyMultiplier =
    1 +
    Math.min(allMissing.length, 20) * 0.055 +
    methodError * 0.025 +
    longRangePenalty;

  const muscleProjections = {} as Record<MuscleGroupId, MuscleProjection>;
  const muscleSignals = {} as Record<MuscleGroupId, number>;

  for (const muscle of MUSCLE_GROUPS) {
    const setting = program.muscles[muscle.id] ?? {
      ...DEFAULT_MUSCLE_INPUTS[muscle.id],
      priority: 1 as MusclePriority,
    };
    const rowConfirmed = confirmedMuscles.has(muscle.id);
    const directSets = rowConfirmed
      ? safe(setting.sets, 0)
      : safe(program.values.weeklySets, 10);
    const indirectSets = rowConfirmed ? safe(setting.indirectSets, 0) : 0;
    // Indirect work is uncertain; 0.4 is a conservative prior rather than a
    // fixed anatomical "synergy" gain. Unconfirmed rows widen the interval.
    const effectiveSets = (directSets + indirectSets * 0.4) * adherence;
    const reps = rowConfirmed ? safe(setting.reps, 10) : 10;
    const rir = rowConfirmed ? safe(setting.rir, 2) : safe(program.values.rir, 2);
    const frequency = rowConfirmed ? safe(setting.frequency, 2) : 2;
    const setsPerSession = effectiveSets / Math.max(frequency, 1);
    const sessionDistribution =
      setsPerSession <= 12
        ? 1
        : clamp(1 - (setsPerSession - 12) * 0.018, 0.78, 1);
    const prior = REGIONAL_PRIORS[muscle.id];
    const meanPercent = clamp(
      prior.referencePct10Weeks *
        durationResponse(weeks) *
        setDoseResponse(effectiveSets) *
        effortResponse(rir) *
        repetitionResponse(reps, rir) *
        experienceResponse(trainingYears) *
        ageResponse(age) *
        proteinResponse(proteinPerKg, calorieBalance) *
        energyResponse(calorieBalance) *
        sleepResponse(program.values.sleepHours) *
        sessionDistribution,
      -8,
      45,
    );
    const baselineMassKg =
      skeletalMuscleMass * prior.massFraction;
    const meanGainKg = baselineMassKg * (meanPercent / 100);
    const evidencePenalty =
      prior.evidenceGrade === "limited"
        ? 1.28
        : prior.evidenceGrade === "adjacent"
          ? 1.14
          : 1;
    const responseSdPercent =
      (2.1 + Math.abs(meanPercent) * 0.48) *
      uncertaintyMultiplier *
      evidencePenalty;
    // Regional priors are MRI muscle-volume changes. The cube root converts
    // volume change to a linear mesh deformation without visual multipliers.
    const radialMeshChange = Math.cbrt(1 + meanPercent / 100) - 1;
    muscleSignals[muscle.id] = round(clamp(radialMeshChange, -0.04, 0.13), 5);
    muscleProjections[muscle.id] = {
      id: muscle.id,
      label: muscle.label,
      exercise: setting.exercise || "Study prior (exercise missing)",
      effectiveSets: round(effectiveSets, 1),
      meanPercent: round(meanPercent, 2),
      meanGainKg: round(meanGainKg, 3),
      responseSdPercent: round(responseSdPercent, 2),
      radialMeshChange: round(radialMeshChange, 5),
      evidenceGrade: prior.evidenceGrade,
      intervals: makeIntervals(meanPercent, responseSdPercent, -15, 65),
    };
  }

  const contractileGainKg = Object.values(muscleProjections).reduce(
    (total, projection) => total + projection.meanGainKg,
    0,
  );
  const days = weeks * 7;
  const adaptiveEnergyFraction = 0.72;
  const energyEquivalentChangeKg = clamp(
    (calorieBalance * days * adaptiveEnergyFraction) / 7700,
    -measurements.weightKg * 0.22,
    measurements.weightKg * 0.18,
  );
  const fatChangeKg =
    energyEquivalentChangeKg < 0
      ? energyEquivalentChangeKg * 0.78
      : energyEquivalentChangeKg * 0.56;
  const meanTrainingStimulus =
    Object.values(muscleProjections).reduce(
      (total, projection) => total + clamp(projection.effectiveSets / 14),
      0,
    ) / MUSCLE_GROUPS.length;
  const glycogenChangeKg = clamp(
    skeletalMuscleMass *
      0.006 *
      (meanTrainingStimulus - 0.35) *
      energyResponse(calorieBalance),
    -0.35,
    0.55,
  );
  const glycogenWaterKg = glycogenChangeKg * 3;
  const tissueBudgetKg =
    energyEquivalentChangeKg + Math.max(0, contractileGainKg) * 0.16;
  const otherLeanChangeKg =
    tissueBudgetKg -
    fatChangeKg -
    contractileGainKg -
    glycogenChangeKg -
    glycogenWaterKg;

  const fatMassKg =
    measurements.weightKg * (measurements.bodyFatPct / 100);
  // Wet skeletal muscle already contains baseline water and glycogen. To keep
  // the displayed components mutually exclusive, those two rows are changes
  // from baseline (zero), not a second copy of their mass inside lean tissue.
  const baselineGlycogenKg = 0;
  const baselineWaterKg = 0;
  const otherLeanKg =
    measurements.weightKg -
    fatMassKg -
    skeletalMuscleMass;

  const componentUncertainty = 0.32 * uncertaintyMultiplier;
  const components: BodyComponentProjection[] = [
    {
      id: "fat",
      label: "Fat tissue",
      startingKg: round(fatMassKg, 2),
      changeKg: round(fatChangeKg, 2),
      projectedKg: round(Math.max(0, fatMassKg + fatChangeKg), 2),
      uncertaintyKg: round(Math.max(0.6, Math.abs(fatChangeKg) * 0.28) * uncertaintyMultiplier, 2),
    },
    {
      id: "contractile",
      label: "Skeletal muscle tissue",
      startingKg: round(skeletalMuscleMass, 2),
      changeKg: round(contractileGainKg, 2),
      projectedKg: round(Math.max(0, skeletalMuscleMass + contractileGainKg), 2),
      uncertaintyKg: round(Math.max(0.35, Math.abs(contractileGainKg) * 0.48) * uncertaintyMultiplier, 2),
    },
    {
      id: "glycogen",
      label: "Glycogen shift",
      startingKg: round(baselineGlycogenKg, 2),
      changeKg: round(glycogenChangeKg, 2),
      projectedKg: round(baselineGlycogenKg + glycogenChangeKg, 2),
      uncertaintyKg: round(0.18 * uncertaintyMultiplier, 2),
    },
    {
      id: "water",
      label: "Water shift (glycogen-bound)",
      startingKg: round(baselineWaterKg, 2),
      changeKg: round(glycogenWaterKg, 2),
      projectedKg: round(baselineWaterKg + glycogenWaterKg, 2),
      uncertaintyKg: round(1.25 * uncertaintyMultiplier, 2),
    },
    {
      id: "otherLean",
      label: "Other lean / residual",
      startingKg: round(otherLeanKg, 2),
      changeKg: round(otherLeanChangeKg, 2),
      projectedKg: round(otherLeanKg + otherLeanChangeKg, 2),
      uncertaintyKg: round(Math.max(componentUncertainty, 0.55), 2),
    },
  ];

  const projectedWeightKg = components.reduce(
    (total, component) => total + component.projectedKg,
    0,
  );
  const projectedFatMass = components.find((component) => component.id === "fat")!
    .projectedKg;
  const projectedBodyFatPct =
    (projectedFatMass / Math.max(projectedWeightKg, 1)) * 100;
  const leanGainSdKg =
    (0.28 + Math.abs(contractileGainKg) * 0.46) * uncertaintyMultiplier;
  // Do not clip tail intervals to a hard "physiological maximum": doing so
  // can make 80/95/99% bands look identical and falsely precise. A normal
  // approximation may include implausible tails; that is preferable to hiding
  // uncertainty and is explicitly presented as a predictive estimate.
  const leanGainIntervals = makeIntervals(contractileGainKg, leanGainSdKg);
  const interval95 = leanGainIntervals.find((interval) => interval.level === 95)!;
  const readiness = Math.round(
    clamp(
      proteinResponse(proteinPerKg, calorieBalance) * 0.36 +
        sleepResponse(program.values.sleepHours) * 0.3 +
        adherence * 0.34,
    ) * 100,
  );
  const averageSets =
    Object.values(muscleProjections).reduce(
      (total, projection) => total + projection.effectiveSets,
      0,
    ) / MUSCLE_GROUPS.length;
  const maxRadialGrowth = Math.max(...Object.values(muscleSignals));
  const definition = clamp(
    (sex === "male" ? 32 - projectedBodyFatPct : 42 - projectedBodyFatPct) /
      (sex === "male" ? 26 : 34),
  );
  const recoveryLoad = clamp(
    Math.max(0, averageSets - 14) / 20 +
      Math.max(0, 7 - program.values.sleepHours) / 8,
  );
  const stage: PhysiqueResult["stage"] =
    weeks < 8
      ? "Foundation"
      : weeks < 16
        ? "Building"
        : weeks < 28
          ? "Momentum"
          : "Long-range estimate";
  const status =
    allMissing.length > 0
      ? `Estimate using ${allMissing.length} population prior${allMissing.length === 1 ? "" : "s"}`
      : "Complete-input probabilistic estimate";
  const guidance =
    allMissing.length > 0
      ? "Confirm the highlighted inputs to narrow the intervals; the centre estimate is not a guarantee."
      : "All required inputs are confirmed. Re-measure under the same conditions to update the posterior.";

  return {
    estimateLabel: "Estimate",
    adaptation: Math.round(clamp(contractileGainKg / Math.max(0.8, skeletalMuscleMass * 0.06)) * 100),
    readiness,
    growth: round(clamp(maxRadialGrowth / 0.08), 4),
    definition,
    stimulus: round(clamp(meanTrainingStimulus), 4),
    recoveryLoad,
    balance: readiness / 100,
    averageSets: round(averageSets, 1),
    proteinPerKg: round(proteinPerKg, 2),
    estimatedLeanGainKg: round(contractileGainKg, 2),
    lowerLeanGainKg: interval95.lower,
    upperLeanGainKg: interval95.upper,
    projectedWeightKg: round(projectedWeightKg, 2),
    startingBodyFatPct: measurements.bodyFatPct,
    projectedBodyFatPct: round(projectedBodyFatPct, 2),
    durationWeeks: weeks,
    stage,
    status,
    guidance,
    muscleSignals,
    baselineMuscularity: estimateBaselineMuscularity(
      sex,
      trainingYears,
      measurements,
    ),
    muscleProjections,
    components,
    leanGainIntervals,
    validation: MODEL_VALIDATION,
    missingInputs: allMissing,
    uncertaintyMultiplier: round(uncertaintyMultiplier, 2),
    modelVersion: MODEL_VERSION,
  };
}

export const getMetricDefinition = (id: MetricId) =>
  METRICS.find((definition) => definition.id === id);

export const getMuscleDefinition = (id: MuscleGroupId) =>
  MUSCLE_GROUPS.find((muscle) => muscle.id === id);

export function clampMetric(id: MetricId, value: number) {
  const definition = getMetricDefinition(id);
  if (!definition) return value;
  const stepped = Math.round(value / definition.step) * definition.step;
  return Math.min(definition.max, Math.max(definition.min, stepped));
}

export function cloneTrainingProgram(program: TrainingProgram): TrainingProgram {
  return {
    ...program,
    values: { ...program.values },
    confirmedInputs: [...(program.confirmedInputs ?? [])],
    confirmedMuscles: [...(program.confirmedMuscles ?? [])],
    muscles: MUSCLE_GROUPS.reduce((settings, muscle) => {
      settings[muscle.id] = { ...program.muscles[muscle.id] };
      return settings;
    }, {} as MuscleSettings),
  };
}

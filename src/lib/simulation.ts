import {
  Activity,
  Beef,
  CalendarRange,
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

export type MetricId =
  | "proteinPerKg"
  | "rir"
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
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export type MusclePriority = 1 | 2 | 3;

export type SimulationValues = Record<MetricId, number>;

export type MuscleSetting = {
  sets: number;
  priority: MusclePriority;
};

export type MuscleSettings = Record<MuscleGroupId, MuscleSetting>;

export type TrainingProgram = {
  id: "training-program";
  name: string;
  goal: GoalId;
  experience: ExperienceId;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: EquipmentId;
  values: SimulationValues;
  muscles: MuscleSettings;
};

export type MetricDefinition = {
  id: MetricId;
  label: string;
  shortLabel: string;
  unit: string;
  shortUnit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  accent: string;
  description: string;
  Icon: LucideIcon;
  describe: (value: number) => string;
};

export type MuscleDefinition = {
  id: MuscleGroupId;
  label: string;
  shortLabel: string;
  color: string;
};

export type PhysiqueResult = {
  adaptation: number;
  readiness: number;
  growth: number;
  definition: number;
  stimulus: number;
  recoveryLoad: number;
  balance: number;
  averageSets: number;
  stage: "Foundation" | "Building" | "Momentum" | "High adaptation";
  status: string;
  guidance: string;
  muscleSignals: Record<MuscleGroupId, number>;
};

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

export const METRICS: MetricDefinition[] = [
  {
    id: "proteinPerKg",
    label: "Daily protein",
    shortLabel: "Protein",
    unit: "grams per kilogram",
    shortUnit: "g/kg",
    min: 0.6,
    max: 2.6,
    step: 0.1,
    initial: 1.6,
    accent: "#6f6af8",
    description: "Relative to body weight",
    Icon: Beef,
    describe: (value) =>
      value < 1.1
        ? "Low support"
        : value < 1.5
          ? "Building"
          : value <= 2.1
            ? "Well supported"
            : "Upper range",
  },
  {
    id: "rir",
    label: "Reps in reserve",
    shortLabel: "Effort",
    unit: "reps in reserve",
    shortUnit: "RIR",
    min: 0,
    max: 5,
    step: 1,
    initial: 2,
    accent: "#f3925d",
    description: "Effort left at the end of a set",
    Icon: Gauge,
    describe: (value) =>
      value === 0
        ? "At failure"
        : value <= 2
          ? "Hard"
          : value <= 3
            ? "Productive"
            : "Conservative",
  },
  {
    id: "weeks",
    label: "Training timeline",
    shortLabel: "Timeline",
    unit: "weeks",
    shortUnit: "weeks",
    min: 4,
    max: 52,
    step: 1,
    initial: 12,
    accent: "#4e93e6",
    description: "Length of the current training block",
    Icon: CalendarRange,
    describe: (value) =>
      value < 8 ? "Short block" : value < 17 ? "Training cycle" : "Long horizon",
  },
  {
    id: "bodyFat",
    label: "Estimated body fat",
    shortLabel: "Body fat",
    unit: "percent",
    shortUnit: "%",
    min: 6,
    max: 45,
    step: 1,
    initial: 18,
    accent: "#31a889",
    description: "A visual estimate, not a diagnosis",
    Icon: Activity,
    describe: (value) =>
      value < 13 ? "Lean range" : value < 23 ? "Moderate range" : "Higher range",
  },
  {
    id: "sleepHours",
    label: "Average sleep",
    shortLabel: "Sleep",
    unit: "hours per night",
    shortUnit: "hrs",
    min: 4,
    max: 10,
    step: 0.5,
    initial: 7.5,
    accent: "#7866d8",
    description: "A recovery-capacity input",
    Icon: MoonStar,
    describe: (value) =>
      value < 6 ? "Recovery limited" : value < 7.5 ? "Adequate" : "Well supported",
  },
  {
    id: "adherence",
    label: "Plan adherence",
    shortLabel: "Adherence",
    unit: "percent completed",
    shortUnit: "%",
    min: 40,
    max: 100,
    step: 5,
    initial: 85,
    accent: "#2f9a61",
    description: "How much of the plan is completed",
    Icon: Target,
    describe: (value) =>
      value < 65 ? "Inconsistent" : value < 85 ? "Developing" : "Repeatable",
  },
  {
    id: "calorieBalance",
    label: "Daily calorie balance",
    shortLabel: "Energy",
    unit: "kilocalories per day",
    shortUnit: "kcal",
    min: -700,
    max: 500,
    step: 50,
    initial: 150,
    accent: "#dc715d",
    description: "Relative to estimated maintenance",
    Icon: Flame,
    describe: (value) =>
      value < -150 ? "Deficit" : value > 150 ? "Surplus" : "Near maintenance",
  },
];

export const MUSCLE_GROUPS: MuscleDefinition[] = [
  { id: "chest", label: "Chest", shortLabel: "Chest", color: "#786ff1" },
  { id: "back", label: "Back", shortLabel: "Back", color: "#4e8fe2" },
  { id: "shoulders", label: "Shoulders", shortLabel: "Delts", color: "#9f75db" },
  { id: "biceps", label: "Biceps", shortLabel: "Biceps", color: "#e88b63" },
  { id: "triceps", label: "Triceps", shortLabel: "Triceps", color: "#dc6f74" },
  { id: "core", label: "Core", shortLabel: "Core", color: "#38a68a" },
  { id: "quads", label: "Quadriceps", shortLabel: "Quads", color: "#d6a23d" },
  { id: "hamstrings", label: "Hamstrings", shortLabel: "Hams", color: "#c98c42" },
  { id: "glutes", label: "Glutes", shortLabel: "Glutes", color: "#d46e91" },
  { id: "calves", label: "Calves", shortLabel: "Calves", color: "#559e7b" },
];

export const INITIAL_VALUES = METRICS.reduce(
  (values, metric) => ({ ...values, [metric.id]: metric.initial }),
  {} as SimulationValues,
);

export const createMuscleSettings = (
  overrides: Partial<MuscleSettings> = {},
): MuscleSettings =>
  MUSCLE_GROUPS.reduce((settings, muscle) => {
    settings[muscle.id] =
      overrides[muscle.id] ?? {
        sets: 0,
        priority: 1,
      };
    return settings;
  }, {} as MuscleSettings);

export function createDefaultTrainingProgram(): TrainingProgram {
  return {
    id: "training-program",
    name: "My training program",
    goal: GOALS[0].id,
    experience: EXPERIENCE_LEVELS[0].id,
    daysPerWeek: 3,
    sessionMinutes: 60,
    equipment: EQUIPMENT_OPTIONS[0].id,
    values: { ...INITIAL_VALUES },
    muscles: createMuscleSettings(),
  };
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

const average = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) /
  Math.max(values.length, 1);

const getGoalEnergyTarget = (goal: GoalId) => {
  if (goal === "build") return 200;
  if (goal === "cut") return -350;
  if (goal === "strength") return 100;
  return 0;
};

/**
 * An explainable, deterministic training model. It visualizes relationships
 * between inputs and deliberately avoids predicting kilograms of muscle,
 * clinical body composition, or an exact future appearance.
 */
export function derivePhysique(program: TrainingProgram): PhysiqueResult {
  const { values, muscles } = program;
  const adherence = values.adherence / 100;
  const proteinSupport = smoothstep(0.65, 1.65, values.proteinPerKg);
  const sleepSupport = smoothstep(4.5, 8.3, values.sleepHours);
  const effortQuality = clamp(1 - Math.abs(values.rir - 2) * 0.13, 0.5, 1);
  const failureCost = values.rir < 1 ? 0.24 : values.rir < 2 ? 0.08 : 0;

  const muscleSignals = MUSCLE_GROUPS.reduce((signals, definition) => {
    const setting = muscles[definition.id];
    const volumeSignal = smoothstep(2, 18, setting.sets);
    const priorityBoost = 0.84 + (setting.priority - 1) * 0.08;
    signals[definition.id] = clamp(
      volumeSignal * effortQuality * adherence * priorityBoost,
    );
    return signals;
  }, {} as Record<MuscleGroupId, number>);

  const averageSets = average(
    MUSCLE_GROUPS.map((muscle) => muscles[muscle.id].sets),
  );
  const volumeSignal = average(Object.values(muscleSignals));
  const excessVolume = average(
    MUSCLE_GROUPS.map((muscle) =>
      smoothstep(18, 28, muscles[muscle.id].sets),
    ),
  );
  const sleepDeficit = 1 - sleepSupport;
  const recoveryLoad = clamp(
    excessVolume * 0.58 + failureCost + sleepDeficit * 0.32,
  );
  const recoveryCapacity = clamp(
    sleepSupport * 0.55 + proteinSupport * 0.28 + adherence * 0.17,
  );
  const recoveryFactor = clamp(
    0.6 + recoveryCapacity * 0.4 - recoveryLoad * 0.32,
    0.35,
    1,
  );

  const energyTarget = getGoalEnergyTarget(program.goal);
  const energyAlignment = clamp(
    1 - Math.abs(values.calorieBalance - energyTarget) / 900,
    0.4,
    1,
  );
  const stimulus = clamp(volumeSignal * (0.54 + effortQuality * 0.46));
  const timeAdaptation = 1 - Math.exp(-values.weeks / 14);
  const goalGrowthFactor =
    program.goal === "build"
      ? 1
      : program.goal === "recomp"
        ? 0.88
        : program.goal === "strength"
          ? 0.8
          : 0.68;

  const growth = clamp(
    stimulus *
      timeAdaptation *
      (0.54 + proteinSupport * 0.46) *
      recoveryFactor *
      energyAlignment *
      goalGrowthFactor,
  );
  const leanness = clamp((42 - values.bodyFat) / 36);
  const deficitDefinition =
    program.goal === "cut"
      ? smoothstep(0, 600, Math.max(0, -values.calorieBalance))
      : 0;
  const definition = clamp(
    leanness * 0.72 + growth * 0.22 + deficitDefinition * 0.06,
  );
  const balance = clamp(
    recoveryCapacity * 0.48 +
      energyAlignment * 0.24 +
      (1 - recoveryLoad) * 0.28,
  );
  const readiness = Math.round(
    clamp(recoveryCapacity * 0.72 + (1 - recoveryLoad) * 0.28) * 100,
  );
  const adaptation = Math.round(
    clamp(
      growth * 0.66 +
        definition * 0.12 +
        balance * stimulus * 0.16 +
        adherence * timeAdaptation * 0.06,
    ) * 100,
  );

  const stage: PhysiqueResult["stage"] =
    adaptation < 24
      ? "Foundation"
      : adaptation < 46
        ? "Building"
        : adaptation < 70
          ? "Momentum"
          : "High adaptation";

  const status =
    recoveryLoad > 0.55
      ? "Recovery is the limiter"
      : adherence < 0.7
        ? "Consistency is the limiter"
        : proteinSupport < 0.58
          ? "Nutrition support is low"
          : stimulus < 0.35
            ? "More training signal available"
            : balance > 0.78
              ? "Inputs are well balanced"
              : "Adaptation is building";

  const guidance =
    recoveryLoad > 0.55
      ? "Reduce high-volume muscle groups or leave another rep in reserve."
      : adherence < 0.7
        ? "A smaller repeatable plan will outperform a larger plan that is often missed."
        : proteinSupport < 0.58
          ? "Protein support is trailing the selected training demand."
          : sleepDeficit > 0.45
            ? "More sleep would improve recovery for this program."
            : stimulus < 0.35
              ? "Raise weekly sets for one or two priority muscle groups."
              : "The selected inputs support one another. Keep the plan repeatable.";

  return {
    adaptation,
    readiness,
    growth,
    definition,
    stimulus,
    recoveryLoad,
    balance,
    averageSets,
    stage,
    status,
    guidance,
    muscleSignals,
  };
}

export const getMetricDefinition = (id: MetricId) =>
  METRICS.find((metric) => metric.id === id);

export const getMuscleDefinition = (id: MuscleGroupId) =>
  MUSCLE_GROUPS.find((muscle) => muscle.id === id);

export function clampMetric(id: MetricId, value: number) {
  const metric = getMetricDefinition(id);
  if (!metric) return value;
  const stepped = Math.round(value / metric.step) * metric.step;
  return Math.min(metric.max, Math.max(metric.min, stepped));
}

export function cloneTrainingProgram(
  program: TrainingProgram,
): TrainingProgram {
  return {
    ...program,
    values: { ...program.values },
    muscles: MUSCLE_GROUPS.reduce((settings, muscle) => {
      settings[muscle.id] = { ...program.muscles[muscle.id] };
      return settings;
    }, {} as MuscleSettings),
  };
}

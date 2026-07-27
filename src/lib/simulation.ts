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

export type MetricId =
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
  targetMuscles: MuscleGroupId[];
  values: SimulationValues;
  muscles: MuscleSettings;
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

export type PhysiqueResult = {
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
    id: "proteinGrams",
    group: "recovery",
    label: "Protein intake",
    question: "How much protein do you eat each day?",
    unit: "grams per day",
    shortUnit: "g",
    min: 40,
    max: 250,
    step: 5,
    initial: 130,
    accent: "#6f6af8",
    description: "Enter your average total protein intake for one day.",
    lowLabel: "40 grams",
    highLabel: "250 grams",
    recommendation: "Use your typical daily total rather than your best day.",
    Icon: Beef,
    describe: (value) =>
      value < 75
        ? "May limit recovery"
        : value < 110
          ? "Some support"
          : value <= 180
            ? "Supports training"
            : "Above model target",
  },
  {
    id: "rir",
    group: "training",
    label: "Reps left after each set",
    question: "How hard do your working sets feel?",
    unit: "reps in reserve",
    shortUnit: "reps left",
    min: 0,
    max: 5,
    step: 1,
    initial: 2,
    accent: "#f3925d",
    description: "Estimate how many clean reps you could still do when you stop.",
    lowLabel: "No reps left",
    highLabel: "5 reps left",
    recommendation: "A useful default for most working sets is 1–3 reps left.",
    Icon: Gauge,
    describe: (value) =>
      value === 0
        ? "Maximum effort"
        : value <= 2
          ? "Challenging"
          : value <= 3
            ? "Moderate effort"
            : "Plenty left",
  },
  {
    id: "weeklySets",
    group: "training",
    label: "Weekly hard sets",
    question: "How many hard sets will each muscle average per week?",
    unit: "hard sets per muscle per week",
    shortUnit: "sets",
    min: 4,
    max: 24,
    step: 1,
    initial: 12,
    accent: "#4d4f57",
    description: "Use the weekly average for a typical trained muscle group.",
    lowLabel: "4 sets",
    highLabel: "24 sets",
    recommendation: "Most people can start around 8–14 hard sets per muscle.",
    Icon: Dumbbell,
    describe: (value) =>
      value < 8
        ? "Low volume"
        : value <= 16
          ? "Productive range"
          : "High volume",
  },
  {
    id: "weeks",
    group: "startingPoint",
    label: "Plan length",
    question: "How long will you follow this plan?",
    unit: "weeks",
    shortUnit: "weeks",
    min: 4,
    max: 52,
    step: 1,
    initial: 12,
    accent: "#4e93e6",
    description: "Set the time window you want the model to illustrate.",
    lowLabel: "4 weeks",
    highLabel: "52 weeks",
    recommendation: "Eight to sixteen weeks is an easy planning window to review.",
    Icon: CalendarRange,
    describe: (value) =>
      value < 8
        ? "Short check-in"
        : value < 17
          ? "Training block"
          : "Long-range view",
  },
  {
    id: "bodyFat",
    group: "startingPoint",
    label: "Estimated body-fat level",
    question: "What is your rough body-fat estimate?",
    unit: "percent",
    shortUnit: "%",
    min: 6,
    max: 45,
    step: 1,
    initial: 18,
    accent: "#31a889",
    description: "A rough visual estimate is enough; this is not a health assessment.",
    lowLabel: "More defined",
    highLabel: "Less defined",
    recommendation: "If you are unsure, leave the default and treat the result as illustrative.",
    Icon: Activity,
    describe: (value) =>
      value < 13
        ? "More definition"
        : value < 23
          ? "Middle estimate"
          : "Less definition",
  },
  {
    id: "sleepHours",
    group: "recovery",
    label: "Sleep per night",
    question: "How much sleep do you usually get?",
    unit: "hours per night",
    shortUnit: "hours",
    min: 4,
    max: 10,
    step: 0.5,
    initial: 7.5,
    accent: "#7866d8",
    description: "Use your normal week, not your best or worst night.",
    lowLabel: "4 hours",
    highLabel: "10 hours",
    recommendation: "Pick the amount you can consistently get on an average night.",
    Icon: MoonStar,
    describe: (value) =>
      value < 6
        ? "Recovery may lag"
        : value < 7.5
          ? "Some recovery"
          : "Strong recovery",
  },
  {
    id: "adherence",
    group: "training",
    label: "Expected workout consistency",
    question: "How many planned workouts will you complete?",
    unit: "percent completed",
    shortUnit: "%",
    min: 40,
    max: 100,
    step: 5,
    initial: 85,
    accent: "#2f9a61",
    description: "Choose a realistic average, including busy weeks and missed sessions.",
    lowLabel: "4 in 10",
    highLabel: "Every workout",
    recommendation: "Use your realistic average rather than a perfect-week target.",
    Icon: Target,
    describe: (value) =>
      value < 65
        ? "Often interrupted"
        : value < 85
          ? "Mostly consistent"
          : "Very consistent",
  },
  {
    id: "calorieBalance",
    group: "recovery",
    label: "Calories versus maintenance",
    question: "Are you eating less, the same, or more?",
    unit: "kilocalories per day",
    shortUnit: "kcal/day",
    min: -700,
    max: 500,
    step: 50,
    initial: 150,
    accent: "#dc715d",
    description: "Compare your intake with the amount that keeps your weight stable.",
    lowLabel: "Eat less",
    highLabel: "Eat more",
    recommendation: "Zero means maintenance; negative is less and positive is more.",
    Icon: Flame,
    describe: (value) =>
      value < -150
        ? "Eating less"
        : value > 150
          ? "Eating more"
          : "Near maintenance",
  },
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

export const MUSCLE_TARGETS: Array<{
  id: MuscleGroupId;
  label: string;
}> = MUSCLE_GROUPS.map(({ id, label }) => ({ id, label }));

const TARGET_SYNERGIES: Record<
  MuscleGroupId,
  Partial<Record<MuscleGroupId, number>>
> = {
  chest: { shoulders: 0.3, triceps: 0.35 },
  back: { shoulders: 0.25, biceps: 0.4, forearms: 0.55 },
  shoulders: { chest: 0.15, back: 0.15, triceps: 0.3 },
  biceps: { back: 0.25, forearms: 0.45 },
  triceps: { chest: 0.22, shoulders: 0.22 },
  forearms: { back: 0.25, biceps: 0.35 },
  core: { back: 0.1 },
  quads: { glutes: 0.3, calves: 0.12 },
  hamstrings: { glutes: 0.4, calves: 0.12 },
  glutes: { hamstrings: 0.35, quads: 0.2 },
  calves: {},
};

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
    targetMuscles: [],
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

type PhysiqueMeasurements = {
  heightCm: number;
  weightKg: number;
  bodyFatPct: number;
};

/**
 * An explainable projection model for the MVP. Starting measurements establish
 * body composition; explicit training and recovery inputs estimate a bounded
 * lean-mass range over the selected duration. The range is illustrative rather
 * than a medical or guaranteed prediction.
 */
export function derivePhysique(
  program: TrainingProgram,
  measurements: PhysiqueMeasurements,
): PhysiqueResult {
  const { values } = program;
  const adherence = values.adherence / 100;
  const proteinPerKg =
    values.proteinGrams / Math.max(measurements.weightKg, 1);
  const proteinSupport = smoothstep(0.75, 1.65, proteinPerKg);
  const sleepSupport = smoothstep(5, 8.5, values.sleepHours);
  const effortQuality =
    values.rir === 0
      ? 0.88
      : values.rir <= 2
        ? 1
        : clamp(1 - (values.rir - 2) * 0.14, 0.58, 1);

  const completedWeeklySets = values.weeklySets * adherence;
  const volumeSignal = smoothstep(3, 15, completedWeeklySets);
  const highVolumeCost = smoothstep(18, 24, values.weeklySets) * 0.22;
  const stimulus = clamp(
    volumeSignal * effortQuality * (1 - highVolumeCost),
  );
  const recoveryCapacity = clamp(
    proteinSupport * 0.52 + sleepSupport * 0.48,
  );
  const recoveryLoad = clamp(
    highVolumeCost + (values.rir === 0 ? 0.1 : 0) +
      (1 - sleepSupport) * 0.18,
  );
  const recoveryFactor = clamp(
    (0.6 + recoveryCapacity * 0.4) * (1 - recoveryLoad * 0.24),
    0.45,
    1,
  );

  const monthlyGainRate = 0.006;
  const durationMonths = values.weeks / 4.345;
  const potentialLeanGain =
    measurements.weightKg * monthlyGainRate * durationMonths;
  const estimatedLeanGainKg = Math.max(
    0,
    potentialLeanGain * stimulus * recoveryFactor,
  );
  const lowerLeanGainKg = estimatedLeanGainKg * 0.75;
  const upperLeanGainKg = estimatedLeanGainKg * 1.25;
  const projectedWeightKg =
    measurements.weightKg + estimatedLeanGainKg;
  const startingFatMassKg =
    measurements.weightKg * (measurements.bodyFatPct / 100);
  const projectedBodyFatPct = clamp(
    (startingFatMassKg / Math.max(projectedWeightKg, 1)) * 100,
    3,
    55,
  );

  // Visual growth is normalized to the person's frame and used exactly once
  // by the anatomy shader. A selected target receives the full dose, while
  // anatomically related muscles receive a smaller compound-training signal.
  const growth = clamp(
    estimatedLeanGainKg /
      Math.max(1.1, measurements.weightKg * 0.025),
  );
  const definition = clamp((42 - projectedBodyFatPct) / 36);
  const balance = recoveryCapacity;
  const readiness = Math.round(recoveryCapacity * 100);
  const adaptation = Math.round(growth * 100);
  const balancedTargeting =
    program.targetMuscles.length === 0 ||
    program.targetMuscles.length === MUSCLE_GROUPS.length;
  const muscleSignals = MUSCLE_GROUPS.reduce((signals, muscle) => {
    if (balancedTargeting) {
      signals[muscle.id] = 1;
      return signals;
    }

    signals[muscle.id] = Math.max(
      ...program.targetMuscles.map((target) =>
        muscle.id === target
          ? 1
          : TARGET_SYNERGIES[target][muscle.id] ?? 0,
      ),
    );
    return signals;
  }, {} as Record<MuscleGroupId, number>);

  const stage: PhysiqueResult["stage"] =
    values.weeks < 8
      ? "Foundation"
      : values.weeks < 16
        ? "Building"
        : values.weeks < 28
          ? "Momentum"
          : "High adaptation";

  const status =
    adherence < 0.65
      ? "Consistency limits completed volume"
      : proteinSupport < 0.7
        ? "Protein is low for this body weight"
        : sleepSupport < 0.65
          ? "Sleep limits recovery"
          : stimulus < 0.45
            ? "Training dose is modest"
            : "Inputs support steady progress";

  const guidance =
    adherence < 0.65
      ? "Reduce planned volume until the weekly target is repeatable."
      : proteinSupport < 0.7
        ? "Raise daily protein relative to the current body weight."
        : sleepSupport < 0.65
          ? "More consistent sleep would improve the projection."
          : stimulus < 0.45
            ? "Add a small amount of weekly hard-set volume."
            : "Keep the plan stable and reassess after the selected duration.";

  return {
    adaptation,
    readiness,
    growth,
    definition,
    stimulus,
    recoveryLoad,
    balance,
    averageSets: values.weeklySets,
    proteinPerKg,
    estimatedLeanGainKg,
    lowerLeanGainKg,
    upperLeanGainKg,
    projectedWeightKg,
    startingBodyFatPct: measurements.bodyFatPct,
    projectedBodyFatPct,
    durationWeeks: values.weeks,
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

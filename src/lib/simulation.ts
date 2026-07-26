import {
  Activity,
  BicepsFlexed,
  Clock3,
  Dumbbell,
  LucideIcon,
} from "lucide-react";

export type MetricId = "protein" | "volume" | "intensity" | "weeks";

export type SimulationValues = Record<MetricId, number>;

export type MetricDefinition = {
  id: MetricId;
  label: string;
  shortLabel: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  accent: string;
  description: string;
  Icon: LucideIcon;
  describe: (value: number) => string;
};

export type PhysiqueResult = {
  adaptation: number;
  growth: number;
  definition: number;
  stimulus: number;
  recoveryLoad: number;
  balance: number;
  stage: "Foundation" | "Building" | "Momentum" | "High adaptation";
  status: string;
  guidance: string;
};

export const METRICS: MetricDefinition[] = [
  {
    id: "protein",
    label: "Protein intake",
    shortLabel: "Protein",
    unit: "g / day",
    min: 40,
    max: 240,
    step: 1,
    initial: 120,
    accent: "#ccff5b",
    description: "Supports repair and adaptation",
    Icon: BicepsFlexed,
    describe: (value) =>
      value < 80 ? "Low support" : value < 140 ? "Solid base" : value < 190 ? "High support" : "Upper range",
  },
  {
    id: "volume",
    label: "Workout volume",
    shortLabel: "Volume",
    unit: "sets / week",
    min: 0,
    max: 30,
    step: 1,
    initial: 12,
    accent: "#71ead8",
    description: "Total weekly working sets",
    Icon: Dumbbell,
    describe: (value) =>
      value < 6 ? "Light" : value < 14 ? "Moderate" : value < 23 ? "Productive" : "Demanding",
  },
  {
    id: "intensity",
    label: "Training intensity",
    shortLabel: "Intensity",
    unit: "RPE",
    min: 1,
    max: 10,
    step: 0.5,
    initial: 7,
    accent: "#9b8cff",
    description: "How hard each set feels",
    Icon: Activity,
    describe: (value) =>
      value < 4 ? "Easy" : value < 7 ? "Moderate" : value < 9 ? "Hard" : "Near max",
  },
  {
    id: "weeks",
    label: "Training time",
    shortLabel: "Timeline",
    unit: "weeks",
    min: 1,
    max: 52,
    step: 1,
    initial: 8,
    accent: "#ffb86b",
    description: "Consistency compounds over time",
    Icon: Clock3,
    describe: (value) =>
      value < 5 ? "Starting" : value < 13 ? "Early cycle" : value < 27 ? "Building" : "Long term",
  },
];

export const INITIAL_VALUES = METRICS.reduce(
  (values, metric) => ({ ...values, [metric.id]: metric.initial }),
  {} as SimulationValues,
);

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

/**
 * A deterministic visualization model with diminishing returns and a recovery
 * cost at very high training loads. It is intentionally illustrative rather
 * than a biological prediction.
 */
export function derivePhysique(values: SimulationValues): PhysiqueResult {
  const proteinSupport = smoothstep(45, 175, values.protein);
  const volumeBase = smoothstep(2, 20, values.volume);
  const excessVolume = smoothstep(22, 30, values.volume);
  const intensityBase = smoothstep(2.5, 8.5, values.intensity);
  const maxEffortCost = smoothstep(8.7, 10, values.intensity);

  const stimulus = clamp(
    volumeBase * (0.38 + intensityBase * 0.62) -
      excessVolume * maxEffortCost * 0.18,
  );
  const recoveryLoad = clamp(
    excessVolume * 0.62 +
      maxEffortCost * 0.44 +
      volumeBase * maxEffortCost * 0.22,
  );
  const recoveryFactor = 1 - recoveryLoad * 0.3;
  const timeAdaptation = 1 - Math.exp(-values.weeks / 16);
  const synergy =
    stimulus *
    (0.46 + proteinSupport * 0.54) *
    recoveryFactor;

  const growth = clamp(synergy * timeAdaptation);
  const definition = clamp(
    growth * (0.58 + intensityBase * 0.42) * (1 - recoveryLoad * 0.08),
  );
  const balance = clamp(
    1 -
      Math.abs(proteinSupport - stimulus) * 0.52 -
      recoveryLoad * 0.28,
  );
  const adaptation = Math.round(
    clamp(
      growth * 0.88 +
        balance * stimulus * 0.08 +
        timeAdaptation * stimulus * 0.04,
    ) * 100,
  );

  const stage: PhysiqueResult["stage"] =
    adaptation < 22
      ? "Foundation"
      : adaptation < 45
        ? "Building"
        : adaptation < 70
          ? "Momentum"
          : "High adaptation";

  const isOverreaching = recoveryLoad > 0.58;
  const status = isOverreaching
    ? "Recovery bottleneck"
    : stimulus < 0.36
      ? "More training signal available"
      : balance > 0.8
        ? "Inputs well balanced"
        : proteinSupport + 0.12 < stimulus
          ? "Nutrition is trailing"
          : "Adaptation is building";

  const guidance = isOverreaching
    ? "High volume and intensity create diminishing returns. Try easing one of them."
    : stimulus < 0.36
      ? "Raise weekly volume or effort gradually to strengthen the stimulus."
      : balance > 0.8
        ? "Your inputs support one another. Keep the routine repeatable."
        : proteinSupport + 0.12 < stimulus
          ? "The training demand is outpacing protein support in this visual model."
          : "Time is the multiplier here—consistency lets the signal compound.";

  return {
    adaptation,
    growth,
    definition,
    stimulus,
    recoveryLoad,
    balance,
    stage,
    status,
    guidance,
  };
}

export type VariableId = "protein" | "volume" | "intensity" | "weeks";

export type SimulationValues = Record<VariableId, number>;

export type VariableDefinition = {
  id: VariableId;
  label: string;
  unit: string;
  shortUnit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  accent: string;
};

export type PhysiqueResult = {
  adaptation: number;
  growth: number;
  definition: number;
  stimulus: number;
};

export const VARIABLES: VariableDefinition[] = [
  {
    id: "protein",
    label: "Protein",
    unit: "grams per day",
    shortUnit: "g/day",
    min: 40,
    max: 240,
    step: 1,
    initial: 120,
    accent: "#1b1d20",
  },
  {
    id: "volume",
    label: "Volume",
    unit: "sets per week",
    shortUnit: "sets/wk",
    min: 0,
    max: 30,
    step: 1,
    initial: 12,
    accent: "#1b1d20",
  },
  {
    id: "intensity",
    label: "Intensity",
    unit: "RPE",
    shortUnit: "RPE",
    min: 1,
    max: 10,
    step: 0.5,
    initial: 7,
    accent: "#1b1d20",
  },
  {
    id: "weeks",
    label: "Time",
    unit: "weeks",
    shortUnit: "weeks",
    min: 1,
    max: 52,
    step: 1,
    initial: 8,
    accent: "#1b1d20",
  },
];

export const INITIAL_VALUES = VARIABLES.reduce(
  (values, variable) => ({
    ...values,
    [variable.id]: variable.initial,
  }),
  {} as SimulationValues,
);

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

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
  const growth = clamp(
    stimulus *
      (0.46 + proteinSupport * 0.54) *
      recoveryFactor *
      timeAdaptation,
  );
  const definition = clamp(
    growth *
      (0.58 + intensityBase * 0.42) *
      (1 - recoveryLoad * 0.08),
  );
  const adaptation = Math.round(
    clamp(
      growth * 0.92 +
        timeAdaptation * stimulus * 0.08,
    ) * 100,
  );

  return {
    adaptation,
    growth,
    definition,
    stimulus,
  };
}

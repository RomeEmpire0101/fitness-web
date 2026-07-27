import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const entry = new URL("../src/lib/simulation.ts", import.meta.url);
const bundled = await build({
  entryPoints: [fileURLToPath(entry)],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  write: false,
});
const source = bundled.outputFiles[0].text;
const model = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const {
  MODEL_VALIDATION,
  MUSCLE_GROUPS,
  createDefaultTrainingProgram,
  derivePhysique,
} = model;

assert(
  MODEL_VALIDATION.holdoutCohorts >= 10,
  "Validation must retain at least ten unseen cohort outcomes.",
);
assert(
  MODEL_VALIDATION.participants >= 650,
  "Holdout validation must represent at least 650 participant-records.",
);
assert(
  Number.isFinite(MODEL_VALIDATION.maePercentPoints) &&
    MODEL_VALIDATION.maePercentPoints > 0 &&
    MODEL_VALIDATION.maePercentPoints < 10,
  "Holdout MAE must be finite, non-zero, and reported in percentage points.",
);
assert.equal(
  MODEL_VALIDATION.coverage.map(({ level }) => level).join(","),
  "50,80,95,99",
  "Validation must report 50/80/95/99% coverage.",
);

const profile = {
  bodyType: "male",
  measurements: {
    heightCm: 175,
    weightKg: 75,
    bodyFatPct: 18,
    waistCm: 82,
    neckCm: 37,
    chestCm: 94,
    upperArmCm: 31,
    thighCm: 53,
    hipCm: 94,
  },
};
const missingProgram = createDefaultTrainingProgram();
const missingResult = derivePhysique(missingProgram, profile);

const completeProgram = createDefaultTrainingProgram();
completeProgram.bodyFatMethod = "dexa";
completeProgram.confirmedInputs = [
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
completeProgram.confirmedMuscles = MUSCLE_GROUPS.map(({ id }) => id);
const completeResult = derivePhysique(completeProgram, profile);

assert.equal(completeResult.estimateLabel, "Estimate");
assert.equal(
  completeResult.leanGainIntervals.map(({ level }) => level).join(","),
  "50,80,95,99",
  "Personal output must report all required prediction intervals.",
);
for (let index = 1; index < completeResult.leanGainIntervals.length; index += 1) {
  const previous = completeResult.leanGainIntervals[index - 1];
  const current = completeResult.leanGainIntervals[index];
  assert(
    current.upper - current.lower > previous.upper - previous.lower,
    "Each broader prediction interval must be strictly wider.",
  );
}
assert(
  missingResult.uncertaintyMultiplier > completeResult.uncertaintyMultiplier,
  "Missing inputs must widen uncertainty.",
);
assert.equal(
  Object.keys(completeResult.muscleProjections).length,
  MUSCLE_GROUPS.length,
  "Every rendered muscle group must have an independent projection.",
);
assert.equal(
  completeResult.components.map(({ id }) => id).join(","),
  "fat,contractile,glycogen,water,otherLean",
  "Body components must remain separate.",
);

const lowDose = structuredClone(completeProgram);
const highDose = structuredClone(completeProgram);
lowDose.muscles.quads.sets = 5;
highDose.muscles.quads.sets = 20;
const lowGrowth = derivePhysique(lowDose, profile).muscleProjections.quads.meanPercent;
const highGrowth =
  derivePhysique(highDose, profile).muscleProjections.quads.meanPercent;
assert(highGrowth > lowGrowth, "More completed dose should increase the mean.");
assert(
  highGrowth / lowGrowth < 4,
  "Set-dose response must show nonlinear diminishing returns.",
);

const labSource = await import("node:fs/promises").then(({ readFile }) =>
  readFile(new URL("../src/components/lab/LabScreen.tsx", import.meta.url), "utf8"),
);
assert(
  labSource.includes("Confirm ${muscle.label} inputs") &&
    labSource.includes("current.confirmedMuscles.filter("),
  "Muscle-dose rows must require explicit confirmation and invalidate it after edits.",
);

console.log(
  `Scientific model checks passed: holdout MAE ${MODEL_VALIDATION.maePercentPoints} pp across ${MODEL_VALIDATION.holdoutCohorts} cohorts.`,
);

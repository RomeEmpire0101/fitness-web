import {
  createDefaultTrainingProgram,
  MUSCLE_GROUPS,
  TrainingProgram,
} from "./simulation";

export type PlanExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
};

export type PlanSession = {
  id: string;
  dayIndex: number;
  title: string;
  focus: string;
  duration: number;
  exercises: PlanExercise[];
};

export type LoggedSet = {
  id: string;
  weight: number | "";
  reps: number | "";
  rir: number;
  complete: boolean;
};

export type LoggedExercise = {
  id: string;
  planExerciseId: string;
  name: string;
  muscle: string;
  sets: LoggedSet[];
};

export type WorkoutFeedback = "easy" | "right" | "hard";

export type WorkoutSession = {
  id: string;
  planSessionId: string;
  title: string;
  startedAt: string;
  completedAt: string | null;
  feedback: WorkoutFeedback | null;
  exercises: LoggedExercise[];
};

export type FitnessData = {
  program: TrainingProgram;
  planSessions: PlanSession[];
  workouts: WorkoutSession[];
};

export const FITNESS_STORAGE_KEY = "formforge:fitness-data:v1";

export const createId = (prefix: string) => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
};

export const createDefaultFitnessData = (): FitnessData => ({
  program: createDefaultTrainingProgram(),
  planSessions: [],
  workouts: [],
});

export const getDayIndex = (date: Date) => (date.getDay() + 6) % 7;

export function getNextPlanSession(
  sessions: PlanSession[],
  date = new Date(),
): PlanSession | undefined {
  if (sessions.length === 0) return undefined;
  const today = getDayIndex(date);

  return [...sessions].sort((a, b) => {
    const distanceA = (a.dayIndex - today + 7) % 7;
    const distanceB = (b.dayIndex - today + 7) % 7;
    return distanceA - distanceB;
  })[0];
}

export function normalizeFitnessData(candidate: unknown): FitnessData {
  const fallback = createDefaultFitnessData();
  if (!candidate || typeof candidate !== "object") return fallback;

  const partial = candidate as Partial<FitnessData> & {
    scenarios?: unknown[];
    activeScenarioId?: string;
  };
  const legacyProgram = Array.isArray(partial.scenarios)
    ? partial.scenarios.find(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          "id" in entry &&
          entry.id === partial.activeScenarioId,
      ) ?? partial.scenarios[0]
    : undefined;
  const source = partial.program ?? legacyProgram;
  const program =
    source && typeof source === "object"
      ? normalizeTrainingProgram(source, fallback.program)
      : fallback.program;

  return {
    program,
    planSessions: Array.isArray(partial.planSessions)
      ? partial.planSessions
      : [],
    workouts: Array.isArray(partial.workouts) ? partial.workouts : [],
  };
}

function normalizeTrainingProgram(
  candidate: object,
  fallback: TrainingProgram,
): TrainingProgram {
  const partial = candidate as Partial<TrainingProgram>;
  const candidateValues =
    partial.values && typeof partial.values === "object"
      ? (partial.values as Partial<TrainingProgram["values"]> & {
          proteinPerKg?: unknown;
        })
      : {};
  const legacyProtein =
    typeof candidateValues.proteinPerKg === "number"
      ? Math.round((candidateValues.proteinPerKg * 75) / 5) * 5
      : fallback.values.proteinGrams;
  const values = {
    ...fallback.values,
    ...candidateValues,
    proteinGrams:
      typeof candidateValues.proteinGrams === "number"
        ? candidateValues.proteinGrams
        : legacyProtein,
  };
  const sourceMuscles =
    partial.muscles && typeof partial.muscles === "object"
      ? partial.muscles
      : fallback.muscles;
  const muscles = MUSCLE_GROUPS.reduce((normalized, muscle) => {
    normalized[muscle.id] = {
      ...fallback.muscles[muscle.id],
      ...sourceMuscles[muscle.id],
    };
    return normalized;
  }, { ...fallback.muscles });

  return {
    ...fallback,
    ...partial,
    id: "training-program",
    name:
      typeof partial.name === "string" && partial.name.trim()
        ? partial.name
        : fallback.name,
    values,
    muscles,
  };
}

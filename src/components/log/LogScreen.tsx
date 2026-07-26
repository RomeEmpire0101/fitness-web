"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  MessageSquareText,
  Plus,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createId,
  getNextPlanSession,
  LoggedSet,
  PlanSession,
  WorkoutFeedback,
  WorkoutSession,
} from "@/lib/fitnessData";
import { TrainingProgram } from "@/lib/simulation";

type LogScreenProps = {
  program: TrainingProgram;
  sessions: PlanSession[];
  workouts: WorkoutSession[];
  onWorkoutsChange: (
    update: (workouts: WorkoutSession[]) => WorkoutSession[],
  ) => void;
  onOpenPlan: () => void;
};

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export function LogScreen({
  program,
  sessions,
  workouts,
  onWorkoutsChange,
  onOpenPlan,
}: LogScreenProps) {
  const activeWorkout = [...workouts]
    .reverse()
    .find((workout) => !workout.completedAt);
  const nextSession = getNextPlanSession(sessions);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeWorkout) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeWorkout]);

  const elapsedSeconds = activeWorkout
    ? Math.max(
        0,
        Math.floor(
          (now - new Date(activeWorkout.startedAt).getTime()) / 1000,
        ),
      )
    : 0;

  const summary = useMemo(() => {
    const sets =
      activeWorkout?.exercises.flatMap((exercise) => exercise.sets) ?? [];
    const completed = sets.filter((set) => set.complete);
    const volume = completed.reduce(
      (total, set) =>
        total +
        (typeof set.weight === "number" ? set.weight : 0) *
          (typeof set.reps === "number" ? set.reps : 0),
      0,
    );
    return {
      total: sets.length,
      completed: completed.length,
      volume: Math.round(volume),
      percent:
        sets.length === 0
          ? 0
          : Math.round((completed.length / sets.length) * 100),
    };
  }, [activeWorkout]);

  const startWorkout = () => {
    if (!nextSession || nextSession.exercises.length === 0) return;

    const workout: WorkoutSession = {
      id: createId("workout"),
      planSessionId: nextSession.id,
      title: nextSession.title,
      startedAt: new Date().toISOString(),
      completedAt: null,
      feedback: null,
      exercises: nextSession.exercises.map((exercise) => ({
        id: createId("logged-exercise"),
        planExerciseId: exercise.id,
        name: exercise.name,
        muscle: exercise.muscle,
        sets: Array.from(
          { length: Math.max(1, exercise.sets) },
          () => ({
            id: createId("set"),
            weight: "",
            reps: "",
            rir: program.values.rir,
            complete: false,
          }),
        ),
      })),
    };

    onWorkoutsChange((current) => [...current, workout]);
    setNow(Date.now());
  };

  const updateWorkout = (
    update: (workout: WorkoutSession) => WorkoutSession,
  ) => {
    if (!activeWorkout) return;
    onWorkoutsChange((current) =>
      current.map((workout) =>
        workout.id === activeWorkout.id ? update(workout) : workout,
      ),
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    update: Partial<LoggedSet>,
  ) => {
    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, ...update } : set,
              ),
            }
          : exercise,
      ),
    }));
  };

  const addSet = (exerciseId: string) => {
    updateWorkout((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const previous = exercise.sets.at(-1);
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: createId("set"),
              weight: previous?.weight ?? "",
              reps: previous?.reps ?? "",
              rir: previous?.rir ?? program.values.rir,
              complete: false,
            },
          ],
        };
      }),
    }));
  };

  const setFeedback = (feedback: WorkoutFeedback) => {
    updateWorkout((workout) => ({ ...workout, feedback }));
  };

  const finishWorkout = () => {
    updateWorkout((workout) => ({
      ...workout,
      completedAt: new Date().toISOString(),
    }));
  };

  const previousCompletedWorkout = activeWorkout
    ? [...workouts]
        .reverse()
        .find(
          (workout) =>
            workout.completedAt &&
            workout.planSessionId === activeWorkout.planSessionId,
        )
    : undefined;

  if (!activeWorkout) {
    const canStart = Boolean(nextSession?.exercises.length);

    return (
      <div className="log-screen screen-enter">
        <header className="screen-heading log-heading">
          <div>
            <span className="eyebrow">Workout log</span>
            <h1>No workout in progress</h1>
            <p>
              Start a saved plan session to record your actual sets, reps,
              weight, and effort.
            </p>
          </div>
        </header>

        <section className="panel-card data-empty-state data-empty-state--large">
          <CalendarDays size={26} />
          {nextSession ? (
            <>
              <h2>{nextSession.title || "Untitled session"}</h2>
              <p>
                {DAY_LABELS[nextSession.dayIndex]} ·{" "}
                {nextSession.exercises.length} exercises
              </p>
              <button
                type="button"
                className="primary-button"
                disabled={!canStart}
                onClick={startWorkout}
              >
                <Dumbbell size={15} />
                Start this session
              </button>
              {!canStart && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onOpenPlan}
                >
                  Add exercises in Plan
                </button>
              )}
            </>
          ) : (
            <>
              <h2>Your plan is empty</h2>
              <p>Add a session and its exercises before starting a workout.</p>
              <button
                type="button"
                className="primary-button"
                onClick={onOpenPlan}
              >
                Create a plan
              </button>
            </>
          )}
        </section>

        {workouts.some((workout) => workout.completedAt) && (
          <section className="panel-card workout-history">
            <header className="panel-card__header">
              <div>
                <span className="eyebrow">Recorded data</span>
                <h2>Workout history</h2>
              </div>
            </header>
            <div>
              {workouts
                .filter((workout) => workout.completedAt)
                .reverse()
                .map((workout) => (
                  <article key={workout.id}>
                    <p>
                      <strong>{workout.title || "Untitled session"}</strong>
                      <small>
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(workout.startedAt))}
                      </small>
                    </p>
                    <span>
                      {workout.exercises.reduce(
                        (total, exercise) =>
                          total +
                          exercise.sets.filter((set) => set.complete).length,
                        0,
                      )}{" "}
                      sets
                    </span>
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="log-screen screen-enter">
      <header className="screen-heading log-heading">
        <div>
          <span className="eyebrow">
            Live workout ·{" "}
            {new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).format(new Date(activeWorkout.startedAt))}
          </span>
          <h1>{activeWorkout.title || "Untitled session"}</h1>
          <p>
            {activeWorkout.exercises
              .map((exercise) => exercise.muscle)
              .filter(Boolean)
              .filter((muscle, index, all) => all.indexOf(muscle) === index)
              .join(", ") || "No muscle focus added"}{" "}
            · Target {program.values.rir} RIR
          </p>
        </div>
        <div className="workout-timer">
          <span>
            <Clock3 size={15} />
            {formatElapsed(elapsedSeconds)}
          </span>
          <button
            type="button"
            aria-label="Finish workout"
            title="Finish workout"
            onClick={finishWorkout}
          >
            <Square size={14} />
          </button>
        </div>
      </header>

      <section className="log-layout">
        <div className="exercise-log-column">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => {
            const previousExercise =
              previousCompletedWorkout?.exercises.find(
                (item) => item.planExerciseId === exercise.planExerciseId,
              );

            return (
              <article
                key={exercise.id}
                className="exercise-log-card panel-card"
              >
                <header>
                  <span className="exercise-index">{exerciseIndex + 1}</span>
                  <div>
                    <h2>{exercise.name || "Unnamed exercise"}</h2>
                    <p>{exercise.muscle || "No muscle selected"}</p>
                  </div>
                </header>

                <div className="set-table">
                  <div className="set-table__head">
                    <span>Set</span>
                    <span>Previous</span>
                    <span>kg</span>
                    <span>Reps</span>
                    <span>RIR</span>
                    <span>Done</span>
                  </div>
                  {exercise.sets.map((set, setIndex) => {
                    const previousSet = previousExercise?.sets[setIndex];
                    const previous =
                      previousSet &&
                      typeof previousSet.weight === "number" &&
                      typeof previousSet.reps === "number"
                        ? `${previousSet.weight} × ${previousSet.reps}`
                        : "—";

                    return (
                      <div
                        key={set.id}
                        className={`set-row ${
                          set.complete ? "is-complete" : ""
                        }`}
                      >
                        <span>{setIndex + 1}</span>
                        <span>{previous}</span>
                        <label>
                          <span className="sr-only">
                            Weight for set {setIndex + 1}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            placeholder="0"
                            onChange={(event) =>
                              updateSet(exercise.id, set.id, {
                                weight:
                                  event.target.value === ""
                                    ? ""
                                    : Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label>
                          <span className="sr-only">
                            Reps for set {setIndex + 1}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={set.reps}
                            placeholder="0"
                            onChange={(event) =>
                              updateSet(exercise.id, set.id, {
                                reps:
                                  event.target.value === ""
                                    ? ""
                                    : Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="rir-select">
                          <span className="sr-only">
                            RIR for set {setIndex + 1}
                          </span>
                          <select
                            value={set.rir}
                            onChange={(event) =>
                              updateSet(exercise.id, set.id, {
                                rir: Number(event.target.value),
                              })
                            }
                          >
                            {[0, 1, 2, 3, 4, 5].map((rir) => (
                              <option key={rir} value={rir}>
                                {rir}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} aria-hidden="true" />
                        </label>
                        <button
                          type="button"
                          className="set-complete-button"
                          aria-label={`${
                            set.complete ? "Mark incomplete" : "Complete"
                          } set ${setIndex + 1}`}
                          aria-pressed={set.complete}
                          onClick={() =>
                            updateSet(exercise.id, set.id, {
                              complete: !set.complete,
                            })
                          }
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="add-set-button"
                  onClick={() => addSet(exercise.id)}
                >
                  <Plus size={14} />
                  Add set
                </button>
              </article>
            );
          })}
        </div>

        <aside className="workout-summary-column">
          <article className="workout-progress-card panel-card">
            <span className="card-kicker">
              <Dumbbell size={14} />
              Session progress
            </span>
            <div className="progress-ring">
              <svg viewBox="0 0 96 96" aria-hidden="true">
                <circle cx="48" cy="48" r="39" />
                <circle
                  cx="48"
                  cy="48"
                  r="39"
                  style={{
                    strokeDasharray: 2 * Math.PI * 39,
                    strokeDashoffset:
                      2 * Math.PI * 39 * (1 - summary.percent / 100),
                  }}
                />
              </svg>
              <span>
                <b>{summary.percent}</b>%
              </span>
            </div>
            <div className="workout-summary-stats">
              <span>
                <b>
                  {summary.completed}/{summary.total}
                </b>
                sets complete
              </span>
              <span>
                <b>{summary.volume.toLocaleString()}</b>
                kg volume
              </span>
              <span>
                <b>{program.values.rir}</b>
                target RIR
              </span>
            </div>
          </article>

          <article className="feedback-card panel-card">
            <span className="card-kicker">
              <MessageSquareText size={14} />
              Quick feedback
            </span>
            <h3>How does the workload feel?</h3>
            <div>
              {[
                ["easy", "Too easy"],
                ["right", "About right"],
                ["hard", "Too much"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={
                    activeWorkout.feedback === id ? "is-active" : ""
                  }
                  onClick={() => setFeedback(id as WorkoutFeedback)}
                >
                  {activeWorkout.feedback === id && <Check size={13} />}
                  {label}
                </button>
              ))}
            </div>
            <p>Your response is stored with this workout.</p>
          </article>

          <button
            type="button"
            className="primary-button finish-workout-button"
            onClick={finishWorkout}
          >
            <Square size={14} />
            Finish workout
          </button>
        </aside>
      </section>
    </div>
  );
}

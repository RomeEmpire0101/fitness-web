"use client";

import {
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Ellipsis,
  Flame,
  MessageSquareText,
  Pause,
  Plus,
  Sparkles,
  TimerReset,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Scenario } from "@/lib/simulation";

type LogScreenProps = {
  scenario: Scenario;
};

type LoggedSet = {
  id: string;
  previous: string;
  weight: number;
  reps: number;
  rir: number;
  complete: boolean;
};

type LoggedExercise = {
  id: string;
  name: string;
  muscle: string;
  note: string;
  sets: LoggedSet[];
};

const INITIAL_EXERCISES: LoggedExercise[] = [
  {
    id: "bench",
    name: "Barbell bench press",
    muscle: "Chest · Triceps",
    note: "Pause briefly on the chest. Keep one clean rep available.",
    sets: [
      { id: "bench-1", previous: "70 × 8", weight: 72.5, reps: 8, rir: 2, complete: true },
      { id: "bench-2", previous: "70 × 8", weight: 72.5, reps: 8, rir: 2, complete: true },
      { id: "bench-3", previous: "70 × 7", weight: 72.5, reps: 7, rir: 1, complete: false },
    ],
  },
  {
    id: "row",
    name: "Chest-supported row",
    muscle: "Back · Biceps",
    note: "Lead with the elbows and keep the torso supported.",
    sets: [
      { id: "row-1", previous: "60 × 10", weight: 62.5, reps: 10, rir: 2, complete: true },
      { id: "row-2", previous: "60 × 10", weight: 62.5, reps: 10, rir: 2, complete: false },
      { id: "row-3", previous: "60 × 9", weight: 62.5, reps: 9, rir: 2, complete: false },
      { id: "row-4", previous: "57.5 × 10", weight: 60, reps: 10, rir: 2, complete: false },
    ],
  },
  {
    id: "press",
    name: "Seated shoulder press",
    muscle: "Shoulders · Triceps",
    note: "Stop before the lower back leaves the pad.",
    sets: [
      { id: "press-1", previous: "22 × 10", weight: 22, reps: 10, rir: 2, complete: false },
      { id: "press-2", previous: "22 × 9", weight: 22, reps: 9, rir: 2, complete: false },
      { id: "press-3", previous: "20 × 11", weight: 22, reps: 9, rir: 2, complete: false },
    ],
  },
];

export function LogScreen({ scenario }: LogScreenProps) {
  const [exercises, setExercises] =
    useState<LoggedExercise[]>(INITIAL_EXERCISES);
  const [effortFeedback, setEffortFeedback] = useState<"easy" | "right" | "hard">(
    "right",
  );

  const summary = useMemo(() => {
    const sets = exercises.flatMap((exercise) => exercise.sets);
    const completed = sets.filter((set) => set.complete);
    const volume = completed.reduce(
      (total, set) => total + set.weight * set.reps,
      0,
    );
    return {
      total: sets.length,
      completed: completed.length,
      volume: Math.round(volume),
      percent: Math.round((completed.length / Math.max(1, sets.length)) * 100),
    };
  }, [exercises]);

  const updateSet = (
    exerciseId: string,
    setId: string,
    update: Partial<LoggedSet>,
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, ...update } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const previous = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `${exerciseId}-${exercise.sets.length + 1}`,
              previous: "—",
              weight: previous?.weight ?? 20,
              reps: previous?.reps ?? 10,
              rir: scenario.values.rir,
              complete: false,
            },
          ],
        };
      }),
    );
  };

  return (
    <div className="log-screen screen-enter">
      <header className="screen-heading log-heading">
        <div>
          <span className="eyebrow">Live workout · Week 4</span>
          <h1>Upper strength</h1>
          <p>Chest, back and shoulders · Target {scenario.values.rir} RIR</p>
        </div>
        <div className="workout-timer">
          <span>
            <Clock3 size={15} />
            32:18
          </span>
          <button type="button" aria-label="Pause workout timer">
            <Pause size={16} />
          </button>
        </div>
      </header>

      <section className="log-layout">
        <div className="exercise-log-column">
          {exercises.map((exercise, exerciseIndex) => (
            <article key={exercise.id} className="exercise-log-card panel-card">
              <header>
                <span className="exercise-index">{exerciseIndex + 1}</span>
                <div>
                  <h2>{exercise.name}</h2>
                  <p>{exercise.muscle}</p>
                </div>
                <button type="button" aria-label={`Options for ${exercise.name}`}>
                  <Ellipsis size={18} />
                </button>
              </header>

              <div className="exercise-coach-note">
                <Sparkles size={14} />
                {exercise.note}
              </div>

              <div className="set-table">
                <div className="set-table__head">
                  <span>Set</span>
                  <span>Previous</span>
                  <span>kg</span>
                  <span>Reps</span>
                  <span>RIR</span>
                  <span>Done</span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`set-row ${set.complete ? "is-complete" : ""}`}
                  >
                    <span>{setIndex + 1}</span>
                    <span>{set.previous}</span>
                    <label>
                      <span className="sr-only">Weight for set {setIndex + 1}</span>
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            weight: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="sr-only">Reps for set {setIndex + 1}</span>
                      <input
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            reps: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="rir-select">
                      <span className="sr-only">RIR for set {setIndex + 1}</span>
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
                      aria-label={`${set.complete ? "Mark incomplete" : "Complete"} set ${
                        setIndex + 1
                      }`}
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
                ))}
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
          ))}
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
                <b>{scenario.values.rir}</b>
                target RIR
              </span>
            </div>
          </article>

          <article className="rest-timer-card panel-card">
            <span className="card-kicker">
              <TimerReset size={14} />
              Rest timer
            </span>
            <strong>01:24</strong>
            <span className="rest-progress">
              <i style={{ width: "62%" }} />
            </span>
            <div>
              <button type="button">−15 sec</button>
              <button type="button">+15 sec</button>
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
                  className={effortFeedback === id ? "is-active" : ""}
                  onClick={() =>
                    setEffortFeedback(id as "easy" | "right" | "hard")
                  }
                >
                  {effortFeedback === id && <Check size={13} />}
                  {label}
                </button>
              ))}
            </div>
            <p>This feedback can adjust the next week’s set recommendations.</p>
          </article>

          <article className="personal-best-card">
            <span>
              <Trophy size={17} />
            </span>
            <p>
              <strong>Potential volume best</strong>
              <small>Complete 5 more sets to pass last week.</small>
            </p>
            <Flame size={17} />
          </article>
        </aside>
      </section>
    </div>
  );
}

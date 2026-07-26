"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleOff,
  Clock3,
  Dumbbell,
  Plus,
  Settings2,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createId,
  PlanExercise,
  PlanSession,
} from "@/lib/fitnessData";
import {
  EQUIPMENT_OPTIONS,
  MUSCLE_GROUPS,
  TrainingProgram,
} from "@/lib/simulation";

type PlanScreenProps = {
  program: TrainingProgram;
  sessions: PlanSession[];
  onSessionsChange: (
    update: (sessions: PlanSession[]) => PlanSession[],
  ) => void;
  onProgramChange: (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => void;
  onOpenLog: () => void;
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function PlanScreen({
  program,
  sessions,
  onSessionsChange,
  onProgramChange,
  onOpenLog,
}: PlanScreenProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const week = useMemo(
    () =>
      DAY_LABELS.map((_, dayIndex) =>
        sessions.find((session) => session.dayIndex === dayIndex),
      ),
    [sessions],
  );
  const selectedSession = week[selectedDay];
  const totalMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0,
  );
  const highPriorityMuscles = MUSCLE_GROUPS.filter(
    (muscle) => program.muscles[muscle.id].priority === 3,
  );

  const updateSession = (
    sessionId: string,
    update: (session: PlanSession) => PlanSession,
  ) => {
    onSessionsChange((current) =>
      current.map((session) =>
        session.id === sessionId ? update(session) : session,
      ),
    );
  };

  const addSession = () => {
    if (selectedSession) return;
    onSessionsChange((current) => [
      ...current,
      {
        id: createId("session"),
        dayIndex: selectedDay,
        title: "",
        focus: "",
        duration: program.sessionMinutes,
        exercises: [],
      },
    ]);
  };

  const removeSession = (sessionId: string) => {
    onSessionsChange((current) =>
      current.filter((session) => session.id !== sessionId),
    );
  };

  const addExercise = (sessionId: string) => {
    updateSession(sessionId, (session) => ({
      ...session,
      exercises: [
        ...session.exercises,
        {
          id: createId("exercise"),
          name: "",
          muscle: "",
          sets: 1,
          reps: "",
        },
      ],
    }));
  };

  const updateExercise = (
    sessionId: string,
    exerciseId: string,
    update: Partial<PlanExercise>,
  ) => {
    updateSession(sessionId, (session) => ({
      ...session,
      exercises: session.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, ...update }
          : exercise,
      ),
    }));
  };

  const removeExercise = (sessionId: string, exerciseId: string) => {
    updateSession(sessionId, (session) => ({
      ...session,
      exercises: session.exercises.filter(
        (exercise) => exercise.id !== exerciseId,
      ),
    }));
  };

  return (
    <div className="plan-screen screen-enter">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">Your training structure</span>
          <h1>Plan</h1>
          <p>
            Build a weekly schedule from your own sessions and exercises.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={onOpenLog}
          disabled={sessions.length === 0}
        >
          Open workout log
          <ChevronRight size={16} />
        </button>
      </header>

      <section className="plan-settings panel-card">
        <div className="plan-settings__title">
          <span className="plan-section-icon">
            <Settings2 size={17} />
          </span>
          <div>
            <span className="eyebrow">Plan constraints</span>
            <h2>Make it fit real life</h2>
          </div>
        </div>

        <label className="setting-control">
          <span>Training days</span>
          <div className="segmented-control">
            {[3, 4, 5, 6].map((days) => (
              <button
                key={days}
                type="button"
                className={program.daysPerWeek === days ? "is-active" : ""}
                onClick={() =>
                  onProgramChange((current) => ({
                    ...current,
                    daysPerWeek: days,
                  }))
                }
              >
                {days}
              </button>
            ))}
          </div>
        </label>

        <label className="setting-control">
          <span>Default session length</span>
          <div className="segmented-control">
            {[45, 60, 75, 90].map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={
                  program.sessionMinutes === minutes ? "is-active" : ""
                }
                onClick={() =>
                  onProgramChange((current) => ({
                    ...current,
                    sessionMinutes: minutes,
                  }))
                }
              >
                {minutes}
              </button>
            ))}
          </div>
        </label>

        <label className="setting-select">
          <span>Equipment</span>
          <select
            value={program.equipment}
            onChange={(event) =>
              onProgramChange((current) => ({
                ...current,
                equipment: event.target.value as TrainingProgram["equipment"],
              }))
            }
          >
            {EQUIPMENT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="weekly-calendar panel-card">
        <header className="panel-card__header">
          <div>
            <span className="eyebrow">Weekly schedule</span>
            <h2>Your training week</h2>
          </div>
          <span className="calendar-summary">
            <CalendarDays size={15} />
            {sessions.length} sessions · {totalMinutes} min
          </span>
        </header>

        <div className="calendar-grid">
          {week.map((session, index) => (
            <button
              key={DAY_LABELS[index]}
              type="button"
              className={`${session ? "has-session" : "rest-day"} ${
                selectedDay === index ? "is-selected" : ""
              }`}
              onClick={() => setSelectedDay(index)}
            >
              <span>{DAY_LABELS[index]}</span>
              {session ? (
                <>
                  <span className="calendar-icon" aria-hidden="true">
                    <Dumbbell size={15} />
                  </span>
                  <strong>{session.title || "Untitled session"}</strong>
                  <small>{session.focus || "No focus added"}</small>
                  <b>{session.duration} min</b>
                </>
              ) : (
                <>
                  <span className="calendar-icon" aria-hidden="true">
                    <CircleOff size={16} />
                  </span>
                  <strong>No session</strong>
                  <small>Select to add one</small>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="plan-detail-grid">
        <article className="panel-card session-detail">
          {selectedSession ? (
            <>
              <header className="panel-card__header session-editor-header">
                <div className="session-editor-fields">
                  <span className="eyebrow">{DAY_LABELS[selectedDay]}</span>
                  <input
                    type="text"
                    value={selectedSession.title}
                    maxLength={48}
                    placeholder="Session name"
                    aria-label="Session name"
                    onChange={(event) =>
                      updateSession(selectedSession.id, (session) => ({
                        ...session,
                        title: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    value={selectedSession.focus}
                    maxLength={64}
                    placeholder="Focus or notes"
                    aria-label="Session focus"
                    onChange={(event) =>
                      updateSession(selectedSession.id, (session) => ({
                        ...session,
                        focus: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="session-editor-actions">
                  <label>
                    <span className="sr-only">Session duration in minutes</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedSession.duration}
                      onChange={(event) =>
                        updateSession(selectedSession.id, (session) => ({
                          ...session,
                          duration: Math.max(1, Number(event.target.value)),
                        }))
                      }
                    />
                    <span>min</span>
                  </label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => addExercise(selectedSession.id)}
                  >
                    <Plus size={15} />
                    Add exercise
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Delete session"
                    onClick={() => removeSession(selectedSession.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </header>

              <div className="exercise-plan-list">
                {selectedSession.exercises.length === 0 ? (
                  <div className="data-empty-state">
                    <p>No exercises have been added to this session.</p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => addExercise(selectedSession.id)}
                    >
                      <Plus size={15} />
                      Add your first exercise
                    </button>
                  </div>
                ) : (
                  selectedSession.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="exercise-plan-editor-row"
                    >
                      <span className="exercise-order">{index + 1}</span>
                      <p>
                        <input
                          type="text"
                          value={exercise.name}
                          placeholder="Exercise name"
                          aria-label={`Exercise ${index + 1} name`}
                          onChange={(event) =>
                            updateExercise(
                              selectedSession.id,
                              exercise.id,
                              { name: event.target.value },
                            )
                          }
                        />
                        <select
                          value={exercise.muscle}
                          aria-label={`Exercise ${index + 1} muscle`}
                          onChange={(event) =>
                            updateExercise(
                              selectedSession.id,
                              exercise.id,
                              { muscle: event.target.value },
                            )
                          }
                        >
                          <option value="">Select muscle</option>
                          {MUSCLE_GROUPS.map((muscle) => (
                            <option key={muscle.id} value={muscle.label}>
                              {muscle.label}
                            </option>
                          ))}
                        </select>
                      </p>
                      <label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          aria-label={`Sets for ${exercise.name || `exercise ${index + 1}`}`}
                          onChange={(event) =>
                            updateExercise(
                              selectedSession.id,
                              exercise.id,
                              {
                                sets: Math.max(
                                  1,
                                  Number(event.target.value),
                                ),
                              },
                            )
                          }
                        />
                        <small>sets</small>
                      </label>
                      <label>
                        <input
                          type="text"
                          value={exercise.reps}
                          placeholder="e.g. 8–10"
                          aria-label={`Reps for ${exercise.name || `exercise ${index + 1}`}`}
                          onChange={(event) =>
                            updateExercise(
                              selectedSession.id,
                              exercise.id,
                              { reps: event.target.value },
                            )
                          }
                        />
                        <small>reps</small>
                      </label>
                      <span>
                        <b>{program.values.rir}</b>
                        <small>RIR</small>
                      </span>
                      <button
                        type="button"
                        aria-label={`Delete ${exercise.name || `exercise ${index + 1}`}`}
                        onClick={() =>
                          removeExercise(selectedSession.id, exercise.id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="data-empty-state data-empty-state--large">
              <CalendarDays size={24} />
              <h2>No session planned for {DAY_LABELS[selectedDay]}</h2>
              <p>Create a blank session, then add only the exercises you want.</p>
              <button
                type="button"
                className="primary-button"
                onClick={addSession}
              >
                <Plus size={15} />
                Create session
              </button>
            </div>
          )}
        </article>

        <aside className="plan-insights">
          <article className="panel-card">
            <span className="card-kicker">
              <Sparkles size={14} />
              Priority check
            </span>
            <h3>Volume follows your Lab choices</h3>
            <p>
              Focus muscles appear here after you choose them in the Physique
              Lab.
            </p>
            <div className="priority-chip-list">
              {highPriorityMuscles.length === 0 ? (
                <span>No focus muscles selected</span>
              ) : (
                highPriorityMuscles.map((muscle) => (
                  <span key={muscle.id}>
                    <Target size={14} aria-hidden="true" />
                    {muscle.label}
                    <b>{program.muscles[muscle.id].sets}</b>
                  </span>
                ))
              )}
            </div>
          </article>

          <article className="panel-card plan-load-card">
            <span className="card-kicker">
              <Clock3 size={14} />
              Weekly load
            </span>
            <div>
              <span>
                <b>{sessions.length}</b>
                sessions
              </span>
              <span>
                <b>{totalMinutes}</b>
                minutes
              </span>
              <span>
                <b>{program.values.adherence}%</b>
                target adherence
              </span>
            </div>
            <p>
              <Check size={14} />
              Calculated from your saved plan
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

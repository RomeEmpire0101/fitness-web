"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  EQUIPMENT_OPTIONS,
  MUSCLE_GROUPS,
  Scenario,
} from "@/lib/simulation";

type PlanScreenProps = {
  scenario: Scenario;
  onScenarioChange: (update: (scenario: Scenario) => Scenario) => void;
  onOpenLog: () => void;
};

type Session = {
  id: string;
  title: string;
  focus: string;
  duration: number;
  exercises: Array<{
    name: string;
    muscle: string;
    sets: number;
    reps: string;
  }>;
};

const EXERCISES = {
  upper: [
    { name: "Bench press", muscle: "Chest", sets: 3, reps: "6–8" },
    { name: "Chest-supported row", muscle: "Back", sets: 4, reps: "8–10" },
    { name: "Seated shoulder press", muscle: "Shoulders", sets: 3, reps: "8–10" },
    { name: "Cable curl", muscle: "Biceps", sets: 2, reps: "10–12" },
    { name: "Rope pressdown", muscle: "Triceps", sets: 2, reps: "10–12" },
  ],
  lower: [
    { name: "Back squat", muscle: "Quads", sets: 4, reps: "5–8" },
    { name: "Romanian deadlift", muscle: "Hamstrings", sets: 3, reps: "8–10" },
    { name: "Leg press", muscle: "Quads", sets: 3, reps: "10–12" },
    { name: "Hip thrust", muscle: "Glutes", sets: 3, reps: "8–12" },
    { name: "Standing calf raise", muscle: "Calves", sets: 3, reps: "10–15" },
  ],
  push: [
    { name: "Incline press", muscle: "Chest", sets: 4, reps: "6–10" },
    { name: "Machine press", muscle: "Chest", sets: 3, reps: "8–12" },
    { name: "Lateral raise", muscle: "Shoulders", sets: 4, reps: "12–15" },
    { name: "Overhead extension", muscle: "Triceps", sets: 3, reps: "10–12" },
  ],
  pull: [
    { name: "Lat pulldown", muscle: "Back", sets: 4, reps: "8–12" },
    { name: "Cable row", muscle: "Back", sets: 3, reps: "8–12" },
    { name: "Rear-delt fly", muscle: "Shoulders", sets: 3, reps: "12–15" },
    { name: "Incline curl", muscle: "Biceps", sets: 3, reps: "10–12" },
  ],
  full: [
    { name: "Goblet squat", muscle: "Quads", sets: 3, reps: "8–12" },
    { name: "Dumbbell press", muscle: "Chest", sets: 3, reps: "8–12" },
    { name: "Romanian deadlift", muscle: "Hamstrings", sets: 3, reps: "8–12" },
    { name: "One-arm row", muscle: "Back", sets: 3, reps: "8–12" },
    { name: "Loaded carry", muscle: "Core", sets: 3, reps: "30 sec" },
  ],
};

function createSession(
  id: string,
  title: string,
  focus: string,
  duration: number,
  exercises: Session["exercises"],
): Session {
  return { id, title, focus, duration, exercises };
}

function buildWeek(days: number, duration: number): Array<Session | null> {
  if (days <= 3) {
    return [
      createSession("mon", "Full body A", "Balanced", duration, EXERCISES.full),
      null,
      createSession("wed", "Full body B", "Strength", duration, EXERCISES.full),
      null,
      createSession("fri", "Full body C", "Volume", duration, EXERCISES.full),
      null,
      null,
    ];
  }

  if (days === 4) {
    return [
      createSession("mon", "Upper strength", "Chest · Back", duration, EXERCISES.upper),
      createSession("tue", "Lower strength", "Quads · Glutes", duration, EXERCISES.lower),
      null,
      createSession("thu", "Upper volume", "Back · Delts", duration, EXERCISES.upper),
      createSession("fri", "Lower volume", "Hams · Quads", duration, EXERCISES.lower),
      null,
      null,
    ];
  }

  if (days === 5) {
    return [
      createSession("mon", "Push", "Chest · Delts", duration, EXERCISES.push),
      createSession("tue", "Pull", "Back · Biceps", duration, EXERCISES.pull),
      createSession("wed", "Lower", "Quads · Glutes", duration, EXERCISES.lower),
      null,
      createSession("fri", "Upper", "Balanced", duration, EXERCISES.upper),
      createSession("sat", "Lower", "Posterior chain", duration, EXERCISES.lower),
      null,
    ];
  }

  return [
    createSession("mon", "Push A", "Chest · Delts", duration, EXERCISES.push),
    createSession("tue", "Pull A", "Back · Biceps", duration, EXERCISES.pull),
    createSession("wed", "Lower A", "Quads · Glutes", duration, EXERCISES.lower),
    createSession("thu", "Push B", "Chest · Triceps", duration, EXERCISES.push),
    createSession("fri", "Pull B", "Back · Rear delts", duration, EXERCISES.pull),
    createSession("sat", "Lower B", "Hams · Glutes", duration, EXERCISES.lower),
    null,
  ];
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function PlanScreen({
  scenario,
  onScenarioChange,
  onOpenLog,
}: PlanScreenProps) {
  const week = useMemo(
    () => buildWeek(scenario.daysPerWeek, scenario.sessionMinutes),
    [scenario.daysPerWeek, scenario.sessionMinutes],
  );
  const firstSessionIndex = Math.max(
    0,
    week.findIndex((session) => session !== null),
  );
  const [selectedDay, setSelectedDay] = useState(firstSessionIndex);
  const displayedDay = week[selectedDay] ? selectedDay : firstSessionIndex;
  const selectedSession = week[displayedDay] ?? week[firstSessionIndex];
  const highPriorityMuscles = MUSCLE_GROUPS.filter(
    (muscle) => scenario.muscles[muscle.id].priority === 3,
  );

  return (
    <div className="plan-screen screen-enter">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">Adaptive training structure</span>
          <h1>Plan</h1>
          <p>
            Turn the Lab scenario into a practical weekly rhythm that fits
            your schedule and equipment.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onOpenLog}>
          Start next session
          <ChevronRight size={16} />
        </button>
      </header>

      <section className="plan-settings panel-card">
        <div className="plan-settings__title">
          <span className="stat-icon stat-icon--violet">
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
                className={scenario.daysPerWeek === days ? "is-active" : ""}
                onClick={() =>
                  onScenarioChange((current) => ({
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
          <span>Session length</span>
          <div className="segmented-control">
            {[45, 60, 75, 90].map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={scenario.sessionMinutes === minutes ? "is-active" : ""}
                onClick={() =>
                  onScenarioChange((current) => ({
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
            value={scenario.equipment}
            onChange={(event) =>
              onScenarioChange((current) => ({
                ...current,
                equipment: event.target.value as Scenario["equipment"],
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
            <span className="eyebrow">Week 4</span>
            <h2>Your training week</h2>
          </div>
          <span className="calendar-summary">
            <CalendarDays size={15} />
            {scenario.daysPerWeek} sessions ·{" "}
            {scenario.daysPerWeek * scenario.sessionMinutes} min
          </span>
        </header>

        <div className="calendar-grid">
          {week.map((session, index) => (
            <button
              key={DAY_LABELS[index]}
              type="button"
              className={`${session ? "has-session" : "rest-day"} ${
                displayedDay === index && session ? "is-selected" : ""
              }`}
              onClick={() => session && setSelectedDay(index)}
              disabled={!session}
            >
              <span>{DAY_LABELS[index]}</span>
              {session ? (
                <>
                  <i>
                    <Dumbbell size={15} />
                  </i>
                  <strong>{session.title}</strong>
                  <small>{session.focus}</small>
                  <b>{session.duration} min</b>
                </>
              ) : (
                <>
                  <i className="rest-icon" />
                  <strong>Recovery</strong>
                  <small>Walk · Mobility</small>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="plan-detail-grid">
        <article className="panel-card session-detail">
          <header className="panel-card__header">
            <div>
              <span className="eyebrow">
                {DAY_LABELS[displayedDay] ?? "MON"} ·{" "}
                {selectedSession?.duration ?? scenario.sessionMinutes} minutes
              </span>
              <h2>{selectedSession?.title ?? "Next session"}</h2>
            </div>
            <button type="button" className="secondary-button">
              <Plus size={15} />
              Add exercise
            </button>
          </header>

          <div className="exercise-plan-list">
            {selectedSession?.exercises.map((exercise, index) => (
              <div key={`${exercise.name}-${index}`}>
                <span className="exercise-order">{index + 1}</span>
                <p>
                  <strong>{exercise.name}</strong>
                  <small>{exercise.muscle}</small>
                </p>
                <span>
                  <b>{exercise.sets}</b>
                  <small>sets</small>
                </span>
                <span>
                  <b>{exercise.reps}</b>
                  <small>reps</small>
                </span>
                <span>
                  <b>{scenario.values.rir}</b>
                  <small>RIR</small>
                </span>
                <button type="button" aria-label={`Edit ${exercise.name}`}>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside className="plan-insights">
          <article className="panel-card">
            <span className="card-kicker">
              <Sparkles size={14} />
              Priority check
            </span>
            <h3>Volume follows your Lab choices</h3>
            <p>
              The plan currently gives extra attention to your selected focus
              muscles while keeping the rest of the body active.
            </p>
            <div className="priority-chip-list">
              {highPriorityMuscles.map((muscle) => (
                <span key={muscle.id}>
                  <i style={{ background: muscle.color }} />
                  {muscle.label}
                  <b>{scenario.muscles[muscle.id].sets}</b>
                </span>
              ))}
            </div>
          </article>

          <article className="panel-card plan-load-card">
            <span className="card-kicker">
              <Clock3 size={14} />
              Weekly load
            </span>
            <div>
              <span>
                <b>{scenario.daysPerWeek}</b>
                sessions
              </span>
              <span>
                <b>{scenario.daysPerWeek * scenario.sessionMinutes}</b>
                minutes
              </span>
              <span>
                <b>{scenario.values.adherence}%</b>
                target adherence
              </span>
            </div>
            <p>
              <Check size={14} />
              Fits the current recovery inputs
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

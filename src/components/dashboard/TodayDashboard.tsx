"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  MoonStar,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { CharacterProfile } from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  getDayIndex,
  getNextPlanSession,
  PlanSession,
  WorkoutSession,
} from "@/lib/fitnessData";
import {
  getMuscleDefinition,
  MUSCLE_GROUPS,
  PhysiqueResult,
  TrainingProgram,
} from "@/lib/simulation";

type TodayDashboardProps = {
  program: TrainingProgram;
  result: PhysiqueResult;
  profile: CharacterProfile;
  planSessions: PlanSession[];
  workouts: WorkoutSession[];
  reducedMotion: boolean;
  onNavigate: (view: "lab" | "plan" | "log") => void;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const subscribeToHydration = () => () => {};

export function TodayDashboard({
  program,
  result,
  profile,
  planSessions,
  workouts,
  reducedMotion,
  onNavigate,
}: TodayDashboardProps) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const today = hydrated ? new Date() : null;

  const focusMuscles = MUSCLE_GROUPS.filter(
    (muscle) => program.muscles[muscle.id].priority === 3,
  ).slice(0, 3);
  const nextSession = today
    ? getNextPlanSession(planSessions, today)
    : planSessions[0];
  const todayIndex = today ? getDayIndex(today) : -1;
  const weekStart = useMemo(() => {
    if (!today) return null;
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - getDayIndex(start));
    return start;
  }, [today]);
  const completedThisWeek = workouts.filter((workout) => {
    if (!workout.completedAt || !weekStart) return false;
    const completedAt = new Date(workout.completedAt);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return completedAt >= weekStart && completedAt < weekEnd;
  });
  const weeklyProgress =
    planSessions.length === 0
      ? 0
      : Math.round(
          (Math.min(completedThisWeek.length, planSessions.length) /
            planSessions.length) *
            100,
        );
  const greeting =
    !today
      ? "Welcome"
      : today.getHours() < 12
        ? "Good morning"
        : today.getHours() < 18
          ? "Good afternoon"
          : "Good evening";
  const dateLabel = today
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(today)
    : "Today";

  return (
    <div className="dashboard-screen screen-enter">
      <header className="screen-heading dashboard-heading">
        <div>
          <span className="eyebrow">{dateLabel}</span>
          <h1>
            {greeting}
            {profile.name.trim() ? `, ${profile.name.trim()}` : ""}.
          </h1>
          <p>
            Your dashboard reflects only the plan and workouts you have saved.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => onNavigate("log")}
        >
          Open workout log
          <ArrowRight size={16} />
        </button>
      </header>

      <section className="dashboard-hero" aria-label="Daily overview">
        <article className="hero-copy-card">
          <span className="card-kicker">
            <Sparkles size={14} />
            Training signal
          </span>
          <strong className="hero-score">{result.readiness}</strong>
          <span className="hero-score-label">Readiness</span>
          <p>{result.guidance}</p>
          <button type="button" onClick={() => onNavigate("lab")}>
            Explore the Lab
            <ChevronRight size={15} />
          </button>
        </article>

        <article className="dashboard-character-card">
          <div className="dashboard-character-copy">
            <span>{profile.name.trim() || "Your profile"}</span>
            <b>{result.stage}</b>
          </div>
          <div className="dashboard-character">
            <CharacterScene
              profile={profile}
              growth={result.growth}
              definition={result.definition}
              stimulus={result.stimulus}
              muscleSignals={result.muscleSignals}
              reducedMotion={reducedMotion}
              compact
              interactive={false}
            />
          </div>
          <div className="character-floor" aria-hidden="true" />
          <div className="dashboard-character-stats">
            <span>
              <b>{profile.measurements.heightCm}</b> cm
            </span>
            <i />
            <span>
              <b>{profile.measurements.weightKg}</b> kg
            </span>
            <i />
            <span>
              <b>{program.values.bodyFat}</b>% est.
            </span>
          </div>
        </article>

        <article className="next-workout-card">
          <header>
            <span className="card-kicker">
              <CalendarDays size={14} />
              Next session
            </span>
            {nextSession && (
              <span>{DAY_NAMES[nextSession.dayIndex]}</span>
            )}
          </header>
          {nextSession ? (
            <>
              <h2>{nextSession.title || "Untitled session"}</h2>
              <p>
                {nextSession.focus || "No focus added"} ·{" "}
                {nextSession.duration} min
              </p>
              <div className="workout-exercise-stack">
                {nextSession.exercises.length > 0 ? (
                  nextSession.exercises
                    .slice(0, 3)
                    .map((exercise) => (
                      <span key={exercise.id}>
                        {exercise.name || "Unnamed exercise"}
                      </span>
                    ))
                ) : (
                  <span>No exercises added</span>
                )}
              </div>
            </>
          ) : (
            <>
              <h2>No session planned</h2>
              <p>Create your first session to populate this card.</p>
            </>
          )}
          <button type="button" onClick={() => onNavigate("plan")}>
            {nextSession ? "View plan" : "Create plan"}
            <ChevronRight size={15} />
          </button>
        </article>
      </section>

      <section className="dashboard-stat-grid" aria-label="Weekly signals">
        <article className="stat-card">
          <span className="stat-icon stat-icon--violet">
            <Target size={17} />
          </span>
          <div>
            <small>Weekly consistency</small>
            <strong>
              {completedThisWeek.length}/{planSessions.length} sessions
            </strong>
          </div>
          <b>{weeklyProgress}%</b>
          <span className="mini-progress">
            <i style={{ width: `${weeklyProgress}%` }} />
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--blue">
            <TrendingUp size={17} />
          </span>
          <div>
            <small>Adaptation signal</small>
            <strong>{result.status}</strong>
          </div>
          <b>{result.adaptation}</b>
          <span className="mini-progress">
            <i style={{ width: `${result.adaptation}%` }} />
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--green">
            <MoonStar size={17} />
          </span>
          <div>
            <small>Average sleep</small>
            <strong>{program.values.sleepHours} hours</strong>
          </div>
          <b>{result.readiness}</b>
          <span className="mini-progress">
            <i style={{ width: `${result.readiness}%` }} />
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--orange">
            <Flame size={17} />
          </span>
          <div>
            <small>Energy target</small>
            <strong>
              {program.values.calorieBalance > 0 ? "+" : ""}
              {program.values.calorieBalance} kcal
            </strong>
          </div>
          <b>{program.values.adherence}%</b>
          <span className="mini-progress">
            <i style={{ width: `${program.values.adherence}%` }} />
          </span>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="panel-card weekly-plan-card">
          <header className="panel-card__header">
            <div>
              <span className="eyebrow">This week</span>
              <h2>Training rhythm</h2>
            </div>
            <button type="button" onClick={() => onNavigate("plan")}>
              Open plan
              <ChevronRight size={15} />
            </button>
          </header>
          <div className="week-strip">
            {DAY_LABELS.map((day, index) => {
              const session = planSessions.find(
                (item) => item.dayIndex === index,
              );
              const completed = Boolean(
                session &&
                  completedThisWeek.some(
                    (workout) => workout.planSessionId === session.id,
                  ),
              );
              return (
                <div
                  key={`${day}-${index}`}
                  className={`${completed ? "is-complete" : ""} ${
                    index === todayIndex ? "is-today" : ""
                  }`}
                >
                  <span>{day}</span>
                  <i>{completed ? <Check size={12} /> : null}</i>
                  <small>
                    {session
                      ? session.title || "Untitled"
                      : "No session"}
                  </small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel-card focus-card">
          <header className="panel-card__header">
            <div>
              <span className="eyebrow">Current priorities</span>
              <h2>Muscle focus</h2>
            </div>
            <Dumbbell size={18} />
          </header>
          <div className="focus-muscle-list">
            {focusMuscles.length === 0 ? (
              <p>No focus muscles selected in the Lab.</p>
            ) : (
              focusMuscles.map((muscle) => {
                const setting = program.muscles[muscle.id];
                const definition = getMuscleDefinition(muscle.id);
                return (
                  <div key={muscle.id}>
                    <span
                      style={
                        {
                          "--focus-color": definition?.color,
                        } as React.CSSProperties
                      }
                    />
                    <p>
                      <strong>{definition?.label}</strong>
                      <small>{setting.sets} working sets / week</small>
                    </p>
                    <b>Focus</b>
                  </div>
                );
              })
            )}
          </div>
          <button type="button" onClick={() => onNavigate("lab")}>
            Adjust priorities
          </button>
        </article>
      </section>

      <p className="simulation-note">
        FormForge visualizes how training inputs relate. It does not predict an
        exact future body or provide medical guidance.
      </p>
    </div>
  );
}

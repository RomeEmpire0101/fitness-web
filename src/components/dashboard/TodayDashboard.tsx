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
import { CharacterProfile } from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  getMuscleDefinition,
  MUSCLE_GROUPS,
  PhysiqueResult,
  Scenario,
} from "@/lib/simulation";

type TodayDashboardProps = {
  scenario: Scenario;
  result: PhysiqueResult;
  profile: CharacterProfile;
  reducedMotion: boolean;
  onNavigate: (view: "lab" | "plan" | "log") => void;
};

export function TodayDashboard({
  scenario,
  result,
  profile,
  reducedMotion,
  onNavigate,
}: TodayDashboardProps) {
  const focusMuscles = MUSCLE_GROUPS.filter(
    (muscle) => scenario.muscles[muscle.id].priority === 3,
  ).slice(0, 3);
  const completedSessions = Math.max(1, scenario.daysPerWeek - 1);
  const weeklyProgress = Math.round(
    (completedSessions / scenario.daysPerWeek) * 100,
  );

  return (
    <div className="dashboard-screen screen-enter">
      <header className="screen-heading dashboard-heading">
        <div>
          <span className="eyebrow">Monday · Week 4 of {scenario.values.weeks}</span>
          <h1>Good morning, Athlete.</h1>
          <p>Your plan is balanced. Keep today’s work deliberate.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => onNavigate("log")}
        >
          Start workout
          <ArrowRight size={16} />
        </button>
      </header>

      <section className="dashboard-hero" aria-label="Daily overview">
        <article className="hero-copy-card">
          <span className="card-kicker">
            <Sparkles size={14} />
            Today’s signal
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
            <span>{profile.name}</span>
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
              <b>{scenario.values.bodyFat}</b>% est.
            </span>
          </div>
        </article>

        <article className="next-workout-card">
          <header>
            <span className="card-kicker">
              <CalendarDays size={14} />
              Next session
            </span>
            <span>6:30 PM</span>
          </header>
          <h2>Upper strength</h2>
          <p>Chest, back and shoulders · {scenario.sessionMinutes} min</p>
          <div className="workout-exercise-stack" aria-hidden="true">
            <span>Bench press</span>
            <span>Chest-supported row</span>
            <span>Seated shoulder press</span>
          </div>
          <button type="button" onClick={() => onNavigate("plan")}>
            View plan
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
              {completedSessions}/{scenario.daysPerWeek} sessions
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
            <strong>{scenario.values.sleepHours} hours</strong>
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
              {scenario.values.calorieBalance > 0 ? "+" : ""}
              {scenario.values.calorieBalance} kcal
            </strong>
          </div>
          <b>{scenario.values.adherence}%</b>
          <span className="mini-progress">
            <i style={{ width: `${scenario.values.adherence}%` }} />
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
            {[
              ["M", "Upper", true],
              ["T", "Lower", true],
              ["W", "Recover", false],
              ["T", "Upper", true],
              ["F", "Lower", false],
              ["S", "Move", false],
              ["S", "Rest", false],
            ].map(([day, label, trained], index) => (
              <div
                key={`${day}-${index}`}
                className={`${trained ? "is-complete" : ""} ${
                  index === 3 ? "is-today" : ""
                }`}
              >
                <span>{day}</span>
                <i>{trained ? <Check size={12} /> : null}</i>
                <small>{label}</small>
              </div>
            ))}
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
            {focusMuscles.map((muscle) => {
              const setting = scenario.muscles[muscle.id];
              const definition = getMuscleDefinition(muscle.id);
              return (
                <div key={muscle.id}>
                  <span
                    style={{ "--focus-color": definition?.color } as React.CSSProperties}
                  />
                  <p>
                    <strong>{definition?.label}</strong>
                    <small>{setting.sets} working sets / week</small>
                  </p>
                  <b>Focus</b>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={() => onNavigate("lab")}>
            Adjust priorities
          </button>
        </article>
      </section>

      <p className="simulation-note">
        FormForge visualizes an illustrative scenario. It does not predict an
        exact future body or provide medical guidance.
      </p>
    </div>
  );
}

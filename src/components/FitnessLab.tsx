"use client";

import {
  Bell,
  CalendarRange,
  Dumbbell,
  FlaskConical,
  Home,
  Menu,
  NotebookPen,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCharacterProfile } from "@/features/characters";
import { useFitnessData } from "@/hooks/useFitnessData";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  createDefaultTrainingProgram,
  derivePhysique,
  EXPERIENCE_LEVELS,
  GOALS,
  TrainingProgram,
} from "@/lib/simulation";
import { TodayDashboard } from "./dashboard/TodayDashboard";
import { LabScreen } from "./lab/LabScreen";
import { LogScreen } from "./log/LogScreen";
import { PlanScreen } from "./plan/PlanScreen";

type AppView = "today" | "lab" | "plan" | "log";

const NAVIGATION: Array<{
  id: AppView;
  label: string;
  Icon: typeof Home;
}> = [
  { id: "today", label: "Today", Icon: Home },
  { id: "lab", label: "Physique Lab", Icon: FlaskConical },
  { id: "plan", label: "Plan", Icon: CalendarRange },
  { id: "log", label: "Workout Log", Icon: NotebookPen },
];

export function FitnessLab() {
  const [view, setView] = useState<AppView>("today");
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [fitnessData, setFitnessData] = useFitnessData();
  const { program, planSessions, workouts } = fitnessData;
  const [characterEditorOpen, setCharacterEditorOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const {
    profile,
    updateName,
    updateMeasurement,
    updateBodyType,
    updateAppearance,
    updateWardrobe,
    resetProfile,
  } = useCharacterProfile();

  const result = useMemo(() => derivePhysique(program), [program]);

  const navigate = (nextView: AppView) => {
    setView(nextView);
    setMobileNavigationOpen(false);
    window.requestAnimationFrame(() => {
      document.querySelector(".app-content")?.scrollTo({ top: 0 });
    });
  };

  const updateProgram = (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => {
    setFitnessData((current) => ({
      ...current,
      program: update(current.program),
    }));
  };

  const resetProgram = () => {
    setFitnessData((current) => ({
      ...current,
      program: createDefaultTrainingProgram(),
    }));
  };

  const activeGoal = GOALS.find((goal) => goal.id === program.goal);
  const activeExperience = EXPERIENCE_LEVELS.find(
    (level) => level.id === program.experience,
  );

  return (
    <div className="fitness-app">
      <aside
        className={`app-sidebar ${
          mobileNavigationOpen ? "is-mobile-open" : ""
        }`}
      >
        <header className="app-brand">
          <span className="app-brand__icon" aria-hidden="true">
            <Dumbbell size={20} strokeWidth={1.9} />
          </span>
          <div>
            <strong>FORMFORGE</strong>
            <small>Adaptive fitness studio</small>
          </div>
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        <nav className="app-navigation" aria-label="Main application">
          <span>Workspace</span>
          {NAVIGATION.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={view === id ? "is-active" : ""}
              aria-current={view === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <button type="button">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="sidebar-profile">
            <span>
              {profile.name.trim().slice(0, 2).toUpperCase() || "—"}
            </span>
            <p>
              <strong>{profile.name.trim() || "Unnamed profile"}</strong>
              <small>
                {activeExperience?.label} · {activeGoal?.label}
              </small>
            </p>
          </div>
        </footer>
      </aside>

      {mobileNavigationOpen && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}

      <div className="app-column">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="mobile-brand">FORMFORGE</div>
          <label className="app-search">
            <Search size={16} />
            <span className="sr-only">Search FormForge</span>
            <input
              type="search"
              placeholder="Search exercises, plans, or insights"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <button type="button" aria-label="Notifications">
              <Bell size={17} />
            </button>
          </div>
        </header>

        <main className="app-content">
          {view === "today" && (
            <TodayDashboard
              program={program}
              result={result}
              profile={profile}
              planSessions={planSessions}
              workouts={workouts}
              reducedMotion={reducedMotion}
              onNavigate={navigate}
            />
          )}

          {view === "lab" && (
            <LabScreen
              program={program}
              result={result}
              profile={profile}
              reducedMotion={reducedMotion}
              onProgramChange={updateProgram}
              onResetProgram={resetProgram}
              characterEditorOpen={characterEditorOpen}
              onCharacterEditorOpenChange={setCharacterEditorOpen}
              onNameChange={updateName}
              onMeasurementChange={updateMeasurement}
              onBodyTypeChange={updateBodyType}
              onAppearanceChange={updateAppearance}
              onWardrobeChange={updateWardrobe}
              onResetCharacter={resetProfile}
            />
          )}

          {view === "plan" && (
            <PlanScreen
              program={program}
              sessions={planSessions}
              onSessionsChange={(update) =>
                setFitnessData((current) => ({
                  ...current,
                  planSessions: update(current.planSessions),
                }))
              }
              onProgramChange={updateProgram}
              onOpenLog={() => navigate("log")}
            />
          )}

          {view === "log" && (
            <LogScreen
              program={program}
              sessions={planSessions}
              workouts={workouts}
              onWorkoutsChange={(update) =>
                setFitnessData((current) => ({
                  ...current,
                  workouts: update(current.workouts),
                }))
              }
              onOpenPlan={() => navigate("plan")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

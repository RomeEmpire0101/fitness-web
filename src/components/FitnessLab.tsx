"use client";

import {
  Bell,
  CalendarRange,
  FlaskConical,
  Home,
  Menu,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCharacterProfile } from "@/features/characters";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  cloneScenario,
  derivePhysique,
  INITIAL_SCENARIOS,
  PhysiqueResult,
  Scenario,
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

const createInitialScenarios = () =>
  INITIAL_SCENARIOS.map((scenario) => cloneScenario(scenario));

export function FitnessLab() {
  const [view, setView] = useState<AppView>("today");
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [scenarios, setScenarios] =
    useState<Scenario[]>(createInitialScenarios);
  const [activeScenarioId, setActiveScenarioId] =
    useState<Scenario["id"]>("scenario-a");
  const [characterEditorOpen, setCharacterEditorOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const {
    profile,
    updateMeasurement,
    updateBodyColor,
    resetProfile,
  } = useCharacterProfile();

  const results = useMemo(
    () =>
      scenarios.reduce((resultMap, scenario) => {
        resultMap[scenario.id] = derivePhysique(scenario);
        return resultMap;
      }, {} as Record<Scenario["id"], PhysiqueResult>),
    [scenarios],
  );

  const activeScenario =
    scenarios.find((scenario) => scenario.id === activeScenarioId) ??
    scenarios[0];
  const activeResult = results[activeScenario.id];

  const navigate = (nextView: AppView) => {
    setView(nextView);
    setMobileNavigationOpen(false);
    window.requestAnimationFrame(() => {
      document.querySelector(".app-content")?.scrollTo({ top: 0 });
    });
  };

  const updateScenario = (
    id: Scenario["id"],
    update: (scenario: Scenario) => Scenario,
  ) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === id ? update(scenario) : scenario,
      ),
    );
  };

  const resetScenarios = () => {
    setScenarios(createInitialScenarios());
    setActiveScenarioId("scenario-a");
  };

  return (
    <div className="fitness-app">
      <aside
        className={`app-sidebar ${
          mobileNavigationOpen ? "is-mobile-open" : ""
        }`}
      >
        <header className="app-brand">
          <span aria-hidden="true">
            <i />
            <i />
            <i />
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
              {id === "log" && <i>Live</i>}
            </button>
          ))}
        </nav>

        <div className="sidebar-lab-note">
          <span>
            <Sparkles size={14} />
          </span>
          <p>
            <strong>Scenario mode</strong>
            <small>Explore relationships, not exact predictions.</small>
          </p>
        </div>

        <footer className="sidebar-footer">
          <button type="button">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="sidebar-profile">
            <span>{profile.name.slice(0, 2).toUpperCase()}</span>
            <p>
              <strong>{profile.name}</strong>
              <small>Intermediate · Build</small>
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
              <i />
            </button>
            <span className="topbar-scenario">
              <i />
              {activeScenario.name}
            </span>
          </div>
        </header>

        <main className="app-content">
          {view === "today" && (
            <TodayDashboard
              scenario={activeScenario}
              result={activeResult}
              profile={profile}
              reducedMotion={reducedMotion}
              onNavigate={navigate}
            />
          )}

          {view === "lab" && (
            <LabScreen
              scenarios={scenarios}
              results={results}
              activeScenarioId={activeScenarioId}
              profile={profile}
              reducedMotion={reducedMotion}
              onActiveScenarioChange={setActiveScenarioId}
              onScenarioChange={updateScenario}
              onResetScenarios={resetScenarios}
              characterEditorOpen={characterEditorOpen}
              onCharacterEditorOpenChange={setCharacterEditorOpen}
              onMeasurementChange={updateMeasurement}
              onBodyColorChange={updateBodyColor}
              onResetCharacter={resetProfile}
            />
          )}

          {view === "plan" && (
            <PlanScreen
              scenario={activeScenario}
              onScenarioChange={(update) =>
                updateScenario(activeScenario.id, update)
              }
              onOpenLog={() => navigate("log")}
            />
          )}

          {view === "log" && <LogScreen scenario={activeScenario} />}
        </main>
      </div>
    </div>
  );
}

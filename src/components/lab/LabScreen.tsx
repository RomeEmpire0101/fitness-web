"use client";

import {
  ArrowRightLeft,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  Info,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  EXPERIENCE_LEVELS,
  GOALS,
  METRICS,
  MUSCLE_GROUPS,
  MetricId,
  MuscleGroupId,
  MusclePriority,
  PhysiqueResult,
  Scenario,
  getMuscleDefinition,
} from "@/lib/simulation";
import { MuscleMap } from "../muscles/MuscleMap";
import { MetricCard } from "./MetricCard";

type LabScreenProps = {
  scenarios: Scenario[];
  results: Record<Scenario["id"], PhysiqueResult>;
  activeScenarioId: Scenario["id"];
  profile: CharacterProfile;
  reducedMotion: boolean;
  onActiveScenarioChange: (id: Scenario["id"]) => void;
  onScenarioChange: (
    id: Scenario["id"],
    update: (scenario: Scenario) => Scenario,
  ) => void;
  onResetScenarios: () => void;
  characterEditorOpen: boolean;
  onCharacterEditorOpenChange: (open: boolean) => void;
  onMeasurementChange: (id: CharacterMeasurementId, value: number) => void;
  onBodyColorChange: (color: string) => void;
  onResetCharacter: () => void;
};

const PRIORITIES: Array<{ id: MusclePriority; label: string }> = [
  { id: 1, label: "Maintain" },
  { id: 2, label: "Grow" },
  { id: 3, label: "Focus" },
];

export function LabScreen({
  scenarios,
  results,
  activeScenarioId,
  profile,
  reducedMotion,
  onActiveScenarioChange,
  onScenarioChange,
  onResetScenarios,
  characterEditorOpen,
  onCharacterEditorOpenChange,
  onMeasurementChange,
  onBodyColorChange,
  onResetCharacter,
}: LabScreenProps) {
  const [activeMetric, setActiveMetric] =
    useState<MetricId>("proteinPerKg");
  const [activeMuscle, setActiveMuscle] =
    useState<MuscleGroupId>("chest");
  const activeScenario = scenarios.find(
    (scenario) => scenario.id === activeScenarioId,
  ) ?? scenarios[0];
  const activeResult = results[activeScenario.id];
  const selectedMuscle = activeScenario.muscles[activeMuscle];
  const selectedMuscleDefinition = getMuscleDefinition(activeMuscle);
  const comparison = useMemo(() => {
    const a = results["scenario-a"];
    const b = results["scenario-b"];
    return {
      adaptation: b.adaptation - a.adaptation,
      readiness: b.readiness - a.readiness,
      recovery: Math.round((a.recoveryLoad - b.recoveryLoad) * 100),
    };
  }, [results]);

  const updateActiveScenario = (
    update: (scenario: Scenario) => Scenario,
  ) => onScenarioChange(activeScenario.id, update);

  const changeMetric = (id: MetricId, value: number) => {
    updateActiveScenario((scenario) => ({
      ...scenario,
      values: { ...scenario.values, [id]: value },
    }));
    setActiveMetric(id);
  };

  const changeMuscleSets = (sets: number) => {
    updateActiveScenario((scenario) => ({
      ...scenario,
      muscles: {
        ...scenario.muscles,
        [activeMuscle]: {
          ...scenario.muscles[activeMuscle],
          sets: Math.min(30, Math.max(0, Math.round(sets))),
        },
      },
    }));
  };

  const changeMusclePriority = (priority: MusclePriority) => {
    updateActiveScenario((scenario) => ({
      ...scenario,
      muscles: {
        ...scenario.muscles,
        [activeMuscle]: {
          ...scenario.muscles[activeMuscle],
          priority,
        },
      },
    }));
  };

  return (
    <div className="lab-screen screen-enter">
      <header className="screen-heading lab-heading">
        <div>
          <span className="eyebrow">Interactive scenario studio</span>
          <h1>Physique Lab</h1>
          <p>
            Shape the inputs, target individual muscle groups, and compare
            two plausible approaches.
          </p>
        </div>
        <div className="lab-heading-actions">
          <div className="scenario-switcher" aria-label="Active scenario">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={activeScenario.id === scenario.id ? "is-active" : ""}
                onClick={() => onActiveScenarioChange(scenario.id)}
              >
                <span>{scenario.id === "scenario-a" ? "A" : "B"}</span>
                {scenario.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onResetScenarios}
            aria-label="Reset both scenarios"
            title="Reset both scenarios"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      <section className="lab-workspace">
        <article className="lab-stage-card">
          <header>
            <div>
              <span className="live-dot" />
              Live model
            </div>
            <span>Drag to inspect</span>
          </header>
          <div className="lab-character">
            <CharacterScene
              profile={profile}
              growth={activeResult.growth}
              definition={activeResult.definition}
              stimulus={activeResult.stimulus}
              muscleSignals={activeResult.muscleSignals}
              reducedMotion={reducedMotion}
              interactive
            />
          </div>
          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={onCharacterEditorOpenChange}
            onMeasurementChange={onMeasurementChange}
            onBodyColorChange={onBodyColorChange}
            onReset={onResetCharacter}
          />
          <div className="lab-stage-score">
            <span>
              <b>{activeResult.adaptation}</b>
              <small>Adaptation</small>
            </span>
            <i />
            <span>
              <b>{activeResult.readiness}</b>
              <small>Readiness</small>
            </span>
            <i />
            <span>
              <b>{activeResult.stage}</b>
              <small>Scenario stage</small>
            </span>
          </div>
        </article>

        <div className="lab-control-column">
          <article className="scenario-profile-card">
            <header>
              <span className="card-kicker">
                <Target size={14} />
                Scenario profile
              </span>
              <span className="illustrative-badge">
                <Info size={12} />
                Illustrative
              </span>
            </header>
            <div className="profile-select-grid">
              <label>
                <span>Primary goal</span>
                <select
                  value={activeScenario.goal}
                  onChange={(event) =>
                    updateActiveScenario((scenario) => ({
                      ...scenario,
                      goal: event.target.value as Scenario["goal"],
                    }))
                  }
                >
                  {GOALS.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Training experience</span>
                <select
                  value={activeScenario.experience}
                  onChange={(event) =>
                    updateActiveScenario((scenario) => ({
                      ...scenario,
                      experience: event.target.value as Scenario["experience"],
                    }))
                  }
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="scenario-insight">
              <Sparkles size={15} />
              <p>
                <strong>{activeResult.status}</strong>
                <span>{activeResult.guidance}</span>
              </p>
            </div>
          </article>

          <div className="metric-grid">
            {METRICS.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                value={activeScenario.values[metric.id]}
                isActive={activeMetric === metric.id}
                onChange={changeMetric}
                onActivate={setActiveMetric}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="muscle-studio panel-card">
        <header className="panel-card__header muscle-studio__header">
          <div>
            <span className="eyebrow">Per-muscle programming</span>
            <h2>Choose what the plan emphasizes</h2>
          </div>
          <p>
            Weekly sets are tracked per muscle. High-volume areas also add
            more recovery demand.
          </p>
        </header>

        <div className="muscle-studio__grid">
          <MuscleMap
            activeMuscle={activeMuscle}
            muscles={activeScenario.muscles}
            onSelect={setActiveMuscle}
          />

          <div className="muscle-editor">
            <header>
              <span
                className="muscle-editor__color"
                style={{
                  background: selectedMuscleDefinition?.color,
                }}
              />
              <div>
                <span>Selected muscle</span>
                <h3>{selectedMuscleDefinition?.label}</h3>
              </div>
              <strong>{selectedMuscle.sets} sets</strong>
            </header>

            <label className="muscle-set-control">
              <span>
                <b>Weekly working sets</b>
                <small>0–30 sets per week</small>
              </span>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={selectedMuscle.sets}
                onChange={(event) => changeMuscleSets(Number(event.target.value))}
              />
              <span className="muscle-set-scale" aria-hidden="true">
                <i style={{ width: `${(selectedMuscle.sets / 30) * 100}%` }} />
              </span>
            </label>

            <fieldset className="priority-control">
              <legend>Programming priority</legend>
              <div>
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    className={
                      selectedMuscle.priority === priority.id ? "is-active" : ""
                    }
                    onClick={() => changeMusclePriority(priority.id)}
                  >
                    {selectedMuscle.priority === priority.id && (
                      <Check size={13} />
                    )}
                    {priority.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="muscle-volume-note">
              <BarChart3 size={16} />
              <p>
                {selectedMuscle.sets < 6
                  ? "A low-volume maintenance signal for this mockup."
                  : selectedMuscle.sets <= 18
                    ? "A productive range with room to adjust from feedback."
                    : "Higher volume adds diminishing returns and recovery cost."}
              </p>
            </div>
          </div>

          <div className="muscle-list" aria-label="All muscle groups">
            {MUSCLE_GROUPS.map((muscle) => {
              const setting = activeScenario.muscles[muscle.id];
              return (
                <button
                  key={muscle.id}
                  type="button"
                  className={activeMuscle === muscle.id ? "is-active" : ""}
                  onClick={() => setActiveMuscle(muscle.id)}
                >
                  <span
                    style={{
                      background: muscle.color,
                      opacity: 0.35 + Math.min(0.65, setting.sets / 30),
                    }}
                  />
                  <p>
                    <strong>{muscle.shortLabel}</strong>
                    <small>
                      {PRIORITIES.find(
                        (priority) => priority.id === setting.priority,
                      )?.label}
                    </small>
                  </p>
                  <b>{setting.sets}</b>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="comparison-section panel-card">
        <header className="panel-card__header">
          <div>
            <span className="eyebrow">Side-by-side review</span>
            <h2>Compare scenarios</h2>
          </div>
          <span className="compare-summary">
            <ArrowRightLeft size={15} />
            B is {Math.abs(comparison.readiness)} points{" "}
            {comparison.readiness >= 0 ? "more" : "less"} ready
          </span>
        </header>

        <div className="scenario-comparison-grid">
          {scenarios.map((scenario) => {
            const result = results[scenario.id];
            const scenarioLetter =
              scenario.id === "scenario-a" ? "A" : "B";
            return (
              <article
                key={scenario.id}
                className={`compare-card compare-card--${scenarioLetter.toLowerCase()}`}
              >
                <header>
                  <span>{scenarioLetter}</span>
                  <div>
                    <h3>{scenario.name}</h3>
                    <p>
                      {GOALS.find((goal) => goal.id === scenario.goal)?.label} ·{" "}
                      {scenario.daysPerWeek} days/week
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onActiveScenarioChange(scenario.id)}
                  >
                    Edit
                    <ChevronRight size={13} />
                  </button>
                </header>
                <div className="compare-score-row">
                  <span>
                    <b>{result.adaptation}</b>
                    <small>Adaptation</small>
                  </span>
                  <span>
                    <b>{result.readiness}</b>
                    <small>Readiness</small>
                  </span>
                  <span>
                    <b>{Math.round(result.balance * 100)}</b>
                    <small>Balance</small>
                  </span>
                </div>
                <div className="compare-bars">
                  {[
                    ["Growth", result.growth],
                    ["Definition", result.definition],
                    ["Stimulus", result.stimulus],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <span>
                        {label as string}
                        <b>{Math.round((value as number) * 100)}</b>
                      </span>
                      <i>
                        <em style={{ width: `${(value as number) * 100}%` }} />
                      </i>
                    </div>
                  ))}
                </div>
                <footer>
                  <span>{scenario.values.proteinPerKg} g/kg protein</span>
                  <span>{result.averageSets.toFixed(1)} avg sets</span>
                  <span>{scenario.values.weeks} weeks</span>
                </footer>
              </article>
            );
          })}

          <aside className="comparison-delta">
            <span className="card-kicker">
              <Copy size={14} />
              Key differences
            </span>
            <div>
              <span>
                <b>
                  {comparison.adaptation >= 0 ? "+" : ""}
                  {comparison.adaptation}
                </b>
                adaptation points in B
              </span>
              <span>
                <b>
                  {comparison.readiness >= 0 ? "+" : ""}
                  {comparison.readiness}
                </b>
                readiness points in B
              </span>
              <span>
                <b>
                  {comparison.recovery >= 0 ? "−" : "+"}
                  {Math.abs(comparison.recovery)}%
                </b>
                recovery load in B
              </span>
            </div>
            <p>
              These scores compare input relationships. They are not forecasts
              of exact physical outcomes.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}

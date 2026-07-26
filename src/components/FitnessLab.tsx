"use client";

import { Info, Rotate3D, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CharacterEditor,
  useCharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  derivePhysique,
  INITIAL_VALUES,
  METRICS,
  MetricId,
  SimulationValues,
} from "@/lib/simulation";
import { GuideDialog } from "./lab/GuideDialog";
import { MetricCard } from "./lab/MetricCard";
import { ResultPanel } from "./lab/ResultPanel";

export function FitnessLab() {
  const [values, setValues] = useState<SimulationValues>(INITIAL_VALUES);
  const [activeMetric, setActiveMetric] = useState<MetricId | null>("protein");
  const [guideOpen, setGuideOpen] = useState(false);
  const [characterEditorOpen, setCharacterEditorOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const result = useMemo(() => derivePhysique(values), [values]);
  const {
    profile,
    updateMeasurement,
    updateName,
    updateBodyColor,
    resetProfile,
  } = useCharacterProfile();

  const changeMetric = (id: MetricId, next: number) => {
    const definition = METRICS.find((metric) => metric.id === id);
    if (!definition) return;
    const stepped =
      Math.round(next / definition.step) * definition.step;
    const clamped = Math.min(
      definition.max,
      Math.max(definition.min, stepped),
    );
    setValues((current) => ({ ...current, [id]: clamped }));
    setActiveMetric(id);
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setActiveMetric(null);
    resetProfile();
  };

  const leftMetrics = METRICS.slice(0, 2);
  const rightMetrics = METRICS.slice(2);

  return (
    <div className="lab-page">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="topbar">
        <a className="brand" href="#lab" aria-label="FormForge home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>
            <strong>FORMFORGE</strong>
            <small>Body progression lab</small>
          </span>
        </a>

        <div className="topbar-status" aria-label="Simulation status">
          <i />
          Model responding live
        </div>

        <nav aria-label="Page actions">
          <button className="topbar-button" onClick={() => setGuideOpen(true)}>
            <Info size={16} />
            <span>How it works</span>
          </button>
          <button className="reset-button" onClick={reset}>
            <RotateCcw size={15} />
            Reset
          </button>
        </nav>
      </header>

      <main id="lab">
        <div className="intro">
          <p className="eyebrow">
            <span>Interactive study 01</span>
            <i />
            Adaptation engine
          </p>
          <h1>
            Shape the inputs.
            <span>Watch the form respond.</span>
          </h1>
          <p className="intro-copy">
            Tune the training variables and your character’s base measurements
            to explore an evolving, editable physique model.
          </p>
        </div>

        <div className="lab-layout">
          <aside
            className="metric-stack metric-stack--left"
            aria-label="Nutrition and volume controls"
          >
            {leftMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                value={values[metric.id]}
                isActive={activeMetric === metric.id}
                onChange={changeMetric}
                onActivate={setActiveMetric}
              />
            ))}
          </aside>

          <section
            className="model-stage"
            aria-label="Interactive character visualization"
          >
            <div className="stage-grid" aria-hidden="true" />
            <div className="stage-orbit stage-orbit--outer" aria-hidden="true" />
            <div className="stage-orbit stage-orbit--inner" aria-hidden="true" />
            <div className="stage-label stage-label--top">
              <span>FORM / 01</span>
              <b>{result.stage}</b>
            </div>
            <div className="stage-label stage-label--side">
              <span>{profile.name || "Athlete 01"} / adaptive morphology</span>
            </div>
            <div className="canvas-wrap">
              <CharacterScene
                profile={profile}
                growth={result.growth}
                definition={result.definition}
                stimulus={result.stimulus}
                reducedMotion={reducedMotion}
              />
            </div>
            <CharacterEditor
              profile={profile}
              open={characterEditorOpen}
              onOpenChange={setCharacterEditorOpen}
              onMeasurementChange={updateMeasurement}
              onNameChange={updateName}
              onBodyColorChange={updateBodyColor}
              onReset={resetProfile}
            />
            {!characterEditorOpen && (
              <div className="orbit-hint">
                <Rotate3D size={15} />
                Drag to inspect
              </div>
            )}
            <div
              className="screenreader-summary sr-only"
              aria-live="polite"
            >
              {profile.name || "Athlete 01"}, {profile.measurements.heightCm}{" "}
              centimeters and {profile.measurements.weightKg} kilograms.
              Adaptation signal {result.adaptation} percent. {result.status}{" "}
              over {values.weeks} weeks.
            </div>
          </section>

          <aside
            className="metric-stack metric-stack--right"
            aria-label="Intensity and time controls"
          >
            {rightMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                value={values[metric.id]}
                isActive={activeMetric === metric.id}
                onChange={changeMetric}
                onActivate={setActiveMetric}
              />
            ))}
          </aside>
        </div>

        <ResultPanel result={result} reducedMotion={reducedMotion} />

        <footer className="page-footer">
          <p>
            A visual simulation for exploration—not a physiological prediction.
          </p>
          <span>FORMFORGE / 2026</span>
        </footer>
      </main>

      {guideOpen && <GuideDialog onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

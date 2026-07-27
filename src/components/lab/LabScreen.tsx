"use client";

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CircleGauge,
  Droplets,
  Scale,
  Sparkles,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  BODY_FAT_METHODS,
  METRICS,
  MODEL_SOURCES,
  MUSCLE_GROUPS,
  MetricId,
  MuscleGroupId,
  MuscleSetting,
  PhysiqueResult,
  PredictionInterval,
  RequiredInputKey,
  TrainingProgram,
} from "@/lib/simulation";

type LabScreenProps = {
  program: TrainingProgram;
  result: PhysiqueResult;
  profile: CharacterProfile;
  reducedMotion: boolean;
  onProgramChange: (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => void;
  characterEditorOpen: boolean;
  onCharacterEditorOpenChange: (open: boolean) => void;
  onMeasurementChange: (id: CharacterMeasurementId, value: number) => void;
  onBodyTypeChange: (bodyType: CharacterBodyType) => void;
  onAppearanceChange: <K extends keyof CharacterAppearance>(
    id: K,
    value: CharacterAppearance[K],
  ) => void;
  onResetCharacter: () => void;
};

const GLOBAL_METRICS = [
  "age",
  "trainingYears",
  "weeks",
  "dailyCalories",
  "proteinGrams",
  "sleepHours",
  "adherence",
] as const satisfies readonly MetricId[];

const BODY_MEASUREMENTS: Array<{
  id: CharacterMeasurementId;
  label: string;
  unit: string;
  step: number;
}> = [
  { id: "heightCm", label: "Height", unit: "cm", step: 1 },
  { id: "weightKg", label: "Weight", unit: "kg", step: 0.5 },
  { id: "bodyFatPct", label: "Body fat", unit: "%", step: 0.5 },
  { id: "waistCm", label: "Waist", unit: "cm", step: 0.5 },
  { id: "neckCm", label: "Neck", unit: "cm", step: 0.5 },
  { id: "chestCm", label: "Chest", unit: "cm", step: 0.5 },
  { id: "upperArmCm", label: "Upper arm", unit: "cm", step: 0.5 },
  { id: "thighCm", label: "Thigh", unit: "cm", step: 0.5 },
  { id: "hipCm", label: "Hip", unit: "cm", step: 0.5 },
];

const MUSCLE_NUMBER_FIELDS = [
  "sets",
  "indirectSets",
  "reps",
  "rir",
  "frequency",
] as const satisfies ReadonlyArray<
  Exclude<keyof MuscleSetting, "exercise" | "priority">
>;

const ZERO_MUSCLE_SIGNALS = MUSCLE_GROUPS.reduce(
  (signals, muscle) => {
    signals[muscle.id] = 0;
    return signals;
  },
  {} as Record<MuscleGroupId, number>,
);

const getInterval = (
  intervals: PredictionInterval[],
  level: PredictionInterval["level"],
) => intervals.find((interval) => interval.level === level) ?? intervals[0];

const formatSigned = (value: number, digits = 1) =>
  `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;

function RequiredMark({ confirmed }: { confirmed: boolean }) {
  return (
    <span
      className={`required-mark ${confirmed ? "is-confirmed" : ""}`}
      title={confirmed ? "Confirmed by you" : "Using a population prior"}
    >
      {confirmed ? <BadgeCheck size={11} /> : <span />}
      {confirmed ? "confirmed" : "required"}
    </span>
  );
}

export function LabScreen({
  program,
  result,
  profile,
  reducedMotion,
  onProgramChange,
  characterEditorOpen,
  onCharacterEditorOpenChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
  onResetCharacter,
}: LabScreenProps) {
  const [projectionView, setProjectionView] = useState<
    "starting" | "projected"
  >("starting");
  const [intervalLevel, setIntervalLevel] =
    useState<PredictionInterval["level"]>(80);
  const [muscleInputsOpen, setMuscleInputsOpen] = useState(true);

  const confirmedInputs = useMemo(
    () => new Set(program.confirmedInputs ?? []),
    [program.confirmedInputs],
  );
  const confirmedMuscles = useMemo(
    () => new Set(program.confirmedMuscles ?? []),
    [program.confirmedMuscles],
  );

  const confirmInput = (key: RequiredInputKey) => {
    onProgramChange((current) => ({
      ...current,
      confirmedInputs: current.confirmedInputs.includes(key)
        ? current.confirmedInputs
        : [...current.confirmedInputs, key],
    }));
  };

  const changeMetric = (id: MetricId, value: number) => {
    if (!Number.isFinite(value)) return;
    onProgramChange((current) => ({
      ...current,
      values: { ...current.values, [id]: value },
      confirmedInputs: current.confirmedInputs.includes(id)
        ? current.confirmedInputs
        : [...current.confirmedInputs, id],
    }));
  };

  const changeMeasurement = (
    id: CharacterMeasurementId,
    value: number,
  ) => {
    if (!Number.isFinite(value)) return;
    onMeasurementChange(id, value);
    confirmInput(id);
  };

  const changeSex = (bodyType: CharacterBodyType) => {
    onBodyTypeChange(bodyType);
    confirmInput("sex");
  };

  const changeBodyFatMethod = (event: ChangeEvent<HTMLSelectElement>) => {
    const bodyFatMethod =
      BODY_FAT_METHODS.find((method) => method.id === event.target.value)?.id ??
      "unknown";
    onProgramChange((current) => ({
      ...current,
      bodyFatMethod,
      confirmedInputs: current.confirmedInputs.includes("bodyFatMethod")
        ? current.confirmedInputs
        : [...current.confirmedInputs, "bodyFatMethod"],
    }));
  };

  const changeMuscle = <K extends keyof MuscleSetting>(
    id: MuscleGroupId,
    field: K,
    value: MuscleSetting[K],
  ) => {
    onProgramChange((current) => ({
      ...current,
      muscles: {
        ...current.muscles,
        [id]: {
          ...current.muscles[id],
          [field]: value,
        },
      },
      confirmedMuscles: current.confirmedMuscles.includes(id)
        ? current.confirmedMuscles
        : [...current.confirmedMuscles, id],
    }));
  };

  const selectedLeanInterval = getInterval(
    result.leanGainIntervals,
    intervalLevel,
  );
  const startingDefinition = Math.min(
    1,
    Math.max(
      0,
      ((profile.bodyType === "male" ? 32 : 42) -
        result.startingBodyFatPct) /
        (profile.bodyType === "male" ? 26 : 34),
    ),
  );
  const visibleSignals =
    projectionView === "projected"
      ? result.muscleSignals
      : ZERO_MUSCLE_SIGNALS;

  return (
    <div className="lab-screen scientific-lab screen-enter">
      <header className="screen-heading lab-heading">
        <div>
          <span className="eyebrow">Probabilistic physique model</span>
          <h1>Physique Lab</h1>
          <p>
            A per-muscle estimate grounded in longitudinal resistance-training
            cohorts, with uncertainty shown instead of hidden.
          </p>
        </div>
        <div className="model-status-cluster">
          <span className="estimate-badge">
            <BrainCircuit size={14} />
            {result.estimateLabel} · {result.modelVersion}
          </span>
          <span
            className={`input-completeness ${
              result.missingInputs.length === 0 ? "is-complete" : ""
            }`}
          >
            {result.missingInputs.length === 0
              ? "All required inputs confirmed"
              : `${result.missingInputs.length} priors still in use`}
          </span>
        </div>
      </header>

      <section className="scientific-stage" data-testid="physique-stage">
        <article className="scientific-stage__mesh">
          <header>
            <span>
              <Activity size={13} />
              Regional 3D projection
            </span>
            <small>Drag 360° · Scroll to zoom</small>
          </header>
          <div
            className="projection-view-toggle scientific-view-toggle"
            role="group"
            aria-label="Character view"
          >
            <button
              type="button"
              className={projectionView === "starting" ? "is-active" : ""}
              aria-pressed={projectionView === "starting"}
              onClick={() => setProjectionView("starting")}
            >
              Starting body
            </button>
            <button
              type="button"
              className={projectionView === "projected" ? "is-active" : ""}
              aria-pressed={projectionView === "projected"}
              onClick={() => setProjectionView("projected")}
            >
              {result.durationWeeks}-week estimate
            </button>
          </div>
          <div
            className="scientific-character"
            aria-label="3D character projection box"
            data-projection-box
          >
            <CharacterScene
              profile={profile}
              growth={projectionView === "projected" ? result.growth : 0}
              definition={
                projectionView === "projected"
                  ? result.definition
                  : startingDefinition
              }
              stimulus={
                projectionView === "projected" ? result.stimulus : 0
              }
              baselineMuscularity={result.baselineMuscularity}
              muscleSignals={visibleSignals}
              reducedMotion={reducedMotion}
              interactive
            />
          </div>
          <button
            className="mesh-adjust-button"
            type="button"
            onClick={() => onCharacterEditorOpenChange(true)}
          >
            <CircleGauge size={14} />
            Appearance controls
          </button>
          <div className="mesh-calibration-note">
            <Scale size={13} />
            <span>
              Mesh deltas use cube-root MRI volume conversion. Baseline
              muscularity uses FFMI plus arm and thigh measurements.
            </span>
          </div>

          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={onCharacterEditorOpenChange}
            onMeasurementChange={changeMeasurement}
            onBodyTypeChange={changeSex}
            onAppearanceChange={onAppearanceChange}
            onReset={onResetCharacter}
          />
        </article>

        <aside className="projection-summary-card">
          <div className="projection-summary-card__heading">
            <span className="card-kicker">
              <Sparkles size={13} />
              Posterior centre
            </span>
            <strong>
              {formatSigned(result.estimatedLeanGainKg, 2)}
              <small> kg skeletal muscle tissue</small>
            </strong>
            <p>{result.status}</p>
          </div>

          <div className="interval-selector" role="group" aria-label="Prediction interval">
            {([50, 80, 95, 99] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={intervalLevel === level ? "is-active" : ""}
                aria-pressed={intervalLevel === level}
                onClick={() => setIntervalLevel(level)}
              >
                {level}%
              </button>
            ))}
          </div>
          <div className="selected-interval" data-testid="selected-interval">
            <span>{intervalLevel}% prediction interval</span>
            <strong>
              {formatSigned(selectedLeanInterval.lower, 2)} to{" "}
              {formatSigned(selectedLeanInterval.upper, 2)} kg
            </strong>
            <small>
              Interval coverage target—not {intervalLevel}% point accuracy.
            </small>
          </div>

          <div className="projection-stat-grid">
            <span>
              <small>Projected weight</small>
              <b>{result.projectedWeightKg.toFixed(1)} kg</b>
            </span>
            <span>
              <small>Projected body fat</small>
              <b>{result.projectedBodyFatPct.toFixed(1)}%</b>
            </span>
            <span>
              <small>Protein</small>
              <b>{result.proteinPerKg.toFixed(2)} g/kg</b>
            </span>
            <span>
              <small>Uncertainty</small>
              <b>×{result.uncertaintyMultiplier.toFixed(2)}</b>
            </span>
          </div>

          <div className="estimate-warning">
            <AlertTriangle size={15} />
            <p>
              <strong>This is an estimate, not a diagnosis or promise.</strong>
              Genetics and true individual response remain latent until repeated
              standardized measurements update the model.
            </p>
          </div>
        </aside>
      </section>

      <section className="input-section" aria-labelledby="required-inputs-title">
        <header className="section-title-row">
          <div>
            <span className="card-kicker">Required model inputs</span>
            <h2 id="required-inputs-title">Profile, intake and recovery</h2>
          </div>
          <p>
            Defaults are population priors. Touch each field to confirm your
            value and narrow uncertainty.
          </p>
        </header>

        <div className="required-input-layout">
          <article className="input-panel">
            <h3>Demographics & plan</h3>
            <div className="sex-control">
              <span>
                Sex
                <RequiredMark confirmed={confirmedInputs.has("sex")} />
              </span>
              <div role="group" aria-label="Sex">
                {(["male", "female"] as const).map((bodyType) => (
                  <button
                    key={bodyType}
                    type="button"
                    className={profile.bodyType === bodyType ? "is-active" : ""}
                    aria-pressed={profile.bodyType === bodyType}
                    onClick={() => changeSex(bodyType)}
                  >
                    {bodyType === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
            <div className="compact-input-grid">
              {GLOBAL_METRICS.map((id) => {
                const definition = METRICS.find((candidate) => candidate.id === id)!;
                return (
                  <label key={id} className="scientific-number-input">
                    <span>
                      {definition.label}
                      <RequiredMark confirmed={confirmedInputs.has(id)} />
                    </span>
                    <div>
                      <input
                        type="number"
                        min={definition.min}
                        max={definition.max}
                        step={definition.step}
                        value={program.values[id]}
                        onChange={(event) =>
                          changeMetric(id, Number(event.target.value))
                        }
                        aria-label={definition.label}
                      />
                      <small>{definition.shortUnit}</small>
                    </div>
                  </label>
                );
              })}
            </div>
          </article>

          <article className="input-panel">
            <h3>Body measurements</h3>
            <div className="compact-input-grid">
              {BODY_MEASUREMENTS.map((measurement) => (
                <label
                  key={measurement.id}
                  className="scientific-number-input"
                >
                  <span>
                    {measurement.label}
                    <RequiredMark
                      confirmed={confirmedInputs.has(measurement.id)}
                    />
                  </span>
                  <div>
                    <input
                      type="number"
                      step={measurement.step}
                      value={profile.measurements[measurement.id]}
                      onChange={(event) =>
                        changeMeasurement(
                          measurement.id,
                          Number(event.target.value),
                        )
                      }
                      aria-label={measurement.label}
                    />
                    <small>{measurement.unit}</small>
                  </div>
                </label>
              ))}
              <label className="scientific-number-input scientific-select-input">
                <span>
                  Body-fat method
                  <RequiredMark
                    confirmed={confirmedInputs.has("bodyFatMethod")}
                  />
                </span>
                <select
                  value={program.bodyFatMethod}
                  onChange={changeBodyFatMethod}
                  aria-label="Body-fat method"
                >
                  {BODY_FAT_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label} (±{method.typicalErrorPct}% typical)
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        </div>
      </section>

      <section className="input-section muscle-dose-section">
        <header className="section-title-row">
          <div>
            <span className="card-kicker">Per-muscle exposure</span>
            <h2>Exercises and weekly dose</h2>
          </div>
          <button
            type="button"
            className="section-collapse-button"
            aria-expanded={muscleInputsOpen}
            onClick={() => setMuscleInputsOpen((open) => !open)}
          >
            {confirmedMuscles.size}/{MUSCLE_GROUPS.length} confirmed
            <ChevronDown
              size={14}
              className={muscleInputsOpen ? "is-open" : ""}
            />
          </button>
        </header>

        {muscleInputsOpen ? (
          <div className="muscle-dose-table" role="table" aria-label="Per-muscle training inputs">
            <div className="muscle-dose-row muscle-dose-row--head" role="row">
              <span>Muscle / exercise</span>
              <span>Direct sets</span>
              <span>Indirect sets</span>
              <span>Reps</span>
              <span>RIR</span>
              <span>Frequency</span>
            </div>
            {MUSCLE_GROUPS.map((muscle) => {
              const setting = program.muscles[muscle.id];
              return (
                <div
                  key={muscle.id}
                  className={`muscle-dose-row ${
                    confirmedMuscles.has(muscle.id) ? "is-confirmed" : ""
                  }`}
                  role="row"
                >
                  <label className="muscle-exercise-input">
                    <span>
                      <i style={{ background: muscle.color }} />
                      {muscle.label}
                      <RequiredMark
                        confirmed={confirmedMuscles.has(muscle.id)}
                      />
                    </span>
                    <input
                      type="text"
                      value={setting.exercise}
                      onChange={(event) =>
                        changeMuscle(muscle.id, "exercise", event.target.value)
                      }
                      aria-label={`${muscle.label} exercise`}
                    />
                  </label>
                  {MUSCLE_NUMBER_FIELDS.map((field) => (
                    <label key={field}>
                      <span className="mobile-field-label">
                        {field === "sets"
                          ? "Direct sets"
                          : field === "indirectSets"
                            ? "Indirect sets"
                            : field === "frequency"
                              ? "Frequency"
                              : field.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        min={field === "rir" || field.includes("Sets") || field === "sets" ? 0 : 1}
                        max={
                          field === "rir"
                            ? 8
                            : field === "frequency"
                              ? 7
                              : field === "reps"
                                ? 50
                                : 40
                        }
                        step={1}
                        value={setting[field]}
                        onChange={(event) =>
                          changeMuscle(
                            muscle.id,
                            field,
                            Math.max(0, Number(event.target.value)),
                          )
                        }
                        aria-label={`${muscle.label} ${field}`}
                      />
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        ) : null}
        <p className="dose-method-note">
          Direct sets receive full dose. Indirect sets use a conservative,
          uncertainty-bearing 0.4 effective-set prior; frequency distributes
          volume but is not awarded an independent hypertrophy bonus.
        </p>
      </section>

      <section className="results-section" aria-labelledby="projection-results-title">
        <header className="section-title-row">
          <div>
            <span className="card-kicker">Posterior decomposition</span>
            <h2 id="projection-results-title">What the scale change contains</h2>
          </div>
          <p>Fat, muscle tissue, glycogen and water are not conflated.</p>
        </header>
        <div className="component-grid">
          {result.components.map((component) => (
            <article key={component.id} className={`component-card component-card--${component.id}`}>
              <span>
                {component.id === "water" || component.id === "glycogen" ? (
                  <Droplets size={15} />
                ) : (
                  <BarChart3 size={15} />
                )}
                {component.label}
              </span>
              <strong>{formatSigned(component.changeKg, 2)} kg</strong>
              <small>
                {component.startingKg.toFixed(1)} →{" "}
                {component.projectedKg.toFixed(1)} kg · uncertainty ±
                {component.uncertaintyKg.toFixed(1)}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="results-section">
        <header className="section-title-row">
          <div>
            <span className="card-kicker">Regional posterior</span>
            <h2>Per-muscle hypertrophy</h2>
          </div>
          <p>{intervalLevel}% intervals include responder and measurement variability.</p>
        </header>
        <div className="muscle-result-table">
          <div className="muscle-result-row muscle-result-row--head">
            <span>Muscle</span>
            <span>Effective sets</span>
            <span>Mean estimate</span>
            <span>{intervalLevel}% interval</span>
            <span>Mesh radius</span>
          </div>
          {MUSCLE_GROUPS.map((muscle) => {
            const projection = result.muscleProjections[muscle.id];
            const interval = getInterval(projection.intervals, intervalLevel);
            return (
              <div key={muscle.id} className="muscle-result-row">
                <span>
                  <i style={{ background: muscle.color }} />
                  <b>{muscle.label}</b>
                  <small>{projection.evidenceGrade} evidence</small>
                </span>
                <span>{projection.effectiveSets.toFixed(1)}</span>
                <span>{formatSigned(projection.meanPercent, 1)}%</span>
                <span>
                  {formatSigned(interval.lower, 1)} to{" "}
                  {formatSigned(interval.upper, 1)}%
                </span>
                <span>{formatSigned(projection.radialMeshChange * 100, 2)}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="validation-section" data-testid="model-validation">
        <article className="validation-card">
          <header>
            <span className="card-kicker">
              <BarChart3 size={13} />
              Held-out validation
            </span>
            <h2>Study-level performance on unseen cohorts</h2>
            <p>{result.validation.scope}</p>
          </header>
          <div className="validation-metric-grid">
            <span>
              <small>MAE</small>
              <b>{result.validation.maePercentPoints.toFixed(2)} pp</b>
              <em>regional hypertrophy</em>
            </span>
            <span>
              <small>Mean bias</small>
              <b>{formatSigned(result.validation.meanBiasPercentPoints, 2)} pp</b>
              <em>predicted − observed</em>
            </span>
            <span>
              <small>Calibration error</small>
              <b>{result.validation.calibrationErrorPercentPoints.toFixed(1)} pp</b>
              <em>mean coverage gap</em>
            </span>
            <span>
              <small>Holdout sample</small>
              <b>{result.validation.holdoutCohorts} cohorts</b>
              <em>{result.validation.participants} participant-records</em>
            </span>
          </div>
          <div className="coverage-grid">
            {result.validation.coverage.map((coverage) => (
              <span key={coverage.level}>
                <small>{coverage.level}% target</small>
                <b>{coverage.observed.toFixed(1)}% observed</b>
                <i>
                  <span
                    style={{ width: `${Math.min(100, coverage.observed)}%` }}
                  />
                </i>
              </span>
            ))}
          </div>
          <div className="validation-honesty">
            <AlertTriangle size={15} />
            <p>
              A cohort-level MAE cannot be translated into personal point
              accuracy. The 99% output is deliberately an interval, never a
              claim that one number is 99% correct.
            </p>
          </div>
        </article>

        <article className="evidence-card">
          <header>
            <span className="card-kicker">
              <BookOpen size={13} />
              Evidence map
            </span>
            <h2>Longitudinal anchors</h2>
            <p>
              Primary studies are separated by the role they play in the
              estimator.
            </p>
          </header>
          <div>
            {MODEL_SOURCES.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>{source.label}</span>
                <small>{source.role}</small>
              </a>
            ))}
          </div>
        </article>
      </section>

      {result.missingInputs.length > 0 ? (
        <section className="missing-input-banner">
          <AlertTriangle size={16} />
          <div>
            <strong>Estimate widened for unconfirmed inputs</strong>
            <p>{result.guidance}</p>
            <div>
              {result.missingInputs.slice(0, 8).map((input) => (
                <span key={input}>{input}</span>
              ))}
              {result.missingInputs.length > 8 ? (
                <span>+{result.missingInputs.length - 8} more</span>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="missing-input-banner is-complete">
          <BadgeCheck size={17} />
          <div>
            <strong>Required input set complete</strong>
            <p>{result.guidance}</p>
          </div>
        </section>
      )}
    </div>
  );
}

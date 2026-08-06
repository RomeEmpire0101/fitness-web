"use client";

import {
  Activity,
  BadgeCheck,
  CircleGauge,
  SlidersHorizontal,
} from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  useMemo,
  useState,
} from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import { CHARACTER_MEASUREMENTS } from "@/features/characters/config";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  BODY_FAT_METHODS,
  METRICS,
  MODEL_VERSION,
  MUSCLE_GROUPS,
  MetricId,
  MuscleGroupId,
  MusclePriority,
  MuscleSetting,
  PhysiqueResult,
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

type InputMode = "training" | "body" | "muscle";

const TRAINING_INPUT_IDS = [
  "age",
  "trainingYears",
  "weeks",
  "adherence",
] as const satisfies readonly MetricId[];

const RECOVERY_INPUT_IDS = [
  "dailyCalories",
  "proteinGrams",
  "sleepHours",
] as const satisfies readonly MetricId[];

const REQUIRED_GLOBAL_INPUTS = [
  "age",
  "sex",
  "trainingYears",
  "dailyCalories",
  "proteinGrams",
  "sleepHours",
  "adherence",
  "weeks",
  "heightCm",
  "weightKg",
  "bodyFatPct",
  "bodyFatMethod",
  "waistCm",
  "neckCm",
  "chestCm",
  "upperArmCm",
  "thighCm",
  "hipCm",
] as const satisfies readonly RequiredInputKey[];

const MUSCLE_LIMITS: Record<
  Exclude<keyof MuscleSetting, "exercise" | "priority">,
  { label: string; unit: string; min: number; max: number; step: number }
> = {
  sets: { label: "Direct sets", unit: "sets", min: 0, max: 40, step: 1 },
  indirectSets: {
    label: "Indirect sets",
    unit: "sets",
    min: 0,
    max: 40,
    step: 1,
  },
  reps: { label: "Average reps", unit: "reps", min: 1, max: 40, step: 1 },
  rir: { label: "Reps in reserve", unit: "RIR", min: 0, max: 6, step: 1 },
  frequency: {
    label: "Weekly frequency",
    unit: "days",
    min: 1,
    max: 7,
    step: 1,
  },
};

const getMetric = (id: MetricId) =>
  METRICS.find((metric) => metric.id === id)!;

const precisionFor = (step: number) => {
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Math.min(decimals, 2);
};

type NumberVariableProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  confirmed?: boolean;
  onChange: (value: number) => void;
};

function NumberVariable({
  label,
  value,
  unit,
  min,
  max,
  step,
  confirmed = false,
  onChange,
}: NumberVariableProps) {
  const precision = precisionFor(step);
  const formatValue = (next: number) => next.toFixed(precision);
  const [draft, setDraft] = useState(formatValue(value));
  const [editing, setEditing] = useState(false);
  const progress = ((value - min) / Math.max(max - min, 1)) * 100;

  const updateNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const next = Number(raw);
    setDraft(raw);
    if (raw !== "" && Number.isFinite(next) && next >= min && next <= max) {
      onChange(next);
    }
  };

  const commitNumber = () => {
    setEditing(false);
    const parsed = Number(draft);
    const stepped = Number.isFinite(parsed)
      ? Math.round(parsed / step) * step
      : value;
    const next = Math.min(max, Math.max(min, stepped));
    onChange(next);
    setDraft(formatValue(next));
  };

  const handleNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <label
      className="input-variable-pill streamlined-variable"
      style={{ "--input-progress": `${progress}%` } as CSSProperties}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="streamlined-variable__label">
        {label}
        <i className={confirmed ? "is-confirmed" : ""} aria-hidden="true" />
      </span>
      <span className="input-variable-pill__number">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={editing ? draft : formatValue(value)}
          onFocus={() => {
            setDraft(formatValue(value));
            setEditing(true);
          }}
          onChange={updateNumber}
          onBlur={commitNumber}
          onKeyDown={handleNumberKey}
          aria-label={label}
        />
        <b>{unit}</b>
      </span>
      <input
        className="input-variable-pill__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`Adjust ${label}`}
      />
    </label>
  );
}

type SelectVariableProps = {
  label: string;
  value: string;
  confirmed?: boolean;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

function SelectVariable({
  label,
  value,
  confirmed = false,
  options,
  onChange,
}: SelectVariableProps) {
  return (
    <label
      className="input-variable-pill streamlined-select-variable"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="streamlined-variable__label">
        {label}
        <i className={confirmed ? "is-confirmed" : ""} aria-hidden="true" />
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
  >("projected");
  const [inputMode, setInputMode] = useState<InputMode>("training");
  const [selectedMuscle, setSelectedMuscle] =
    useState<MuscleGroupId>("chest");

  const confirmedInputs = useMemo(
    () => new Set(program.confirmedInputs ?? []),
    [program.confirmedInputs],
  );
  const confirmedMuscles = useMemo(
    () => new Set(program.confirmedMuscles ?? []),
    [program.confirmedMuscles],
  );
  const completedInputCount =
    REQUIRED_GLOBAL_INPUTS.filter((key) => confirmedInputs.has(key)).length +
    Math.min(confirmedMuscles.size, MUSCLE_GROUPS.length);
  const totalInputCount = REQUIRED_GLOBAL_INPUTS.length + MUSCLE_GROUPS.length;

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

  const changeMeasurement = (id: CharacterMeasurementId, value: number) => {
    if (!Number.isFinite(value)) return;
    onMeasurementChange(id, value);
    confirmInput(id);
  };

  const changeSex = (bodyType: CharacterBodyType) => {
    onBodyTypeChange(bodyType);
    confirmInput("sex");
  };

  const changeBodyFatMethod = (value: string) => {
    const bodyFatMethod =
      BODY_FAT_METHODS.find((method) => method.id === value)?.id ?? "unknown";
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
        [id]: { ...current.muscles[id], [field]: value },
      },
      confirmedMuscles: current.confirmedMuscles.filter(
        (muscleId) => muscleId !== id,
      ),
    }));
  };

  const confirmMuscle = (id: MuscleGroupId) => {
    onProgramChange((current) => ({
      ...current,
      confirmedMuscles: current.confirmedMuscles.includes(id)
        ? current.confirmedMuscles
        : [...current.confirmedMuscles, id],
    }));
  };

  const startingDefinition = Math.min(
    1,
    Math.max(
      0,
      ((profile.bodyType === "male" ? 32 : 42) - result.startingBodyFatPct) /
        (profile.bodyType === "male" ? 26 : 34),
    ),
  );
  const activeMuscle = program.muscles[selectedMuscle];
  const muscle = MUSCLE_GROUPS.find(
    (muscle) => muscle.id === selectedMuscle,
  )!;

  const renderMetric = (id: MetricId) => {
    const metric = getMetric(id);
    return (
      <NumberVariable
        key={metric.id}
        label={metric.label}
        value={program.values[metric.id]}
        unit={metric.shortUnit}
        min={metric.min}
        max={metric.max}
        step={metric.step}
        confirmed={confirmedInputs.has(metric.id)}
        onChange={(value) => changeMetric(metric.id, value)}
      />
    );
  };

  const renderMeasurement = (id: CharacterMeasurementId) => {
    const measurement = CHARACTER_MEASUREMENTS.find((item) => item.id === id)!;
    return (
      <NumberVariable
        key={measurement.id}
        label={measurement.label}
        value={profile.measurements[measurement.id]}
        unit={measurement.unit}
        min={measurement.min}
        max={measurement.max}
        step={measurement.step}
        confirmed={confirmedInputs.has(measurement.id)}
        onChange={(value) => changeMeasurement(measurement.id, value)}
      />
    );
  };

  const renderMuscleNumber = (
    field: Exclude<keyof MuscleSetting, "exercise" | "priority">,
  ) => {
    const limits = MUSCLE_LIMITS[field];
    return (
      <NumberVariable
        key={field}
        label={limits.label}
        value={activeMuscle[field]}
        unit={limits.unit}
        min={limits.min}
        max={limits.max}
        step={limits.step}
        confirmed={confirmedMuscles.has(selectedMuscle)}
        onChange={(value) => changeMuscle(selectedMuscle, field, value)}
      />
    );
  };

  return (
    <div className="lab-screen streamlined-lab screen-enter">
      <header className="screen-heading lab-heading streamlined-lab__heading">
        <div>
          <span className="eyebrow">Anatomy studio · {MODEL_VERSION}</span>
          <h1>Physique Lab</h1>
          <p>Set the variables around the model, then compare the projection.</p>
        </div>
        <span
          className={`streamlined-completeness ${
            result.missingInputs.length === 0 ? "is-complete" : ""
          }`}
        >
          <BadgeCheck size={13} />
          {completedInputCount}/{totalInputCount} inputs captured
        </span>
      </header>

      <section className="lab-workspace">
        <article className="lab-stage-card streamlined-lab-stage">
          <header>
            <div>
              <Activity size={13} aria-hidden="true" />
              Live projection
            </div>
            <span>Drag 360° · Scroll to zoom</span>
          </header>

          <div
            className="projection-view-toggle"
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
              Projected · {result.durationWeeks} weeks
            </button>
          </div>

          <div
            className="lab-character"
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
              stimulus={projectionView === "projected" ? result.stimulus : 0}
              baselineMuscularity={result.baselineMuscularity}
              muscleSignals={
                projectionView === "projected" ? result.muscleSignals : {}
              }
              reducedMotion={reducedMotion}
              interactive
            />
          </div>

          <button
            className="mesh-adjust-button streamlined-adjust-button"
            type="button"
            onClick={() => onCharacterEditorOpenChange(true)}
          >
            <CircleGauge size={14} />
            Appearance
          </button>

          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={onCharacterEditorOpenChange}
            onMeasurementChange={changeMeasurement}
            onBodyTypeChange={changeSex}
            onAppearanceChange={onAppearanceChange}
            onReset={onResetCharacter}
          />

          <section
            className="streamlined-input-layer"
            aria-labelledby="projection-inputs-title"
          >
            <header className="streamlined-input-toolbar">
              <span id="projection-inputs-title">
                <SlidersHorizontal size={12} />
                Input variables
              </span>
              <div role="tablist" aria-label="Input groups">
                {(
                  [
                    ["training", "Training"],
                    ["body", "Body"],
                    ["muscle", "Per muscle"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={inputMode === mode}
                    className={inputMode === mode ? "is-active" : ""}
                    onClick={() => setInputMode(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {inputMode === "muscle" ? (
                <select
                  className="streamlined-muscle-select"
                  value={selectedMuscle}
                  onChange={(event) =>
                    setSelectedMuscle(event.target.value as MuscleGroupId)
                  }
                  aria-label="Muscle group"
                >
                  {MUSCLE_GROUPS.map((muscle) => (
                    <option key={muscle.id} value={muscle.id}>
                      {muscle.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </header>

            {inputMode === "training" ? (
              <div className="streamlined-input-columns">
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    Plan variables
                  </span>
                  {TRAINING_INPUT_IDS.map(renderMetric)}
                </div>
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    Fuel & recovery
                  </span>
                  {RECOVERY_INPUT_IDS.map(renderMetric)}
                </div>
              </div>
            ) : null}

            {inputMode === "body" ? (
              <div className="streamlined-input-columns">
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    Body profile
                  </span>
                  <SelectVariable
                    label="Sex"
                    value={profile.bodyType}
                    confirmed={confirmedInputs.has("sex")}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    onChange={(value) => changeSex(value as CharacterBodyType)}
                  />
                  {(["heightCm", "weightKg", "bodyFatPct"] as const).map(
                    renderMeasurement,
                  )}
                  <SelectVariable
                    label="Body-fat method"
                    value={program.bodyFatMethod}
                    confirmed={confirmedInputs.has("bodyFatMethod")}
                    options={BODY_FAT_METHODS.map((method) => ({
                      value: method.id,
                      label: method.label,
                    }))}
                    onChange={changeBodyFatMethod}
                  />
                </div>
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    Circumferences
                  </span>
                  {(
                    [
                      "waistCm",
                      "neckCm",
                      "chestCm",
                      "upperArmCm",
                      "thighCm",
                      "hipCm",
                    ] as const
                  ).map(renderMeasurement)}
                </div>
              </div>
            ) : null}

            {inputMode === "muscle" ? (
              <div className="streamlined-input-columns">
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    {muscle.label} dose
                  </span>
                  <label className="input-variable-pill streamlined-text-variable">
                    <span>Exercise</span>
                    <input
                      type="text"
                      value={activeMuscle.exercise}
                      onChange={(event) =>
                        changeMuscle(
                          selectedMuscle,
                          "exercise",
                          event.target.value,
                        )
                      }
                      aria-label={`${muscle.label} exercise`}
                    />
                  </label>
                  {renderMuscleNumber("sets")}
                  {renderMuscleNumber("indirectSets")}
                </div>
                <div className="streamlined-input-column">
                  <span className="input-variable-column__label">
                    Set details
                  </span>
                  {renderMuscleNumber("reps")}
                  {renderMuscleNumber("rir")}
                  {renderMuscleNumber("frequency")}
                  <SelectVariable
                    label="Priority"
                    value={String(activeMuscle.priority)}
                    confirmed={confirmedMuscles.has(selectedMuscle)}
                    options={[
                      { value: "1", label: "Standard" },
                      { value: "2", label: "High" },
                      { value: "3", label: "Highest" },
                    ]}
                    onChange={(value) =>
                      changeMuscle(
                        selectedMuscle,
                        "priority",
                        Number(value) as MusclePriority,
                      )
                    }
                  />
                  <button
                    type="button"
                    className={`streamlined-confirm-button ${
                      confirmedMuscles.has(selectedMuscle)
                        ? "is-confirmed"
                        : ""
                    }`}
                    onClick={() => confirmMuscle(selectedMuscle)}
                    disabled={confirmedMuscles.has(selectedMuscle)}
                  >
                    <BadgeCheck size={13} />
                    {confirmedMuscles.has(selectedMuscle)
                      ? "Dose confirmed"
                      : `Confirm ${muscle.label} inputs`}
                  </button>
                </div>
              </div>
            ) : null}

            <p className="streamlined-input-note">
              {result.missingInputs.length === 0
                ? "All required inputs are captured."
                : `${result.missingInputs.length} required input${
                    result.missingInputs.length === 1 ? "" : "s"
                  } still use population priors.`}
            </p>
          </section>
        </article>
      </section>
    </div>
  );
}

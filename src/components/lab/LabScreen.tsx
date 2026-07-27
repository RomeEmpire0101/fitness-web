"use client";

import { Activity } from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  METRICS,
  MetricDefinition,
  MetricId,
  PhysiqueResult,
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

const INPUT_LABELS: Partial<Record<MetricId, string>> = {
  proteinPerKg: "Protein",
  rir: "Reps left",
  sleepHours: "Sleep",
  adherence: "Consistency",
};

const INPUT_METRIC_IDS = [
  "proteinPerKg",
  "rir",
  "sleepHours",
  "adherence",
] as const satisfies readonly MetricId[];

const INPUT_METRICS = INPUT_METRIC_IDS.map(
  (id) => METRICS.find((metric) => metric.id === id)!,
);

type InputVariableControlProps = {
  metric: MetricDefinition;
  value: number,
  onChange: (id: MetricId, value: number) => void;
};

function InputVariableControl({
  metric,
  value,
  onChange,
}: InputVariableControlProps) {
  const precision = metric.step < 1 ? 1 : 0;
  const formatValue = (next: number) => next.toFixed(precision);
  const [draft, setDraft] = useState(formatValue(value));
  const editing = useRef(false);
  const progress =
    ((value - metric.min) / (metric.max - metric.min)) * 100;

  useEffect(() => {
    if (!editing.current) setDraft(value.toFixed(precision));
  }, [precision, value]);

  const updateNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const next = Number(raw);
    setDraft(raw);

    if (
      raw !== "" &&
      Number.isFinite(next) &&
      next >= metric.min &&
      next <= metric.max
    ) {
      onChange(metric.id, next);
    }
  };

  const commitNumber = () => {
    editing.current = false;
    const parsed = Number(draft);
    const stepped = Number.isFinite(parsed)
      ? Math.round(parsed / metric.step) * metric.step
      : value;
    const next = Math.min(metric.max, Math.max(metric.min, stepped));
    onChange(metric.id, next);
    setDraft(formatValue(next));
  };

  const updateRange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setDraft(formatValue(next));
    onChange(metric.id, next);
  };

  const handleNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <div
      className={`input-variable-pill input-variable-pill--${metric.id}`}
      style={
        {
          "--input-progress": `${progress}%`,
        } as CSSProperties
      }
      role="group"
      aria-label={metric.label}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span>{INPUT_LABELS[metric.id]}</span>
      <span className="input-variable-pill__number">
        <input
          type="number"
          min={metric.min}
          max={metric.max}
          step={metric.step}
          value={draft}
          onFocus={() => {
            editing.current = true;
          }}
          onChange={updateNumber}
          onBlur={commitNumber}
          onKeyDown={handleNumberKey}
          aria-label={metric.label}
        />
        <b>{metric.shortUnit}</b>
      </span>
      <input
        className="input-variable-pill__range"
        type="range"
        min={metric.min}
        max={metric.max}
        step={metric.step}
        value={value}
        onChange={updateRange}
        aria-label={`Adjust ${metric.label}`}
      />
    </div>
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
  const changeMetric = (id: MetricId, value: number) => {
    onProgramChange((current) => ({
      ...current,
      values: {
        ...current.values,
        [id]: value,
      },
    }));
  };

  return (
    <div className="lab-screen screen-enter">
      <header className="screen-heading lab-heading">
        <div>
          <span className="eyebrow">Anatomy studio</span>
          <h1>Physique Lab</h1>
          <p>Inspect the realistic body model and adjust its proportions.</p>
        </div>
      </header>

      <section className="lab-workspace">
        <article className="lab-stage-card">
          <header>
            <div>
              <Activity size={13} aria-hidden="true" />
              Live model
            </div>
            <span>Drag to inspect</span>
          </header>

          <div className="lab-character">
            <CharacterScene
              profile={profile}
              growth={result.growth}
              definition={result.definition}
              stimulus={result.stimulus}
              muscleSignals={result.muscleSignals}
              reducedMotion={reducedMotion}
              interactive
            />
          </div>

          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={onCharacterEditorOpenChange}
            onMeasurementChange={onMeasurementChange}
            onBodyTypeChange={onBodyTypeChange}
            onAppearanceChange={onAppearanceChange}
            onReset={onResetCharacter}
          />

          <section
            className="lab-input-variables"
            aria-labelledby="input-variables-title"
          >
            <h2 id="input-variables-title">Input variables</h2>
            <div>
              {INPUT_METRICS.map((metric) => (
                <InputVariableControl
                  key={metric.id}
                  metric={metric}
                  value={program.values[metric.id]}
                  onChange={changeMetric}
                />
              ))}
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}

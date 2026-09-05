"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";
import {
  MuscleDefinition,
  MuscleProjection,
  MusclePriority,
  MuscleSetting,
} from "@/lib/simulation";
import { SelectField, signedPercent, Stepper } from "./fields";

type DoseCardProps = {
  muscle: MuscleDefinition;
  setting: MuscleSetting;
  projection: MuscleProjection;
  confirmed: boolean;
  onChange: <K extends keyof MuscleSetting>(
    field: K,
    value: MuscleSetting[K],
  ) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const EVIDENCE_LABEL: Record<MuscleProjection["evidenceGrade"], string> = {
  direct: "direct MRI evidence",
  adjacent: "adjacent-region evidence",
  limited: "limited evidence",
};

const interval = (projection: MuscleProjection, level: 80 | 95) => {
  const item = projection.intervals.find((entry) => entry.level === level);
  if (!item) return "";
  return `${signedPercent(item.lower)} to ${signedPercent(item.upper)}`;
};

/** The weekly dose for one muscle group, opened from its callout or the body. */
export function DoseCard({
  muscle,
  setting,
  projection,
  confirmed,
  onChange,
  onConfirm,
  onClose,
}: DoseCardProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <aside className="dose" aria-label={`${muscle.label} dose`}>
      <header className="dose__header">
        <div>
          <h2>{muscle.label}</h2>
          <span>{EVIDENCE_LABEL[projection.evidenceGrade]}</span>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </header>

      <div className="field">
        <div className="field__row">
          <label htmlFor="dose-exercise">Main exercise</label>
        </div>
        <input
          id="dose-exercise"
          className="text-input"
          type="text"
          value={setting.exercise}
          onChange={(event) => onChange("exercise", event.target.value)}
        />
      </div>

      <div className="dose__grid">
        <Stepper
          label="Direct sets"
          value={setting.sets}
          min={0}
          max={40}
          onChange={(value) => onChange("sets", value)}
        />
        <Stepper
          label="Indirect sets"
          value={setting.indirectSets}
          min={0}
          max={40}
          onChange={(value) => onChange("indirectSets", value)}
        />
        <Stepper
          label="Reps"
          value={setting.reps}
          min={1}
          max={40}
          onChange={(value) => onChange("reps", value)}
        />
        <Stepper
          label="Reps in reserve"
          value={setting.rir}
          min={0}
          max={6}
          onChange={(value) => onChange("rir", value)}
        />
        <Stepper
          label="Days per week"
          value={setting.frequency}
          min={1}
          max={7}
          onChange={(value) => onChange("frequency", value)}
        />
        <SelectField
          label="Priority"
          value={String(setting.priority)}
          options={[
            { value: "1", label: "Standard" },
            { value: "2", label: "High" },
            { value: "3", label: "Highest" },
          ]}
          onChange={(value) =>
            onChange("priority", Number(value) as MusclePriority)
          }
        />
      </div>

      <dl className="dose__projection">
        <div>
          <dt>Projected volume</dt>
          <dd>
            <b>{signedPercent(projection.meanPercent)}</b> ·{" "}
            {projection.meanGainKg >= 0 ? "+" : "−"}
            {Math.abs(projection.meanGainKg).toFixed(2)} kg
          </dd>
        </div>
        <div>
          <dt>80% interval</dt>
          <dd>{interval(projection, 80)}</dd>
        </div>
        <div>
          <dt>95% interval</dt>
          <dd>{interval(projection, 95)}</dd>
        </div>
        <div>
          <dt>Effective sets</dt>
          <dd>{projection.effectiveSets.toFixed(1)} / week</dd>
        </div>
      </dl>

      <button
        type="button"
        className={`button ${confirmed ? "button--confirmed" : "button--primary"}`}
        onClick={onConfirm}
        disabled={confirmed}
      >
        <Check size={16} />
        {confirmed ? "Dose confirmed" : `Confirm ${muscle.label.toLowerCase()} dose`}
      </button>
    </aside>
  );
}

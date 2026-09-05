"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const precisionFor = (step: number) =>
  Math.min(String(step).split(".")[1]?.length ?? 0, 2);

const clampStep = (value: number, min: number, max: number, step: number) => {
  const stepped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, stepped));
};

type NumberFieldProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

/** A labelled number input with a matching slider underneath. */
export function NumberField({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: NumberFieldProps) {
  const id = useId();
  const precision = precisionFor(step);
  const format = (next: number) => next.toFixed(precision);
  const editing = useRef(false);
  const [draft, setDraft] = useState(format(value));
  const progress = ((value - min) / Math.max(max - min, 1)) * 100;

  useEffect(() => {
    if (!editing.current) setDraft(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format is derived from `precision`, which is stable for a given step.
  }, [value, precision]);

  const handleDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);
    const next = Number(raw);
    if (raw !== "" && Number.isFinite(next) && next >= min && next <= max) {
      onChange(next);
    }
  };

  const commit = () => {
    editing.current = false;
    const parsed = Number(draft);
    const next = Number.isFinite(parsed)
      ? clampStep(parsed, min, max, step)
      : value;
    onChange(next);
    setDraft(format(next));
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <div
      className="field"
      style={{ "--field-progress": `${progress}%` } as CSSProperties}
    >
      <div className="field__row">
        <label htmlFor={id}>{label}</label>
        <span className="field__value">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft}
            onFocus={() => {
              editing.current = true;
            }}
            onChange={handleDraft}
            onBlur={commit}
            onKeyDown={handleKey}
          />
          <span>{unit}</span>
        </span>
      </div>
      <input
        className="field__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`Adjust ${label}`}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className="field">
      <div className="field__row">
        <label htmlFor={id}>{label}</label>
        <span className="field__select">
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

/** A compact minus / value / plus control for small integer ranges. */
export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: StepperProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setDraft(String(value));
  }, [value]);

  const set = (next: number) => onChange(clampStep(next, min, max, step));

  const commit = () => {
    editing.current = false;
    const parsed = Number(draft);
    const next = Number.isFinite(parsed)
      ? clampStep(parsed, min, max, step)
      : value;
    onChange(next);
    setDraft(String(next));
  };

  return (
    <div className="stepper">
      <label htmlFor={id}>{label}</label>
      <div className="stepper__control">
        <button
          type="button"
          onClick={() => set(value - step)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={draft}
          onFocus={() => {
            editing.current = true;
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        <button
          type="button"
          onClick={() => set(value + step)}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export const signedPercent = (value: number, digits = 1) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}%`;

export const signedKg = (value: number, digits = 1) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)} kg`;

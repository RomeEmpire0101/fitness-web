"use client";

import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  VariableDefinition,
  VariableId,
} from "@/lib/compactSimulation";
import styles from "../MinimalFitnessLab.module.css";

type VariablePillProps = {
  variable: VariableDefinition;
  value: number;
  isActive: boolean;
  onChange: (id: VariableId, value: number) => void;
  onActivate: (id: VariableId) => void;
};

export function VariablePill({
  variable,
  value,
  isActive,
  onChange,
  onActivate,
}: VariablePillProps) {
  const progress =
    ((value - variable.min) / (variable.max - variable.min)) * 100;
  const precision = variable.step < 1 ? 1 : 0;
  const editing = useRef(false);
  const [draft, setDraft] = useState(value.toFixed(precision));

  useEffect(() => {
    if (!editing.current) setDraft(value.toFixed(precision));
  }, [precision, value]);

  const updateRange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) onChange(variable.id, next);
  };

  const updateDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);
    const next = Number(raw);

    if (
      raw !== "" &&
      Number.isFinite(next) &&
      next >= variable.min &&
      next <= variable.max
    ) {
      onChange(variable.id, next);
    }
  };

  const commitDraft = () => {
    editing.current = false;
    const parsed = Number(draft);
    const stepped = Number.isFinite(parsed)
      ? Math.round(parsed / variable.step) * variable.step
      : value;
    const next = Math.min(variable.max, Math.max(variable.min, stepped));

    onChange(variable.id, next);
    setDraft(next.toFixed(precision));
  };

  const handleNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <article
      className={`${styles.metricCard} ${isActive ? styles.active : ""}`}
      data-metric={variable.id}
      style={
        {
          "--metric-accent": variable.accent,
        } as CSSProperties
      }
      onPointerDown={() => onActivate(variable.id)}
      onFocus={() => onActivate(variable.id)}
    >
      <label className={styles.metricLabel} htmlFor={`${variable.id}-number`}>
        {variable.label}
      </label>

      <div className={styles.metricValue}>
        <input
          id={`${variable.id}-number`}
          className={styles.metricNumber}
          type="number"
          value={draft}
          min={variable.min}
          max={variable.max}
          step={variable.step}
          inputMode="decimal"
          onFocus={() => {
            editing.current = true;
            onActivate(variable.id);
          }}
          onChange={updateDraft}
          onBlur={commitDraft}
          onKeyDown={handleNumberKey}
          aria-describedby={`${variable.id}-description`}
        />
        <span>{variable.shortUnit}</span>
      </div>

      <div className={styles.metricRangeShell}>
        <span
          className={styles.metricRangeFill}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
        <label htmlFor={`${variable.id}-range`} className={styles.srOnly}>
          Adjust {variable.label}
        </label>
        <input
          id={`${variable.id}-range`}
          className={styles.metricRange}
          type="range"
          min={variable.min}
          max={variable.max}
          step={variable.step}
          value={value}
          onChange={updateRange}
          aria-valuetext={`${value.toFixed(precision)} ${variable.unit}`}
        />
      </div>

      <span id={`${variable.id}-description`} className={styles.srOnly}>
        {variable.label}, from {variable.min} to {variable.max}{" "}
        {variable.unit}
      </span>
    </article>
  );
}

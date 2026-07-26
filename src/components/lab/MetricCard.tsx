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
  MetricDefinition,
  MetricId,
} from "@/lib/simulation";

type MetricCardProps = {
  metric: MetricDefinition;
  value: number;
  isActive: boolean;
  onChange: (id: MetricId, value: number) => void;
  onActivate: (id: MetricId) => void;
};

export function MetricCard({
  metric,
  value,
  isActive,
  onChange,
  onActivate,
}: MetricCardProps) {
  const progress =
    ((value - metric.min) / (metric.max - metric.min)) * 100;
  const Icon = metric.Icon;
  const precision = metric.step < 1 ? 1 : 0;
  const editing = useRef(false);
  const formatValue = (next: number) => next.toFixed(precision);
  const [draft, setDraft] = useState(formatValue(value));

  useEffect(() => {
    if (!editing.current) setDraft(value.toFixed(precision));
  }, [precision, value]);

  const updateRange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) onChange(metric.id, next);
  };

  const updateDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);
    const next = Number(raw);
    if (
      raw !== "" &&
      Number.isFinite(next) &&
      next >= metric.min &&
      next <= metric.max
    ) {
      onChange(metric.id, next);
    }
  };

  const commitDraft = () => {
    editing.current = false;
    const parsed = Number(draft);
    const stepped = Number.isFinite(parsed)
      ? Math.round(parsed / metric.step) * metric.step
      : value;
    const next = Math.min(metric.max, Math.max(metric.min, stepped));
    onChange(metric.id, next);
    setDraft(formatValue(next));
  };

  const handleNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <article
      className={`metric-card ${isActive ? "is-active" : ""}`}
      style={
        {
          "--metric-accent": metric.accent,
          "--range-progress": `${progress}%`,
        } as CSSProperties
      }
      onPointerDown={() => onActivate(metric.id)}
      onFocus={() => onActivate(metric.id)}
    >
      <div className="metric-card__glow" />
      <header className="metric-card__header">
        <span className="metric-icon" aria-hidden="true">
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <div>
          <h2>{metric.label}</h2>
          <p>{metric.description}</p>
        </div>
        <span className="metric-state">{metric.describe(value)}</span>
      </header>

      <div className="metric-value-row">
        <label htmlFor={`${metric.id}-number`} className="sr-only">
          {metric.label} in {metric.unit}
        </label>
        <input
          id={`${metric.id}-number`}
          className="metric-number"
          type="number"
          value={draft}
          min={metric.min}
          max={metric.max}
          step={metric.step}
          inputMode="decimal"
          onFocus={() => {
            editing.current = true;
            onActivate(metric.id);
          }}
          onChange={updateDraft}
          onBlur={commitDraft}
          onKeyDown={handleNumberKey}
          aria-describedby={`${metric.id}-description`}
        />
        <span>{metric.unit}</span>
      </div>

      <label htmlFor={`${metric.id}-range`} className="sr-only">
        Adjust {metric.label}
      </label>
      <input
        id={`${metric.id}-range`}
        className="metric-range"
        type="range"
        min={metric.min}
        max={metric.max}
        step={metric.step}
        value={value}
        onChange={updateRange}
        aria-valuetext={`${value.toFixed(precision)} ${metric.unit}, ${metric.describe(value)}`}
      />

      <footer id={`${metric.id}-description`} className="metric-card__footer">
        <span>{metric.min}</span>
        <span className="metric-live">
          <i />
          Live input
        </span>
        <span>{metric.max}</span>
      </footer>
    </article>
  );
}

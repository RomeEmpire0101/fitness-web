"use client";

import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MetricDefinition, MetricId } from "@/lib/simulation";

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
  const precision = metric.step < 1 ? 1 : 0;
  const editing = useRef(false);
  const formatValue = useCallback(
    (next: number) =>
      next > 0 && metric.id === "calorieBalance"
        ? `+${next.toFixed(precision)}`
        : next.toFixed(precision),
    [metric.id, precision],
  );
  const [draft, setDraft] = useState(formatValue(value));
  const Icon = metric.Icon;

  useEffect(() => {
    if (!editing.current) setDraft(formatValue(value));
  }, [formatValue, value]);

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
          "--metric-progress": `${progress}%`,
        } as CSSProperties
      }
      onPointerDown={() => onActivate(metric.id)}
      onFocus={() => onActivate(metric.id)}
    >
      <header className="metric-card__header">
        <span className="metric-card__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <span>
          <strong>{metric.shortLabel}</strong>
          <small>{metric.describe(value)}</small>
        </span>
      </header>

      <div className="metric-card__value">
        <input
          id={`${metric.id}-number`}
          type="text"
          inputMode="decimal"
          value={draft}
          onFocus={() => {
            editing.current = true;
            onActivate(metric.id);
          }}
          onChange={updateDraft}
          onBlur={commitDraft}
          onKeyDown={handleNumberKey}
          aria-label={`${metric.label} value`}
          aria-describedby={`${metric.id}-description`}
        />
        <span>{metric.shortUnit}</span>
      </div>

      <label className="metric-card__range">
        <span className="sr-only">Adjust {metric.label}</span>
        <span aria-hidden="true">
          <i />
        </span>
        <input
          id={`${metric.id}-range`}
          type="range"
          min={metric.min}
          max={metric.max}
          step={metric.step}
          value={value}
          onChange={updateRange}
          aria-valuetext={`${value.toFixed(precision)} ${metric.unit}`}
        />
      </label>

      <footer id={`${metric.id}-description`}>
        <span>{metric.description}</span>
        <b>
          {metric.id === "rir" ? `RPE ${10 - value}` : `${metric.min}–${metric.max}`}
        </b>
      </footer>
    </article>
  );
}

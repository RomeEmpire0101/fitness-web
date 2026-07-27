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
  plainLanguage: string;
  recommendation?: string;
  onChange: (id: MetricId, value: number) => void;
  onActivate: (id: MetricId) => void;
};

export function MetricCard({
  metric,
  value,
  isActive,
  plainLanguage,
  recommendation,
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
        <div>
          <strong>{metric.question}</strong>
          <small>{metric.description}</small>
        </div>
        <span className="metric-card__status">{metric.describe(value)}</span>
      </header>

      <div className="metric-card__answer">
        <label className="metric-card__value" htmlFor={`${metric.id}-number`}>
          <span>Your answer</span>
          <span>
            <input
              id={`${metric.id}-number`}
              type="text"
              inputMode={metric.step < 1 ? "decimal" : "numeric"}
              value={draft}
              onFocus={() => {
                editing.current = true;
                onActivate(metric.id);
              }}
              onChange={updateDraft}
              onBlur={commitDraft}
              onKeyDown={handleNumberKey}
              aria-describedby={`${metric.id}-description`}
            />
            <b>{metric.shortUnit}</b>
          </span>
        </label>
        <div className="metric-card__translation">
          <span>What that means</span>
          <strong>{plainLanguage}</strong>
        </div>
      </div>

      <label className="metric-card__range">
        <span className="sr-only">Adjust {metric.label}</span>
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
        <span className="metric-card__scale" aria-hidden="true">
          <span>{metric.lowLabel}</span>
          <span>{metric.highLabel}</span>
        </span>
      </label>

      <footer id={`${metric.id}-description`}>
        <span>Helpful guide</span>
        <strong>{recommendation ?? metric.recommendation}</strong>
      </footer>
    </article>
  );
}

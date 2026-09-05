"use client";

import { Check } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CharacterBodyType,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import { CHARACTER_MEASUREMENTS } from "@/features/characters/config";
import {
  BODY_FAT_METHODS,
  METRICS,
  MetricId,
  RequiredInputKey,
  TrainingProgram,
} from "@/lib/simulation";
import { NumberField, SelectField } from "./fields";

const GIRTHS = [
  "waistCm",
  "neckCm",
  "chestCm",
  "upperArmCm",
  "thighCm",
  "hipCm",
] as const satisfies readonly CharacterMeasurementId[];

type ChipDefinition = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  keys: RequiredInputKey[];
  fields: ReactNode;
};

type InputChipsProps = {
  program: TrainingProgram;
  profile: CharacterProfile;
  confirmedInputs: Set<RequiredInputKey>;
  onMetricChange: (id: MetricId, value: number) => void;
  onMeasurementChange: (id: CharacterMeasurementId, value: number) => void;
  onSexChange: (bodyType: CharacterBodyType) => void;
  onBodyFatMethodChange: (value: string) => void;
  onConfirm: (key: RequiredInputKey) => void;
};

const POPOVER_WIDTH = 312;

/**
 * Every global input as a chip in the top strip. Clicking a chip opens a
 * popover with the editable field(s); the dot shows whether the value is
 * confirmed or still a population prior.
 */
export function InputChips({
  program,
  profile,
  confirmedInputs,
  onMetricChange,
  onMeasurementChange,
  onSexChange,
  onBodyFatMethodChange,
  onConfirm,
}: InputChipsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState({ left: 0, top: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpenId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openId]);

  const toggle = (id: string, button: HTMLButtonElement) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const left = Math.max(
      12,
      Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 12),
    );
    setAnchor({ left, top: rect.bottom + 8 });
    setOpenId(id);
  };

  const metricField = (id: MetricId) => {
    const metric = METRICS.find((item) => item.id === id)!;
    return (
      <NumberField
        key={id}
        label={metric.label}
        value={program.values[id]}
        unit={metric.shortUnit}
        min={metric.min}
        max={metric.max}
        step={metric.step}
        onChange={(value) => onMetricChange(id, value)}
      />
    );
  };

  const measurementField = (id: CharacterMeasurementId) => {
    const measurement = CHARACTER_MEASUREMENTS.find((item) => item.id === id)!;
    return (
      <NumberField
        key={id}
        label={measurement.label}
        value={profile.measurements[id]}
        unit={measurement.unit}
        min={measurement.min}
        max={measurement.max}
        step={measurement.step}
        onChange={(value) => onMeasurementChange(id, value)}
      />
    );
  };

  const values = program.values;
  const measurements = profile.measurements;
  const method = BODY_FAT_METHODS.find(
    (item) => item.id === program.bodyFatMethod,
  );
  const girthsConfirmed = GIRTHS.filter((key) =>
    confirmedInputs.has(key),
  ).length;

  const chips: ChipDefinition[] = [
    {
      id: "sex",
      title: "Sex",
      value: profile.bodyType === "female" ? "Female" : "Male",
      keys: ["sex"],
      fields: (
        <SelectField
          label="Sex"
          value={profile.bodyType}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
          onChange={(value) => onSexChange(value as CharacterBodyType)}
        />
      ),
    },
    {
      id: "height",
      title: "Height",
      value: String(measurements.heightCm),
      unit: "cm",
      keys: ["heightCm"],
      fields: measurementField("heightCm"),
    },
    {
      id: "weight",
      title: "Weight",
      value: measurements.weightKg.toFixed(1),
      unit: "kg",
      keys: ["weightKg"],
      fields: measurementField("weightKg"),
    },
    {
      id: "bodyFat",
      title: "Body fat",
      value: `${measurements.bodyFatPct}%`,
      unit:
        program.bodyFatMethod === "unknown"
          ? "method?"
          : (method?.label ?? "fat"),
      keys: ["bodyFatPct", "bodyFatMethod"],
      fields: (
        <>
          {measurementField("bodyFatPct")}
          <SelectField
            label="Measured with"
            value={program.bodyFatMethod}
            options={BODY_FAT_METHODS.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
            onChange={onBodyFatMethodChange}
          />
        </>
      ),
    },
    {
      id: "girths",
      title: "Circumferences",
      value: `${girthsConfirmed}/${GIRTHS.length}`,
      unit: "girths",
      keys: [...GIRTHS],
      fields: <>{GIRTHS.map(measurementField)}</>,
    },
    {
      id: "age",
      title: "Age",
      value: String(values.age),
      unit: "yr",
      keys: ["age"],
      fields: metricField("age"),
    },
    {
      id: "trainingYears",
      title: "Training history",
      value: values.trainingYears.toFixed(1),
      unit: "yr trained",
      keys: ["trainingYears"],
      fields: metricField("trainingYears"),
    },
    {
      id: "weeks",
      title: "Plan length",
      value: String(values.weeks),
      unit: "wk",
      keys: ["weeks"],
      fields: metricField("weeks"),
    },
    {
      id: "dailyCalories",
      title: "Daily calories",
      value: String(values.dailyCalories),
      unit: "kcal",
      keys: ["dailyCalories"],
      fields: metricField("dailyCalories"),
    },
    {
      id: "proteinGrams",
      title: "Protein intake",
      value: String(values.proteinGrams),
      unit: "g protein",
      keys: ["proteinGrams"],
      fields: metricField("proteinGrams"),
    },
    {
      id: "sleepHours",
      title: "Sleep",
      value: values.sleepHours.toFixed(2).replace(/\.?0+$/, ""),
      unit: "h sleep",
      keys: ["sleepHours"],
      fields: metricField("sleepHours"),
    },
    {
      id: "adherence",
      title: "Expected adherence",
      value: `${values.adherence}%`,
      unit: "adherence",
      keys: ["adherence"],
      fields: metricField("adherence"),
    },
  ];

  const openChip = chips.find((chip) => chip.id === openId) ?? null;
  const openConfirmed =
    openChip?.keys.every((key) => confirmedInputs.has(key)) ?? false;

  return (
    <>
      <div className="chips" ref={rootRef} aria-label="Inputs">
        {chips.map((chip) => {
          const confirmed = chip.keys.every((key) => confirmedInputs.has(key));
          const open = openId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              className={`chip ${confirmed ? "is-confirmed" : ""} ${
                open ? "is-open" : ""
              }`}
              aria-expanded={open}
              aria-label={`${chip.title}: ${chip.value} ${chip.unit ?? ""}${
                confirmed ? "" : ", using population prior"
              }`}
              onClick={(event) => toggle(chip.id, event.currentTarget)}
            >
              <i className="chip__dot" aria-hidden="true" />
              <b>{chip.value}</b>
              {chip.unit ? <small>{chip.unit}</small> : null}
            </button>
          );
        })}
      </div>

      {openChip
        ? createPortal(
        <div
          ref={popoverRef}
          className="popover"
          role="dialog"
          aria-label={openChip.title}
          style={{ left: anchor.left, top: anchor.top, width: POPOVER_WIDTH }}
        >
          <header className="popover__header">
            <span>{openChip.title}</span>
            <span
              className={`popover__state ${openConfirmed ? "is-confirmed" : ""}`}
            >
              {openConfirmed ? "Confirmed" : "Population prior"}
            </span>
          </header>
          <div className="popover__fields">{openChip.fields}</div>
          {openConfirmed ? null : (
            <footer className="popover__footer">
              <span>Confirming replaces the prior and narrows the intervals.</span>
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  openChip.keys.forEach(onConfirm);
                }}
              >
                <Check size={15} />
                Use these values
              </button>
            </footer>
          )}
        </div>,
            document.body,
          )
        : null}
    </>
  );
}

"use client";

import {
  RotateCcw,
  Ruler,
  Scale,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CHARACTER_APPEARANCE_OPTIONS,
  CHARACTER_MEASUREMENTS,
} from "./config";
import { deriveCharacterMorphology } from "./morphology";
import {
  CharacterMeasurementDefinition,
  CharacterMeasurementId,
  CharacterProfile,
} from "./types";
import styles from "./CharacterEditor.module.css";

type CharacterEditorProps = {
  profile: CharacterProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeasurementChange: (
    id: CharacterMeasurementId,
    value: number,
  ) => void;
  onNameChange: (name: string) => void;
  onBodyColorChange: (color: string) => void;
  onReset: () => void;
};

type MeasurementControlProps = {
  definition: CharacterMeasurementDefinition;
  value: number;
  onChange: (value: number) => void;
};

const MEASUREMENT_ICONS = {
  heightCm: Ruler,
  weightKg: Scale,
} satisfies Record<CharacterMeasurementId, typeof Ruler>;

function MeasurementControl({
  definition,
  value,
  onChange,
}: MeasurementControlProps) {
  const editing = useRef(false);
  const [draft, setDraft] = useState(String(value));
  const Icon = MEASUREMENT_ICONS[definition.id];
  const progress =
    ((value - definition.min) / (definition.max - definition.min)) * 100;

  useEffect(() => {
    if (!editing.current) setDraft(String(value));
  }, [value]);

  const handleDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.target.value;
    setDraft(nextDraft);
    const next = Number(nextDraft);
    if (
      nextDraft !== "" &&
      Number.isFinite(next) &&
      next >= definition.min &&
      next <= definition.max
    ) {
      onChange(next);
    }
  };

  const commitDraft = () => {
    editing.current = false;
    const parsed = Number(draft);
    const next = Number.isFinite(parsed)
      ? Math.min(definition.max, Math.max(definition.min, parsed))
      : value;
    onChange(next);
    setDraft(String(next));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <div
      className={styles.measurement}
      style={{ "--character-progress": `${progress}%` } as CSSProperties}
    >
      <div className={styles.measurementHeader}>
        <span className={styles.measurementIcon} aria-hidden="true">
          <Icon size={15} />
        </span>
        <span>
          <strong>{definition.label}</strong>
          <small>{definition.description}</small>
        </span>
        <label className={styles.numberWrap}>
          <span className="sr-only">{definition.label}</span>
          <input
            type="number"
            min={definition.min}
            max={definition.max}
            step={definition.step}
            value={draft}
            inputMode="numeric"
            onFocus={() => {
              editing.current = true;
            }}
            onChange={handleDraft}
            onBlur={commitDraft}
            onKeyDown={handleKeyDown}
          />
          <span>{definition.unit}</span>
        </label>
      </div>

      <label className={styles.rangeWrap}>
        <span className="sr-only">Adjust {definition.label}</span>
        <input
          type="range"
          min={definition.min}
          max={definition.max}
          step={definition.step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={`${value} ${definition.unit}`}
        />
      </label>
    </div>
  );
}

export function CharacterEditor({
  profile,
  open,
  onOpenChange,
  onMeasurementChange,
  onNameChange,
  onBodyColorChange,
  onReset,
}: CharacterEditorProps) {
  const morphology = deriveCharacterMorphology(profile.measurements);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onOpenChange, open]);

  return (
    <div className={styles.editor}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="character-editor-panel"
      >
        <SlidersHorizontal size={15} />
        <span>Edit character</span>
        <small>
          {profile.measurements.heightCm} cm · {profile.measurements.weightKg} kg
        </small>
      </button>

      {open && (
        <section
          id="character-editor-panel"
          className={styles.panel}
          aria-labelledby="character-editor-title"
        >
          <header className={styles.panelHeader}>
            <div>
              <span className={styles.kicker}>Character profile</span>
              <h2 id="character-editor-title">Shape your base model</h2>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => onOpenChange(false)}
              aria-label="Close character editor"
            >
              <X size={17} />
            </button>
          </header>

          <label className={styles.nameField}>
            <span>Character name</span>
            <input
              type="text"
              value={profile.name}
              maxLength={32}
              onChange={(event) => onNameChange(event.target.value)}
              onBlur={() => {
                if (!profile.name.trim()) onNameChange("Athlete 01");
              }}
            />
          </label>

          <div className={styles.measurements}>
            {CHARACTER_MEASUREMENTS.map((definition) => (
              <MeasurementControl
                key={definition.id}
                definition={definition}
                value={profile.measurements[definition.id]}
                onChange={(value) =>
                  onMeasurementChange(definition.id, value)
                }
              />
            ))}
          </div>

          <fieldset className={styles.finish}>
            <legend>Model finish</legend>
            <div>
              {CHARACTER_APPEARANCE_OPTIONS.map((option) => {
                const selected =
                  option.bodyColor === profile.appearance.bodyColor;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? styles.selectedSwatch : styles.swatch}
                    style={{ "--swatch-color": option.bodyColor } as CSSProperties}
                    onClick={() => onBodyColorChange(option.bodyColor)}
                    aria-label={`${option.label} finish`}
                    aria-pressed={selected}
                    title={option.label}
                  >
                    <span />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <footer className={styles.panelFooter}>
            <span>
              Visual build <strong>{morphology.buildLabel}</strong>
            </span>
            <button type="button" onClick={onReset}>
              <RotateCcw size={13} />
              Reset character
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}

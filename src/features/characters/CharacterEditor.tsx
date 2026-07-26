"use client";

import {
  RotateCcw,
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
  onNameChange: (name: string) => void;
  onMeasurementChange: (
    id: CharacterMeasurementId,
    value: number,
  ) => void;
  onBodyColorChange: (color: string) => void;
  onReset: () => void;
};

type MeasurementControlProps = {
  definition: CharacterMeasurementDefinition;
  value: number;
  onChange: (value: number) => void;
};

function MeasurementControl({
  definition,
  value,
  onChange,
}: MeasurementControlProps) {
  const editing = useRef(false);
  const [draft, setDraft] = useState(String(value));
  const progress =
    ((value - definition.min) / (definition.max - definition.min)) * 100;
  const numberId = `character-${definition.id}-number`;

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
    <div className={styles.measurement}>
      <div className={styles.measurementHeader}>
        <label className={styles.measurementLabel} htmlFor={numberId}>
          {definition.shortLabel}
        </label>
        <div className={styles.numberWrap}>
          <input
            id={numberId}
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
        </div>
      </div>

      <label className={styles.rangeWrap}>
        <span className={styles.srOnly}>Adjust {definition.label}</span>
        <span className={styles.rangeTrack} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
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
  onNameChange,
  onMeasurementChange,
  onBodyColorChange,
  onReset,
}: CharacterEditorProps) {
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
        aria-label="Character settings"
        title="Character settings"
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <section
          id="character-editor-panel"
          className={styles.panel}
          aria-label="Character settings"
        >
          <button
            type="button"
            className={styles.close}
            onClick={() => onOpenChange(false)}
            aria-label="Close character settings"
          >
            <X size={17} strokeWidth={1.8} />
          </button>

          <label className={styles.profileName}>
            <span>Profile name</span>
            <input
              type="text"
              value={profile.name}
              maxLength={32}
              placeholder="Enter your name"
              onChange={(event) => onNameChange(event.target.value)}
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
            <legend>Finish</legend>
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

          <button
            type="button"
            className={styles.panelReset}
            onClick={onReset}
            aria-label="Reset character"
            title="Reset character"
          >
            <RotateCcw size={16} strokeWidth={1.8} />
          </button>
        </section>
      )}
    </div>
  );
}

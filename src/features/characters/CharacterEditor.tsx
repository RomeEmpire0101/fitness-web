"use client";

import {
  Palette,
  RotateCcw,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  CSSProperties,
  ChangeEvent,
  ComponentType,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CHARACTER_APPEARANCE_OPTIONS,
  CHARACTER_BODY_TYPES,
  CHARACTER_BOTTOMS,
  CHARACTER_CLOTHING_COLORS,
  CHARACTER_EYEWEAR,
  CHARACTER_HAIR_COLORS,
  CHARACTER_HAIR_STYLES,
  CHARACTER_HEADWEAR,
  CHARACTER_MEASUREMENTS,
  CHARACTER_SHOES,
  CHARACTER_TOPS,
} from "./config";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterChoice,
  CharacterMeasurementDefinition,
  CharacterMeasurementId,
  CharacterProfile,
  CharacterWardrobe,
} from "./types";
import styles from "./CharacterEditor.module.css";

type EditorSection = "body" | "hair" | "outfit" | "extras";

type CharacterEditorProps = {
  profile: CharacterProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onMeasurementChange: (
    id: CharacterMeasurementId,
    value: number,
  ) => void;
  onBodyTypeChange: (bodyType: CharacterBodyType) => void;
  onAppearanceChange: <K extends keyof CharacterAppearance>(
    id: K,
    value: CharacterAppearance[K],
  ) => void;
  onWardrobeChange: <K extends keyof CharacterWardrobe>(
    id: K,
    value: CharacterWardrobe[K],
  ) => void;
  onReset: () => void;
};

type MeasurementControlProps = {
  definition: CharacterMeasurementDefinition;
  value: number;
  onChange: (value: number) => void;
};

type ColorChoice = {
  id: string;
  label: string;
  color: string;
};

const EDITOR_SECTIONS: Array<{
  id: EditorSection;
  label: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: "body", label: "Body", Icon: UserRound },
  { id: "hair", label: "Hair", Icon: Palette },
  { id: "outfit", label: "Outfit", Icon: Shirt },
  { id: "extras", label: "Extras", Icon: Sparkles },
];

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
      <p>{definition.description}</p>
    </div>
  );
}

function ChoiceGrid<T extends string>({
  label,
  choices,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  choices: Array<CharacterChoice<T>>;
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend>{label}</legend>
      <div
        className={`${styles.choiceGrid} ${
          compact ? styles.compactChoices : ""
        }`}
      >
        {choices.map((choice) => {
          const selected = choice.id === value;
          return (
            <button
              key={choice.id}
              type="button"
              className={selected ? styles.selectedChoice : styles.choice}
              onClick={() => onChange(choice.id)}
              aria-pressed={selected}
            >
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ColorSwatches({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: ColorChoice[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <fieldset className={styles.colorGroup}>
      <legend>{label}</legend>
      <div>
        {colors.map((option) => {
          const selected = option.color.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={option.id}
              type="button"
              className={selected ? styles.selectedSwatch : styles.swatch}
              style={{ "--swatch-color": option.color } as CSSProperties}
              onClick={() => onChange(option.color)}
              aria-label={option.label}
              aria-pressed={selected}
              title={option.label}
            >
              <span />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function BodySection({
  profile,
  onNameChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
}: Pick<
  CharacterEditorProps,
  | "profile"
  | "onNameChange"
  | "onMeasurementChange"
  | "onBodyTypeChange"
  | "onAppearanceChange"
>) {
  return (
    <>
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

      <ChoiceGrid
        label="Body"
        choices={CHARACTER_BODY_TYPES}
        value={profile.bodyType}
        onChange={onBodyTypeChange}
        compact
      />

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

      <ColorSwatches
        label="Skin tone"
        colors={CHARACTER_APPEARANCE_OPTIONS.map((option) => ({
          id: option.id,
          label: option.label,
          color: option.bodyColor,
        }))}
        value={profile.appearance.bodyColor}
        onChange={(color) => onAppearanceChange("bodyColor", color)}
      />
    </>
  );
}

function HairSection({
  profile,
  onAppearanceChange,
}: Pick<CharacterEditorProps, "profile" | "onAppearanceChange">) {
  return (
    <>
      <ChoiceGrid
        label="Style"
        choices={CHARACTER_HAIR_STYLES}
        value={profile.appearance.hairStyle}
        onChange={(value) => onAppearanceChange("hairStyle", value)}
      />
      <ColorSwatches
        label="Hair color"
        colors={CHARACTER_HAIR_COLORS}
        value={profile.appearance.hairColor}
        onChange={(color) => onAppearanceChange("hairColor", color)}
      />
      <p className={styles.helper}>
        Headwear fits over your saved hairstyle without replacing it.
      </p>
    </>
  );
}

function OutfitSection({
  profile,
  onWardrobeChange,
}: Pick<CharacterEditorProps, "profile" | "onWardrobeChange">) {
  return (
    <>
      <ChoiceGrid
        label="Top"
        choices={CHARACTER_TOPS}
        value={profile.wardrobe.top}
        onChange={(value) => onWardrobeChange("top", value)}
      />
      {profile.wardrobe.top !== "none" && (
        <ColorSwatches
          label="Top color"
          colors={CHARACTER_CLOTHING_COLORS}
          value={profile.wardrobe.topColor}
          onChange={(color) => onWardrobeChange("topColor", color)}
        />
      )}

      <ChoiceGrid
        label="Bottom"
        choices={CHARACTER_BOTTOMS}
        value={profile.wardrobe.bottom}
        onChange={(value) => onWardrobeChange("bottom", value)}
      />
      <ColorSwatches
        label="Bottom color"
        colors={CHARACTER_CLOTHING_COLORS}
        value={profile.wardrobe.bottomColor}
        onChange={(color) => onWardrobeChange("bottomColor", color)}
      />

      <ChoiceGrid
        label="Shoes"
        choices={CHARACTER_SHOES}
        value={profile.wardrobe.shoes}
        onChange={(value) => onWardrobeChange("shoes", value)}
        compact
      />
      <ColorSwatches
        label="Shoe color"
        colors={CHARACTER_CLOTHING_COLORS}
        value={profile.wardrobe.shoeColor}
        onChange={(color) => onWardrobeChange("shoeColor", color)}
      />
    </>
  );
}

function ExtrasSection({
  profile,
  onWardrobeChange,
}: Pick<CharacterEditorProps, "profile" | "onWardrobeChange">) {
  return (
    <>
      <ChoiceGrid
        label="Headwear"
        choices={CHARACTER_HEADWEAR}
        value={profile.wardrobe.headwear}
        onChange={(value) => onWardrobeChange("headwear", value)}
      />
      {profile.wardrobe.headwear !== "none" && (
        <ColorSwatches
          label="Headwear color"
          colors={CHARACTER_CLOTHING_COLORS}
          value={profile.wardrobe.headwearColor}
          onChange={(color) => onWardrobeChange("headwearColor", color)}
        />
      )}
      <ChoiceGrid
        label="Eyewear"
        choices={CHARACTER_EYEWEAR}
        value={profile.wardrobe.eyewear}
        onChange={(value) => onWardrobeChange("eyewear", value)}
      />
    </>
  );
}

export function CharacterEditor({
  profile,
  open,
  onOpenChange,
  onNameChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
  onWardrobeChange,
  onReset,
}: CharacterEditorProps) {
  const [section, setSection] = useState<EditorSection>("body");

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
        aria-label="Customize character"
        title="Customize character"
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <section
          id="character-editor-panel"
          className={styles.panel}
          aria-label="Character customizer"
        >
          <header className={styles.panelHeader}>
            <div>
              <span>Avatar studio</span>
              <h2>Make it yours</h2>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => onOpenChange(false)}
              aria-label="Close character customizer"
            >
              <X size={17} strokeWidth={1.8} />
            </button>
          </header>

          <nav className={styles.sectionTabs} aria-label="Customize">
            {EDITOR_SECTIONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? styles.activeTab : styles.tab}
                onClick={() => setSection(id)}
                aria-current={section === id ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.panelContent}>
            {section === "body" && (
              <BodySection
                profile={profile}
                onNameChange={onNameChange}
                onMeasurementChange={onMeasurementChange}
                onBodyTypeChange={onBodyTypeChange}
                onAppearanceChange={onAppearanceChange}
              />
            )}
            {section === "hair" && (
              <HairSection
                profile={profile}
                onAppearanceChange={onAppearanceChange}
              />
            )}
            {section === "outfit" && (
              <OutfitSection
                profile={profile}
                onWardrobeChange={onWardrobeChange}
              />
            )}
            {section === "extras" && (
              <ExtrasSection
                profile={profile}
                onWardrobeChange={onWardrobeChange}
              />
            )}
          </div>

          <footer className={styles.panelFooter}>
            <span>Changes save automatically</span>
            <button
              type="button"
              className={styles.panelReset}
              onClick={onReset}
              aria-label="Reset character"
              title="Reset character"
            >
              <RotateCcw size={15} strokeWidth={1.8} />
              Reset
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}

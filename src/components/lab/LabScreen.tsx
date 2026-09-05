"use client";

import { BadgeCheck, FlaskConical } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import { MuscleAnchorFrame } from "@/features/characters/scene/muscleRegions";
import {
  BODY_FAT_METHODS,
  MetricId,
  MODEL_VERSION,
  MUSCLE_GROUPS,
  MuscleGroupId,
  MuscleSetting,
  PhysiqueResult,
  RequiredInputKey,
  TrainingProgram,
} from "@/lib/simulation";
import { DoseCard } from "./DoseCard";
import { EstimateCard } from "./EstimateCard";
import { InputChips } from "./InputChips";
import { AnchorSource, MuscleCallouts } from "./MuscleCallouts";

type LabScreenProps = {
  program: TrainingProgram;
  result: PhysiqueResult;
  profile: CharacterProfile;
  reducedMotion: boolean;
  onProgramChange: (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => void;
  characterEditorOpen: boolean;
  onCharacterEditorOpenChange: (open: boolean) => void;
  onMeasurementChange: (id: CharacterMeasurementId, value: number) => void;
  onBodyTypeChange: (bodyType: CharacterBodyType) => void;
  onAppearanceChange: <K extends keyof CharacterAppearance>(
    id: K,
    value: CharacterAppearance[K],
  ) => void;
  onResetCharacter: () => void;
};

const REQUIRED_GLOBAL_INPUTS = [
  "age",
  "sex",
  "trainingYears",
  "dailyCalories",
  "proteinGrams",
  "sleepHours",
  "adherence",
  "weeks",
  "heightCm",
  "weightKg",
  "bodyFatPct",
  "bodyFatMethod",
  "waistCm",
  "neckCm",
  "chestCm",
  "upperArmCm",
  "thighCm",
  "hipCm",
] as const satisfies readonly RequiredInputKey[];

/**
 * The single lab screen. The body is the navigation: every muscle group has a
 * callout beside the figure, clicking one (or the body) opens its dose card,
 * and the global inputs live as chips in the top strip.
 */
export function LabScreen({
  program,
  result,
  profile,
  reducedMotion,
  onProgramChange,
  characterEditorOpen,
  onCharacterEditorOpenChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
  onResetCharacter,
}: LabScreenProps) {
  const [projectionView, setProjectionView] = useState<
    "starting" | "projected"
  >("projected");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(
    null,
  );
  const [estimateExpanded, setEstimateExpanded] = useState(false);
  const anchors = useRef<AnchorSource>({ frame: null, version: 0 });
  const estimateRef = useRef<HTMLElement | null>(null);

  const handleAnchors = useCallback((frame: MuscleAnchorFrame) => {
    anchors.current.frame = frame;
    anchors.current.version += 1;
  }, []);

  const confirmedInputs = useMemo(
    () => new Set<RequiredInputKey>(program.confirmedInputs ?? []),
    [program.confirmedInputs],
  );
  const confirmedMuscles = useMemo(
    () => new Set<MuscleGroupId>(program.confirmedMuscles ?? []),
    [program.confirmedMuscles],
  );
  const completedInputCount =
    REQUIRED_GLOBAL_INPUTS.filter((key) => confirmedInputs.has(key)).length +
    Math.min(confirmedMuscles.size, MUSCLE_GROUPS.length);
  const totalInputCount = REQUIRED_GLOBAL_INPUTS.length + MUSCLE_GROUPS.length;
  const complete = completedInputCount === totalInputCount;

  const confirmInput = useCallback(
    (key: RequiredInputKey) => {
      onProgramChange((current) => ({
        ...current,
        confirmedInputs: current.confirmedInputs.includes(key)
          ? current.confirmedInputs
          : [...current.confirmedInputs, key],
      }));
    },
    [onProgramChange],
  );

  const changeMetric = (id: MetricId, value: number) => {
    if (!Number.isFinite(value)) return;
    onProgramChange((current) => ({
      ...current,
      values: { ...current.values, [id]: value },
      confirmedInputs: current.confirmedInputs.includes(id)
        ? current.confirmedInputs
        : [...current.confirmedInputs, id],
    }));
  };

  const changeMeasurement = (id: CharacterMeasurementId, value: number) => {
    if (!Number.isFinite(value)) return;
    onMeasurementChange(id, value);
    confirmInput(id);
  };

  const changeSex = (bodyType: CharacterBodyType) => {
    onBodyTypeChange(bodyType);
    confirmInput("sex");
  };

  const changeBodyFatMethod = (value: string) => {
    const bodyFatMethod =
      BODY_FAT_METHODS.find((method) => method.id === value)?.id ?? "unknown";
    onProgramChange((current) => ({
      ...current,
      bodyFatMethod,
      confirmedInputs: current.confirmedInputs.includes("bodyFatMethod")
        ? current.confirmedInputs
        : [...current.confirmedInputs, "bodyFatMethod"],
    }));
  };

  const changeMuscle = <K extends keyof MuscleSetting>(
    id: MuscleGroupId,
    field: K,
    value: MuscleSetting[K],
  ) => {
    onProgramChange((current) => ({
      ...current,
      muscles: {
        ...current.muscles,
        [id]: { ...current.muscles[id], [field]: value },
      },
      confirmedMuscles: current.confirmedMuscles.filter(
        (muscleId) => muscleId !== id,
      ),
    }));
  };

  const confirmMuscle = (id: MuscleGroupId) => {
    onProgramChange((current) => ({
      ...current,
      confirmedMuscles: current.confirmedMuscles.includes(id)
        ? current.confirmedMuscles
        : [...current.confirmedMuscles, id],
    }));
  };

  const selectMuscle = useCallback(
    (id: MuscleGroupId) => {
      setSelectedMuscle((current) => (current === id ? null : id));
      onCharacterEditorOpenChange(false);
    },
    [onCharacterEditorOpenChange],
  );
  const closeDose = useCallback(() => setSelectedMuscle(null), []);
  const openEditor = (open: boolean) => {
    if (open) setSelectedMuscle(null);
    onCharacterEditorOpenChange(open);
  };

  const startingDefinition = Math.min(
    1,
    Math.max(
      0,
      ((profile.bodyType === "male" ? 32 : 42) - result.startingBodyFatPct) /
        (profile.bodyType === "male" ? 26 : 34),
    ),
  );
  const selectedDefinition = selectedMuscle
    ? MUSCLE_GROUPS.find((muscle) => muscle.id === selectedMuscle)
    : undefined;
  const projected = projectionView === "projected";

  return (
    <div className="lab">
      <header className="strip">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <FlaskConical size={16} strokeWidth={2} />
          </span>
          <span className="brand__name">Physique Lab</span>
          <span className="brand__version">{MODEL_VERSION}</span>
        </div>
        <InputChips
          program={program}
          profile={profile}
          confirmedInputs={confirmedInputs}
          onMetricChange={changeMetric}
          onMeasurementChange={changeMeasurement}
          onSexChange={changeSex}
          onBodyFatMethodChange={changeBodyFatMethod}
          onConfirm={confirmInput}
        />
        <span className={`strip__count ${complete ? "is-complete" : ""}`}>
          <BadgeCheck size={15} />
          {completedInputCount}/{totalInputCount} confirmed
        </span>
      </header>

      <main className={`stage ${selectedMuscle ? "has-dose" : ""}`}>
        <div className="stage__scene" data-projection-box>
          <CharacterScene
            profile={profile}
            growth={projected ? result.growth : 0}
            definition={projected ? result.definition : startingDefinition}
            stimulus={projected ? result.stimulus : 0}
            baselineMuscularity={result.baselineMuscularity}
            muscleSignals={projected ? result.muscleSignals : {}}
            reducedMotion={reducedMotion}
            onMusclePick={selectMuscle}
            onMuscleAnchors={handleAnchors}
            interactive
          />
        </div>

        <MuscleCallouts
          projections={result.muscleProjections}
          confirmedMuscles={confirmedMuscles}
          selected={selectedMuscle}
          onSelect={selectMuscle}
          anchors={anchors}
          bottomLimitRef={estimateRef}
        />

        {selectedMuscle && selectedDefinition ? (
          <DoseCard
            muscle={selectedDefinition}
            setting={program.muscles[selectedMuscle]}
            projection={result.muscleProjections[selectedMuscle]}
            confirmed={confirmedMuscles.has(selectedMuscle)}
            onChange={(field, value) =>
              changeMuscle(selectedMuscle, field, value)
            }
            onConfirm={() => confirmMuscle(selectedMuscle)}
            onClose={closeDose}
          />
        ) : null}

        <EstimateCard
          result={result}
          startingWeightKg={profile.measurements.weightKg}
          expanded={estimateExpanded}
          onToggle={() => setEstimateExpanded((current) => !current)}
          cardRef={estimateRef}
        />

        <div className="view-toggle" role="group" aria-label="Body view">
          <button
            type="button"
            className={projected ? "" : "is-active"}
            aria-pressed={!projected}
            onClick={() => setProjectionView("starting")}
          >
            Starting
          </button>
          <button
            type="button"
            className={projected ? "is-active" : ""}
            aria-pressed={projected}
            onClick={() => setProjectionView("projected")}
          >
            Projected · {result.durationWeeks} wk
          </button>
        </div>

        <p className="stage__hint">
          Click a muscle on the body or its label to edit its dose · drag to
          rotate
        </p>

        <CharacterEditor
          profile={profile}
          open={characterEditorOpen}
          onOpenChange={openEditor}
          onMeasurementChange={changeMeasurement}
          onBodyTypeChange={changeSex}
          onAppearanceChange={onAppearanceChange}
          onReset={onResetCharacter}
        />
      </main>
    </div>
  );
}

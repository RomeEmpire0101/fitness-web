"use client";

import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  Dumbbell,
  RotateCcw,
  Target,
} from "lucide-react";
import { useState } from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  MUSCLE_GROUPS,
  MuscleGroupId,
  MusclePriority,
  PhysiqueResult,
  TrainingProgram,
  getMuscleDefinition,
} from "@/lib/simulation";
import { MuscleMap } from "../muscles/MuscleMap";

type LabScreenProps = {
  program: TrainingProgram;
  result: PhysiqueResult;
  profile: CharacterProfile;
  reducedMotion: boolean;
  onProgramChange: (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => void;
  onResetProgram: () => void;
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

const PRIORITIES: Array<{ id: MusclePriority; label: string }> = [
  { id: 1, label: "Maintain" },
  { id: 2, label: "Grow" },
  { id: 3, label: "Focus" },
];

export function LabScreen({
  program,
  result,
  profile,
  reducedMotion,
  onProgramChange,
  onResetProgram,
  characterEditorOpen,
  onCharacterEditorOpenChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
  onResetCharacter,
}: LabScreenProps) {
  const [activeMuscle, setActiveMuscle] =
    useState<MuscleGroupId>("chest");
  const selectedMuscle = program.muscles[activeMuscle];
  const selectedMuscleDefinition = getMuscleDefinition(activeMuscle);

  const changeMuscleSets = (sets: number) => {
    onProgramChange((current) => ({
      ...current,
      muscles: {
        ...current.muscles,
        [activeMuscle]: {
          ...current.muscles[activeMuscle],
          sets: Math.min(30, Math.max(0, Math.round(sets))),
        },
      },
    }));
  };

  const changeMusclePriority = (priority: MusclePriority) => {
    onProgramChange((current) => ({
      ...current,
      muscles: {
        ...current.muscles,
        [activeMuscle]: {
          ...current.muscles[activeMuscle],
          priority,
        },
      },
    }));
  };

  return (
    <div className="lab-screen screen-enter">
      <header className="screen-heading lab-heading">
        <div>
          <span className="eyebrow">Anatomy studio</span>
          <h1>Physique Lab</h1>
          <p>
            Inspect the realistic body model and tune individual muscle groups.
          </p>
        </div>
        <div className="lab-heading-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onResetProgram}
            aria-label="Reset muscle settings"
            title="Reset muscle settings"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      <section className="lab-workspace">
        <article className="lab-stage-card">
          <header>
            <div>
              <Activity size={13} aria-hidden="true" />
              Live model
            </div>
            <span>Drag to inspect</span>
          </header>
          <div className="lab-character">
            <CharacterScene
              profile={profile}
              growth={result.growth}
              definition={result.definition}
              stimulus={result.stimulus}
              muscleSignals={result.muscleSignals}
              reducedMotion={reducedMotion}
              interactive
            />
          </div>
          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={onCharacterEditorOpenChange}
            onMeasurementChange={onMeasurementChange}
            onBodyTypeChange={onBodyTypeChange}
            onAppearanceChange={onAppearanceChange}
            onReset={onResetCharacter}
          />
          <div className="lab-stage-score">
            <span>
              <b>{result.adaptation}</b>
              <small>Adaptation</small>
            </span>
            <i />
            <span>
              <b>{result.readiness}</b>
              <small>Readiness</small>
            </span>
            <i />
            <span>
              <b>{result.stage}</b>
              <small>Training phase</small>
            </span>
          </div>
        </article>
      </section>

      <section className="muscle-studio panel-card">
        <header className="panel-card__header muscle-studio__header">
          <div>
            <span className="eyebrow">Per-muscle controls</span>
            <h2>Choose which muscles grow</h2>
          </div>
          <p>
            Set a training emphasis for each area and see the model respond.
          </p>
        </header>

        <div className="muscle-studio__grid">
          <MuscleMap
            activeMuscle={activeMuscle}
            muscles={program.muscles}
            onSelect={setActiveMuscle}
          />

          <div className="muscle-editor">
            <header>
              <Target className="muscle-editor__icon" size={18} />
              <div>
                <span>Selected muscle</span>
                <h3>{selectedMuscleDefinition?.label}</h3>
              </div>
              <strong>{selectedMuscle.sets} sets</strong>
            </header>

            <label className="muscle-set-control">
              <span>
                <b>Weekly working sets</b>
                <small>0-30 sets per week</small>
              </span>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={selectedMuscle.sets}
                onChange={(event) =>
                  changeMuscleSets(Number(event.target.value))
                }
              />
              <span className="muscle-set-scale" aria-hidden="true">
                <i style={{ width: `${(selectedMuscle.sets / 30) * 100}%` }} />
              </span>
            </label>

            <fieldset className="priority-control">
              <legend>Growth priority</legend>
              <div>
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    className={
                      selectedMuscle.priority === priority.id ? "is-active" : ""
                    }
                    onClick={() => changeMusclePriority(priority.id)}
                  >
                    {selectedMuscle.priority === priority.id && (
                      <Check size={13} />
                    )}
                    {priority.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="muscle-volume-note">
              <BarChart3 size={16} />
              <p>
                {selectedMuscle.sets < 6
                  ? "A low-volume maintenance signal for this muscle."
                  : selectedMuscle.sets <= 18
                    ? "A productive growth range with room to adjust."
                    : "Higher volume adds diminishing returns and recovery cost."}
              </p>
            </div>
          </div>

          <div className="muscle-list" aria-label="All muscle groups">
            {MUSCLE_GROUPS.map((muscle) => {
              const setting = program.muscles[muscle.id];
              return (
                <button
                  key={muscle.id}
                  type="button"
                  className={activeMuscle === muscle.id ? "is-active" : ""}
                  onClick={() => setActiveMuscle(muscle.id)}
                >
                  <Dumbbell size={15} aria-hidden="true" />
                  <p>
                    <strong>{muscle.shortLabel}</strong>
                    <small>
                      {PRIORITIES.find(
                        (priority) => priority.id === setting.priority,
                      )?.label}
                    </small>
                  </p>
                  <b>{setting.sets}</b>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

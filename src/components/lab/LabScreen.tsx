"use client";

import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  Dumbbell,
  Info,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import {
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  EXPERIENCE_LEVELS,
  GOALS,
  METRICS,
  MUSCLE_GROUPS,
  MetricId,
  MuscleGroupId,
  MusclePriority,
  PhysiqueResult,
  TrainingProgram,
  getMuscleDefinition,
} from "@/lib/simulation";
import { MuscleMap } from "../muscles/MuscleMap";
import { MetricCard } from "./MetricCard";

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
  onNameChange: (name: string) => void;
  onMeasurementChange: (id: CharacterMeasurementId, value: number) => void;
  onBodyColorChange: (color: string) => void;
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
  onNameChange,
  onMeasurementChange,
  onBodyColorChange,
  onResetCharacter,
}: LabScreenProps) {
  const [activeMetric, setActiveMetric] =
    useState<MetricId>("proteinPerKg");
  const [activeMuscle, setActiveMuscle] =
    useState<MuscleGroupId>("chest");
  const selectedMuscle = program.muscles[activeMuscle];
  const selectedMuscleDefinition = getMuscleDefinition(activeMuscle);

  const changeMetric = (id: MetricId, value: number) => {
    onProgramChange((current) => ({
      ...current,
      values: { ...current.values, [id]: value },
    }));
    setActiveMetric(id);
  };

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
          <span className="eyebrow">Training response studio</span>
          <h1>Physique Lab</h1>
          <p>
            Shape your training inputs and give individual muscle groups
            focused attention.
          </p>
        </div>
        <div className="lab-heading-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onResetProgram}
            aria-label="Reset training program"
            title="Reset training program"
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
            onNameChange={onNameChange}
            onMeasurementChange={onMeasurementChange}
            onBodyColorChange={onBodyColorChange}
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

        <div className="lab-control-column">
          <article className="program-profile-card">
            <header>
              <span className="card-kicker">
                <Target size={14} />
                Training program
              </span>
              <span className="illustrative-badge">
                <Info size={12} />
                Illustrative
              </span>
            </header>
            <div className="profile-select-grid">
              <label>
                <span>Program name</span>
                <input
                  type="text"
                  value={program.name}
                  maxLength={32}
                  onChange={(event) =>
                    onProgramChange((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Primary goal</span>
                <select
                  value={program.goal}
                  onChange={(event) =>
                    onProgramChange((current) => ({
                      ...current,
                      goal: event.target.value as TrainingProgram["goal"],
                    }))
                  }
                >
                  {GOALS.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Training experience</span>
                <select
                  value={program.experience}
                  onChange={(event) =>
                    onProgramChange((current) => ({
                      ...current,
                      experience:
                        event.target.value as TrainingProgram["experience"],
                    }))
                  }
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="program-insight">
              <Sparkles size={15} />
              <p>
                <strong>{result.status}</strong>
                <span>{result.guidance}</span>
              </p>
            </div>
          </article>

          <div className="metric-grid">
            {METRICS.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                value={program.values[metric.id]}
                isActive={activeMetric === metric.id}
                onChange={changeMetric}
                onActivate={setActiveMetric}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="muscle-studio panel-card">
        <header className="panel-card__header muscle-studio__header">
          <div>
            <span className="eyebrow">Per-muscle programming</span>
            <h2>Choose what the plan emphasizes</h2>
          </div>
          <p>
            Weekly sets are tracked per muscle. High-volume areas also add
            more recovery demand.
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
                <small>0–30 sets per week</small>
              </span>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={selectedMuscle.sets}
                onChange={(event) => changeMuscleSets(Number(event.target.value))}
              />
              <span className="muscle-set-scale" aria-hidden="true">
                <i style={{ width: `${(selectedMuscle.sets / 30) * 100}%` }} />
              </span>
            </label>

            <fieldset className="priority-control">
              <legend>Programming priority</legend>
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
                  ? "A low-volume maintenance signal for this program."
                  : selectedMuscle.sets <= 18
                    ? "A productive range with room to adjust from feedback."
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

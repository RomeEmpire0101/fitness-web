"use client";

import { Activity } from "lucide-react";
import { CSSProperties } from "react";
import {
  CharacterAppearance,
  CharacterBodyType,
  CharacterEditor,
  CharacterMeasurementId,
  CharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import {
  METRICS,
  MetricId,
  PhysiqueResult,
  TrainingProgram,
} from "@/lib/simulation";

type LabScreenProps = {
  program: TrainingProgram;
  result: PhysiqueResult;
  profile: CharacterProfile;
  reducedMotion: boolean;
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

const INPUT_LABELS: Record<MetricId, string> = {
  proteinPerKg: "Protein",
  rir: "RIR",
  weeks: "Weeks",
  bodyFat: "Body fat",
  sleepHours: "Sleep",
  adherence: "Consistency",
  calorieBalance: "Calories",
};

const formatMetricValue = (
  id: MetricId,
  value: number,
  shortUnit: string,
) => {
  if (id === "calorieBalance") {
    return `${value > 0 ? "+" : ""}${value} ${shortUnit}`;
  }

  if (id === "sleepHours") {
    return `${value.toFixed(1).replace(".0", "")} h`;
  }

  if (id === "bodyFat" || id === "adherence") {
    return `${value}%`;
  }

  return `${value} ${shortUnit}`;
};

export function LabScreen({
  program,
  result,
  profile,
  reducedMotion,
  characterEditorOpen,
  onCharacterEditorOpenChange,
  onMeasurementChange,
  onBodyTypeChange,
  onAppearanceChange,
  onResetCharacter,
}: LabScreenProps) {
  return (
    <div className="lab-screen screen-enter">
      <header className="screen-heading lab-heading">
        <div>
          <span className="eyebrow">Anatomy studio</span>
          <h1>Physique Lab</h1>
          <p>Inspect the realistic body model and adjust its proportions.</p>
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

          <section
            className="lab-input-variables"
            aria-labelledby="input-variables-title"
          >
            <h2 id="input-variables-title">Input variables</h2>
            <div>
              {METRICS.map((metric) => (
                <span
                  className="input-variable-pill"
                  key={metric.id}
                  style={
                    {
                      "--pill-accent": metric.accent,
                    } as CSSProperties
                  }
                >
                  <span>{INPUT_LABELS[metric.id]}</span>
                  <strong>
                    {formatMetricValue(
                      metric.id,
                      program.values[metric.id],
                      metric.shortUnit,
                    )}
                  </strong>
                </span>
              ))}
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}

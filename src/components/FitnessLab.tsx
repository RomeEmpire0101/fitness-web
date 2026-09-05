"use client";

import { useMemo, useState } from "react";
import { useCharacterProfile } from "@/features/characters";
import { useFitnessData } from "@/hooks/useFitnessData";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { derivePhysique, TrainingProgram } from "@/lib/simulation";
import { LabScreen } from "./lab/LabScreen";

export function FitnessLab() {
  const [fitnessData, setFitnessData] = useFitnessData();
  const { program } = fitnessData;
  const [characterEditorOpen, setCharacterEditorOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const {
    profile,
    updateMeasurement,
    updateBodyType,
    updateAppearance,
    resetProfile,
  } = useCharacterProfile();

  const result = useMemo(
    () => derivePhysique(program, profile),
    [profile, program],
  );

  const updateProgram = (
    update: (program: TrainingProgram) => TrainingProgram,
  ) => {
    setFitnessData((current) => ({
      ...current,
      program: update(current.program),
    }));
  };

  return (
    <LabScreen
      program={program}
      result={result}
      profile={profile}
      reducedMotion={reducedMotion}
      onProgramChange={updateProgram}
      characterEditorOpen={characterEditorOpen}
      onCharacterEditorOpenChange={setCharacterEditorOpen}
      onMeasurementChange={updateMeasurement}
      onBodyTypeChange={updateBodyType}
      onAppearanceChange={updateAppearance}
      onResetCharacter={resetProfile}
    />
  );
}

"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CharacterEditor,
  useCharacterProfile,
} from "@/features/characters";
import CharacterScene from "@/features/characters/scene/CharacterScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  derivePhysique,
  INITIAL_VALUES,
  SimulationValues,
  VariableId,
  VARIABLES,
} from "@/lib/compactSimulation";
import { VariablePill } from "./lab/VariablePill";
import styles from "./MinimalFitnessLab.module.css";

export function MinimalFitnessLab() {
  const [values, setValues] = useState<SimulationValues>(INITIAL_VALUES);
  const [activeMetric, setActiveMetric] = useState<VariableId | null>("protein");
  const [characterEditorOpen, setCharacterEditorOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const result = useMemo(() => derivePhysique(values), [values]);
  const {
    profile,
    updateMeasurement,
    updateBodyColor,
    resetProfile,
  } = useCharacterProfile();

  const changeMetric = (id: VariableId, next: number) => {
    const definition = VARIABLES.find((variable) => variable.id === id);
    if (!definition) return;

    const stepped = Math.round(next / definition.step) * definition.step;
    const clamped = Math.min(
      definition.max,
      Math.max(definition.min, stepped),
    );

    setValues((current) => ({ ...current, [id]: clamped }));
    setActiveMetric(id);
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setActiveMetric(null);
    resetProfile();
  };

  return (
    <div className={styles.root}>
      <main className={styles.shell}>
        <section
          className={styles.stage}
          aria-label="Interactive physique simulator"
        >
          <button
            type="button"
            className={`${styles.glassIconButton} ${styles.resetButton}`}
            onClick={reset}
            aria-label="Reset all variables"
            title="Reset"
          >
            <RotateCcw size={18} strokeWidth={1.8} />
          </button>

          <div className={styles.canvasWrap}>
            <CharacterScene
              profile={profile}
              growth={result.growth}
              definition={result.definition}
              stimulus={result.stimulus}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className={styles.metricCloud} aria-label="Training variables">
            {VARIABLES.map((variable) => (
              <VariablePill
                key={variable.id}
                variable={variable}
                value={values[variable.id]}
                isActive={activeMetric === variable.id}
                onChange={changeMetric}
                onActivate={setActiveMetric}
              />
            ))}
          </div>

          <CharacterEditor
            profile={profile}
            open={characterEditorOpen}
            onOpenChange={setCharacterEditorOpen}
            onMeasurementChange={updateMeasurement}
            onBodyColorChange={updateBodyColor}
            onReset={resetProfile}
          />

          <div className={styles.srOnly} aria-live="polite">
            Character height {profile.measurements.heightCm} centimeters and
            weight {profile.measurements.weightKg} kilograms. Adaptation signal{" "}
            {result.adaptation} percent over {values.weeks} weeks.
          </div>
        </section>
      </main>
    </div>
  );
}

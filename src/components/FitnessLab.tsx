"use client";

import {
  Dumbbell,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCharacterProfile } from "@/features/characters";
import { useFitnessData } from "@/hooks/useFitnessData";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { derivePhysique } from "@/lib/simulation";
import { LabScreen } from "./lab/LabScreen";

export function FitnessLab() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [fitnessData] = useFitnessData();
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

  const result = useMemo(() => derivePhysique(program), [program]);

  return (
    <div className="fitness-app">
      <aside
        className={`app-sidebar ${
          mobileNavigationOpen ? "is-mobile-open" : ""
        }`}
      >
        <header className="app-brand">
          <span className="app-brand__icon" aria-hidden="true">
            <Dumbbell size={20} strokeWidth={1.9} />
          </span>
          <div>
            <strong>FORMFORGE</strong>
            <small>Adaptive fitness studio</small>
          </div>
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        <nav className="app-navigation" aria-label="Main application">
          <span>Workspace</span>
          <button
            type="button"
            className="is-active"
            aria-current="page"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <FlaskConical size={18} strokeWidth={1.9} />
            <span>Physique Lab</span>
          </button>
        </nav>
      </aside>

      {mobileNavigationOpen && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}

      <div className="app-column">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="mobile-brand">FORMFORGE</div>
          <span className="app-section-label">Physique workspace</span>
        </header>

        <main className="app-content">
          <LabScreen
            program={program}
            result={result}
            profile={profile}
            reducedMotion={reducedMotion}
            characterEditorOpen={characterEditorOpen}
            onCharacterEditorOpenChange={setCharacterEditorOpen}
            onMeasurementChange={updateMeasurement}
            onBodyTypeChange={updateBodyType}
            onAppearanceChange={updateAppearance}
            onResetCharacter={resetProfile}
          />
        </main>
      </div>
    </div>
  );
}

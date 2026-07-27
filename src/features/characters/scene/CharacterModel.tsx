"use client";

/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps -- R3F useFrame intentionally updates stable Three.js shader uniform objects outside React render. */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { deriveCharacterMorphology } from "../morphology";
import {
  CharacterProfile,
  CharacterVisualization,
} from "../types";
import {
  AnatomyUniforms,
  RealisticBody,
} from "./RealisticMaleBody";
import { CharacterLayers } from "./CharacterLayers";

export type CharacterModelProps = CharacterVisualization & {
  profile: CharacterProfile;
};

const damp = (
  current: number,
  target: number,
  smoothing: number,
  delta: number,
) => THREE.MathUtils.damp(current, target, smoothing, delta);

export function CharacterModel({
  profile,
  growth,
  definition,
  stimulus,
  muscleSignals,
  reducedMotion,
}: CharacterModelProps) {
  const root = useRef<THREE.Group>(null);
  const bodyScale = useRef<THREE.Group>(null);
  const breath = useRef<THREE.Group>(null);

  const morphology = useMemo(
    () => deriveCharacterMorphology(profile.measurements),
    [profile.measurements],
  );
  // Shader uniforms must retain object identity for the compiled WebGL program.
  const anatomy = useMemo<AnatomyUniforms>(
    () => ({
      uGrowth: { value: growth },
      uDefinition: { value: definition },
      uStimulus: { value: stimulus },
      uWidth: { value: morphology.widthScale },
      uFat: { value: morphology.fatLevel },
      uFeminine: { value: profile.bodyType === "female" ? 1 : 0 },
      uChest: { value: muscleSignals?.chest ?? growth },
      uBack: { value: muscleSignals?.back ?? growth },
      uShoulders: { value: muscleSignals?.shoulders ?? growth },
      uBiceps: { value: muscleSignals?.biceps ?? growth },
      uTriceps: { value: muscleSignals?.triceps ?? growth },
      uCore: { value: muscleSignals?.core ?? growth },
      uQuads: { value: muscleSignals?.quads ?? growth },
      uHamstrings: { value: muscleSignals?.hamstrings ?? growth },
      uGlutes: { value: muscleSignals?.glutes ?? growth },
      uCalves: { value: muscleSignals?.calves ?? growth },
      uStimulusColor: { value: new THREE.Color("#b85b48") },
    }),
    [],
  );
  const currentGrowth = useRef(growth);
  const currentDefinition = useRef(definition);
  const currentStimulus = useRef(stimulus);
  const currentHeight = useRef(morphology.heightScale);
  const currentWidth = useRef(morphology.widthScale);
  const currentFat = useRef(morphology.fatLevel);
  const currentFeminine = useRef(profile.bodyType === "female" ? 1 : 0);

  useFrame(({ clock }, delta) => {
    const g = damp(currentGrowth.current, growth, 4.8, delta);
    const d = damp(currentDefinition.current, definition, 4.4, delta);
    const s = damp(currentStimulus.current, stimulus, 4.2, delta);
    const height = damp(
      currentHeight.current,
      morphology.heightScale,
      5.2,
      delta,
    );
    const width = damp(
      currentWidth.current,
      morphology.widthScale,
      5.2,
      delta,
    );
    const fat = damp(
      currentFat.current,
      morphology.fatLevel,
      4.6,
      delta,
    );
    const feminine = damp(
      currentFeminine.current,
      profile.bodyType === "female" ? 1 : 0,
      5.2,
      delta,
    );
    currentGrowth.current = g;
    currentDefinition.current = d;
    currentStimulus.current = s;
    currentHeight.current = height;
    currentWidth.current = width;
    currentFat.current = fat;
    currentFeminine.current = feminine;

    const elapsed = clock.getElapsedTime();
    const inhale = reducedMotion ? 0 : Math.sin(elapsed * 1.68) * 0.5 + 0.5;
    const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.32);
    const groundOffset = (height - 1) * 2.49;

    if (root.current) {
      root.current.rotation.y = sway * 0.04;
      root.current.rotation.z = sway * 0.0025;
      root.current.position.y =
        groundOffset +
        (reducedMotion ? 0 : Math.sin(elapsed * 1.68) * 0.005);
    }
    bodyScale.current?.scale.set(1, height, 1);
    if (breath.current) {
      breath.current.scale.x = 1 + inhale * 0.0015;
      breath.current.scale.z = 1 + inhale * 0.006;
    }
    const signal = (id: keyof NonNullable<typeof muscleSignals>) =>
      muscleSignals?.[id] ?? g;
    anatomy.uGrowth.value = g;
    anatomy.uDefinition.value = d;
    anatomy.uStimulus.value = s;
    anatomy.uWidth.value = width;
    anatomy.uFat.value = fat;
    anatomy.uFeminine.value = feminine;
    anatomy.uChest.value = damp(anatomy.uChest.value, signal("chest"), 5, delta);
    anatomy.uBack.value = damp(anatomy.uBack.value, signal("back"), 5, delta);
    anatomy.uShoulders.value = damp(
      anatomy.uShoulders.value,
      signal("shoulders"),
      5,
      delta,
    );
    anatomy.uBiceps.value = damp(
      anatomy.uBiceps.value,
      signal("biceps"),
      5,
      delta,
    );
    anatomy.uTriceps.value = damp(
      anatomy.uTriceps.value,
      signal("triceps"),
      5,
      delta,
    );
    anatomy.uCore.value = damp(anatomy.uCore.value, signal("core"), 5, delta);
    anatomy.uQuads.value = damp(anatomy.uQuads.value, signal("quads"), 5, delta);
    anatomy.uHamstrings.value = damp(
      anatomy.uHamstrings.value,
      signal("hamstrings"),
      5,
      delta,
    );
    anatomy.uGlutes.value = damp(
      anatomy.uGlutes.value,
      signal("glutes"),
      5,
      delta,
    );
    anatomy.uCalves.value = damp(
      anatomy.uCalves.value,
      signal("calves"),
      5,
      delta,
    );
  });

  return (
    <group ref={root}>
      <group ref={bodyScale}>
        <group ref={breath}>
          <RealisticBody
            appearance={profile.appearance}
            bodyType={profile.bodyType}
            anatomy={anatomy}
          />
          <CharacterLayers
            profile={profile}
            morphology={morphology}
          />
        </group>
      </group>
    </group>
  );
}

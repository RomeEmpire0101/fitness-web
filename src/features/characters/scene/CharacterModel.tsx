"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { deriveCharacterMorphology } from "../morphology";
import {
  CharacterProfile,
  CharacterVisualization,
} from "../types";
import { CharacterBody } from "./CharacterBody";
import { CharacterRig } from "./rig";

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
  const chest = useRef<THREE.Mesh>(null);
  const upperChest = useRef<THREE.Mesh>(null);
  const waist = useRef<THREE.Mesh>(null);
  const leftShoulder = useRef<THREE.Mesh>(null);
  const rightShoulder = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftUpperArm = useRef<THREE.Mesh>(null);
  const rightUpperArm = useRef<THREE.Mesh>(null);
  const leftForearm = useRef<THREE.Mesh>(null);
  const rightForearm = useRef<THREE.Mesh>(null);
  const leftThigh = useRef<THREE.Mesh>(null);
  const rightThigh = useRef<THREE.Mesh>(null);
  const leftCalf = useRef<THREE.Mesh>(null);
  const rightCalf = useRef<THREE.Mesh>(null);
  const contourMaterial = useRef<THREE.MeshStandardMaterial>(null);

  const rig: CharacterRig = {
    bodyScale,
    breath,
    chest,
    upperChest,
    waist,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftUpperArm,
    rightUpperArm,
    leftForearm,
    rightForearm,
    leftThigh,
    rightThigh,
    leftCalf,
    rightCalf,
    contourMaterial,
  };

  const morphology = useMemo(
    () => deriveCharacterMorphology(profile.measurements),
    [profile.measurements],
  );
  const currentGrowth = useRef(growth);
  const currentDefinition = useRef(definition);
  const currentStimulus = useRef(stimulus);
  const currentHeight = useRef(morphology.heightScale);
  const currentWidth = useRef(morphology.widthScale);

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
    currentGrowth.current = g;
    currentDefinition.current = d;
    currentStimulus.current = s;
    currentHeight.current = height;
    currentWidth.current = width;

    const elapsed = clock.getElapsedTime();
    const inhale = reducedMotion ? 0 : Math.sin(elapsed * 1.72) * 0.5 + 0.5;
    const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.34);
    const groundOffset = (height - 1) * 2.26;

    if (root.current) {
      root.current.rotation.y = sway * 0.055;
      root.current.position.y =
        groundOffset + (reducedMotion ? -0.07 : -0.07 + Math.sin(elapsed * 1.72) * 0.008);
    }
    bodyScale.current?.scale.set(width, height, width);

    if (breath.current) {
      breath.current.scale.y = 1 + inhale * 0.008;
      breath.current.scale.z = 1 + inhale * 0.014;
    }

    const signal = (id: keyof NonNullable<typeof muscleSignals>) =>
      muscleSignals?.[id] ?? g;
    const chestSignal = (signal("chest") + signal("back")) / 2;
    const shoulderSignal = signal("shoulders");
    const armSignal = (signal("biceps") + signal("triceps")) / 2;
    const thighSignal =
      (signal("quads") + signal("hamstrings") + signal("glutes")) / 3;
    const calfSignal = signal("calves");

    chest.current?.scale.set(
      0.73 * (1 + g * (0.12 + chestSignal * 0.12)),
      0.73 * (1 + g * 0.025),
      0.36 * (1 + g * (0.1 + chestSignal * 0.12)),
    );
    upperChest.current?.scale.set(
      0.78 * (1 + g * (0.12 + chestSignal * 0.16)),
      0.46 * (1 + g * 0.04),
      0.36 * (1 + g * (0.1 + chestSignal * 0.14)),
    );
    waist.current?.scale.set(1 + g * 0.1, 1, 1 + g * 0.08);

    const shoulderOffset = 0.755 + g * (0.065 + shoulderSignal * 0.07);
    if (leftShoulder.current) {
      leftShoulder.current.position.x = -shoulderOffset;
      leftShoulder.current.scale.setScalar(
        0.28 * (1 + g * (0.18 + shoulderSignal * 0.2)),
      );
    }
    if (rightShoulder.current) {
      rightShoulder.current.position.x = shoulderOffset;
      rightShoulder.current.scale.setScalar(
        0.28 * (1 + g * (0.18 + shoulderSignal * 0.2)),
      );
    }
    if (leftArm.current) leftArm.current.position.x = -shoulderOffset;
    if (rightArm.current) rightArm.current.position.x = shoulderOffset;

    leftUpperArm.current?.scale.set(
      1 + g * (0.2 + armSignal * 0.24),
      1 + g * 0.035,
      1 + g * (0.2 + armSignal * 0.24),
    );
    if (leftUpperArm.current && rightUpperArm.current) {
      rightUpperArm.current.scale.copy(leftUpperArm.current.scale);
    }
    leftForearm.current?.scale.set(
      1 + g * (0.14 + armSignal * 0.15),
      1 + g * 0.02,
      1 + g * (0.14 + armSignal * 0.15),
    );
    if (leftForearm.current && rightForearm.current) {
      rightForearm.current.scale.copy(leftForearm.current.scale);
    }
    leftThigh.current?.scale.set(
      1 + g * (0.16 + thighSignal * 0.2),
      1 + g * 0.035,
      1 + g * (0.16 + thighSignal * 0.2),
    );
    if (leftThigh.current && rightThigh.current) {
      rightThigh.current.scale.copy(leftThigh.current.scale);
    }
    leftCalf.current?.scale.set(
      1 + g * (0.14 + calfSignal * 0.17),
      1 + g * 0.025,
      1 + g * (0.14 + calfSignal * 0.17),
    );
    if (leftCalf.current && rightCalf.current) {
      rightCalf.current.scale.copy(leftCalf.current.scale);
    }

    if (contourMaterial.current) {
      contourMaterial.current.opacity = 0.08 + d * 0.38 + s * 0.12;
      contourMaterial.current.emissiveIntensity = 0.08 + d * 0.28 + s * 0.16;
    }
  });

  return (
    <group ref={root} position={[0, -0.07, 0]}>
      <CharacterBody appearance={profile.appearance} rig={rig} />
    </group>
  );
}

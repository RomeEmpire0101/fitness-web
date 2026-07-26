"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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
  reducedMotion,
}: CharacterModelProps) {
  const root = useRef<THREE.Group>(null);
  const aura = useRef<THREE.Mesh>(null);
  const auraMaterial = useRef<THREE.MeshBasicMaterial>(null);

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
  const previousStimulus = useRef(stimulus);
  const pulse = useRef(0);

  useEffect(() => {
    if (Math.abs(stimulus - previousStimulus.current) > 0.018) {
      pulse.current = 1;
      previousStimulus.current = stimulus;
    }
  }, [stimulus]);

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
    pulse.current = Math.max(0, pulse.current - delta * 1.7);

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

    chest.current?.scale.set(
      0.73 * (1 + g * 0.2),
      0.73 * (1 + g * 0.025),
      0.36 * (1 + g * 0.18),
    );
    upperChest.current?.scale.set(
      0.78 * (1 + g * 0.24),
      0.46 * (1 + g * 0.04),
      0.36 * (1 + g * 0.2),
    );
    waist.current?.scale.set(1 + g * 0.1, 1, 1 + g * 0.08);

    const shoulderOffset = 0.755 + g * 0.115;
    if (leftShoulder.current) {
      leftShoulder.current.position.x = -shoulderOffset;
      leftShoulder.current.scale.setScalar(0.28 * (1 + g * 0.32));
    }
    if (rightShoulder.current) {
      rightShoulder.current.position.x = shoulderOffset;
      rightShoulder.current.scale.setScalar(0.28 * (1 + g * 0.32));
    }
    if (leftArm.current) leftArm.current.position.x = -shoulderOffset;
    if (rightArm.current) rightArm.current.position.x = shoulderOffset;

    leftUpperArm.current?.scale.set(
      1 + g * 0.38,
      1 + g * 0.035,
      1 + g * 0.38,
    );
    if (leftUpperArm.current && rightUpperArm.current) {
      rightUpperArm.current.scale.copy(leftUpperArm.current.scale);
    }
    leftForearm.current?.scale.set(
      1 + g * 0.24,
      1 + g * 0.02,
      1 + g * 0.24,
    );
    if (leftForearm.current && rightForearm.current) {
      rightForearm.current.scale.copy(leftForearm.current.scale);
    }
    leftThigh.current?.scale.set(
      1 + g * 0.3,
      1 + g * 0.035,
      1 + g * 0.3,
    );
    if (leftThigh.current && rightThigh.current) {
      rightThigh.current.scale.copy(leftThigh.current.scale);
    }
    leftCalf.current?.scale.set(
      1 + g * 0.25,
      1 + g * 0.025,
      1 + g * 0.25,
    );
    if (leftCalf.current && rightCalf.current) {
      rightCalf.current.scale.copy(leftCalf.current.scale);
    }

    if (contourMaterial.current) {
      contourMaterial.current.opacity = 0.1 + d * 0.64;
      contourMaterial.current.emissiveIntensity = 0.18 + d * 0.75;
    }

    if (aura.current) {
      const pulseScale = 1 + pulse.current * 0.13;
      const energyScale = (0.92 + s * 0.2) * pulseScale;
      aura.current.scale.set(
        energyScale * width,
        energyScale * height,
        energyScale,
      );
    }
    if (auraMaterial.current) {
      auraMaterial.current.opacity =
        0.025 + s * 0.09 + pulse.current * 0.075;
    }
  });

  return (
    <group ref={root} position={[0, -0.07, 0]}>
      <mesh ref={aura} position={[0, 0.05, -0.62]} scale={0.95}>
        <circleGeometry args={[2.35, 72]} />
        <meshBasicMaterial
          ref={auraMaterial}
          color={profile.appearance.accentColor}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <CharacterBody appearance={profile.appearance} rig={rig} />
    </group>
  );
}

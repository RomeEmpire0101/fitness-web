"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CharacterAppearance } from "../types";
import anatomyLimits from "./anatomyLimits.json";

const MALE_ANATOMY_LIMITS = anatomyLimits.male;

export type AnatomyUniforms = {
  uGrowth: { value: number };
  uDefinition: { value: number };
  uStimulus: { value: number };
  uWidth: { value: number };
  uFat: { value: number };
  uFeminine: { value: number };
  uChest: { value: number };
  uBack: { value: number };
  uShoulders: { value: number };
  uBiceps: { value: number };
  uTriceps: { value: number };
  uCore: { value: number };
  uQuads: { value: number };
  uHamstrings: { value: number };
  uGlutes: { value: number };
  uCalves: { value: number };
  uStimulusColor: { value: THREE.Color };
};

type RealisticMaleBodyProps = {
  appearance: CharacterAppearance;
  anatomy: AnatomyUniforms;
};

function injectAnatomyShader(
  material: THREE.MeshPhysicalMaterial,
  anatomy: AnatomyUniforms,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, anatomy);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uGrowth;
        uniform float uWidth;
        uniform float uFat;
        uniform float uChest;
        uniform float uBack;
        uniform float uShoulders;
        uniform float uBiceps;
        uniform float uTriceps;
        uniform float uCore;
        uniform float uQuads;
        uniform float uHamstrings;
        uniform float uGlutes;
        uniform float uCalves;
        varying vec3 vAnatomyPosition;

        float anatomyBand(float value, float low, float high, float fade) {
          return smoothstep(low, low + fade, value) *
            (1.0 - smoothstep(high - fade, high, value));
        }

        float anatomySignal(float value) {
          return clamp(value, 0.0, 1.0);
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float ax = abs(position.x);
        float front = smoothstep(0.015, 0.2, position.z);
        float rear = smoothstep(0.015, 0.2, -position.z);
        float rearBias = 0.16 + rear * 0.84;
        float centerTorso = 1.0 - smoothstep(0.38, 0.72, ax);
        float armZone = anatomyBand(ax, 0.58, 1.22, 0.2);
        float upperArmZone = anatomyBand(ax, 0.62, 1.16, 0.18);
        float legZone = anatomyBand(ax, 0.055, 0.72, 0.17);
        float hipZone = 1.0 - smoothstep(0.72, 0.94, ax);

        float chestMask = anatomyBand(position.y, 0.52, 1.3, 0.2) *
          front * centerTorso;
        float upperBackMask = anatomyBand(position.y, 0.64, 1.58, 0.22) *
          rearBias * (1.0 - smoothstep(0.92, 1.18, ax));
        float latMask = anatomyBand(position.y, 0.2, 1.2, 0.28) *
          anatomyBand(ax, 0.22, 0.86, 0.2) * (0.3 + rear * 0.7);
        float backMask = max(upperBackMask, latMask);
        float shoulderMask = anatomyBand(position.y, 0.82, 1.5, 0.18) *
          anatomyBand(ax, 0.42, 0.98, 0.18);
        float bicepsMask = anatomyBand(position.y, 0.12, 1.12, 0.24) *
          armZone * front;
        float tricepsMask = anatomyBand(position.y, 0.3, 1.14, 0.22) *
          upperArmZone * rear;
        float coreMask = anatomyBand(position.y, -0.25, 0.75, 0.2) *
          centerTorso * front;
        float gluteMask = anatomyBand(position.y, -0.78, 0.18, 0.26) *
          hipZone * (0.18 + rear * 0.82);
        float quadMask = anatomyBand(position.y, -1.58, -0.08, 0.3) *
          legZone * (0.3 + front * 0.7);
        float hamstringMask = anatomyBand(position.y, -1.58, -0.08, 0.3) *
          legZone * (0.3 + rear * 0.7);
        float calfMask = anatomyBand(position.y, -2.24, -0.98, 0.24) *
          legZone;

        float chestExpansion =
          anatomySignal(uChest) * chestMask * 0.09;
        float backExpansion =
          anatomySignal(uBack) * backMask * 0.11;
        float shoulderExpansion =
          anatomySignal(uShoulders) * shoulderMask * 0.05;
        float bicepsExpansion =
          anatomySignal(uBiceps) * bicepsMask * 0.022;
        float tricepsExpansion =
          anatomySignal(uTriceps) * tricepsMask * 0.012;
        float coreExpansion =
          anatomySignal(uCore) * coreMask * 0.045;
        float gluteExpansion =
          anatomySignal(uGlutes) * gluteMask * 0.1;
        float quadExpansion =
          anatomySignal(uQuads) * quadMask * 0.11;
        float hamstringExpansion =
          anatomySignal(uHamstrings) * hamstringMask * 0.105;
        float calfExpansion =
          anatomySignal(uCalves) * calfMask * 0.052;

        // Regional responses blend by maximum influence instead of stacking.
        // This prevents overlapping muscles from ballooning shared vertices.
        float upperExpansion = max(
          max(chestExpansion, backExpansion),
          max(
            max(shoulderExpansion, bicepsExpansion),
            max(tricepsExpansion, coreExpansion)
          )
        );
        float lowerExpansion = max(
          max(gluteExpansion, quadExpansion),
          max(hamstringExpansion, calfExpansion)
        );
        float expansion = max(upperExpansion, lowerExpansion);

        // Broad overlapping envelopes produce a continuous subcutaneous layer.
        // Regional masks then bias where volume accumulates without creating
        // isolated spheres or sharp seams between adjacent body areas.
        float trunkEnvelope = anatomyBand(position.y, -0.82, 1.34, 0.42) *
          (1.0 - smoothstep(0.7, 0.98, ax));
        float upperArmEnvelope = anatomyBand(position.y, -0.02, 1.18, 0.34) *
          armZone;
        float hipEnvelope = anatomyBand(position.y, -0.82, 0.16, 0.34) *
          (1.0 - smoothstep(0.76, 1.0, ax));
        float thighEnvelope = anatomyBand(position.y, -1.62, -0.06, 0.4) *
          legZone;
        float calfEnvelope = anatomyBand(position.y, -2.28, -0.98, 0.34) *
          legZone;
        float neckEnvelope = anatomyBand(position.y, 1.32, 1.84, 0.2) *
          (1.0 - smoothstep(0.24, 0.46, ax));
        float jawEnvelope = anatomyBand(position.y, 1.64, 1.98, 0.16) *
          front * (1.0 - smoothstep(0.18, 0.4, ax));
        float sideFacing = smoothstep(0.28, 0.82, abs(objectNormal.x));

        float abdomen = anatomyBand(position.y, -0.28, 0.76, 0.38) *
          (1.0 - smoothstep(0.64, 0.88, ax));
        float lowerAbdomen = anatomyBand(position.y, -0.34, 0.34, 0.28) *
          front * (1.0 - smoothstep(0.62, 0.86, ax));
        float flank = anatomyBand(position.y, -0.3, 0.64, 0.34) *
          anatomyBand(ax, 0.22, 0.74, 0.22) * sideFacing;
        float lowerBack = anatomyBand(position.y, -0.32, 0.54, 0.32) *
          rear * (1.0 - smoothstep(0.72, 0.94, ax));
        float chestAdipose = anatomyBand(position.y, 0.42, 1.26, 0.3) *
          front * centerTorso;
        float upperBackAdipose = anatomyBand(position.y, 0.38, 1.24, 0.34) *
          rear * (1.0 - smoothstep(0.72, 0.98, ax));
        float gluteAdipose = anatomyBand(position.y, -0.76, 0.12, 0.32) *
          legZone * rear;

        float commonSubcutaneous =
          trunkEnvelope * 0.024 +
          upperArmEnvelope * 0.018 +
          calfEnvelope * 0.01 +
          neckEnvelope * 0.01 +
          jawEnvelope * 0.006;
        float maleSubcutaneous =
          commonSubcutaneous +
          thighEnvelope * 0.005;
        float femaleSubcutaneous =
          commonSubcutaneous +
          hipEnvelope * 0.018 +
          thighEnvelope * 0.022;

        float maleMidsection = max(
          max(abdomen * 0.12, lowerAbdomen * 0.14),
          max(flank * 0.108, lowerBack * 0.078)
        );
        float maleFatExpansion =
          maleSubcutaneous +
          maleMidsection +
          chestAdipose * 0.035 +
          upperBackAdipose * 0.028 +
          gluteAdipose * 0.01;

        float femaleWaist = anatomyBand(position.y, -0.42, 0.48, 0.34) *
          anatomyBand(ax, 0.18, 0.7, 0.2) * sideFacing;
        float femaleLowerBody = max(
          max(hipEnvelope * 0.034, gluteAdipose * 0.038),
          thighEnvelope * 0.032
        );
        float femaleTorso = max(
          lowerAbdomen * 0.052,
          femaleWaist * 0.042
        );
        float femaleFatExpansion =
          femaleSubcutaneous +
          femaleLowerBody +
          femaleTorso +
          chestAdipose * 0.032 +
          upperBackAdipose * 0.024 +
          lowerBack * 0.03;
        float fatExpansion = clamp(maleFatExpansion, 0.0, 0.2);
        float muscleVisibility = mix(
          1.0,
          0.58,
          clamp(uFat * 0.78, 0.0, 1.0)
        );
        float muscleDisplacement = clamp(
          expansion * anatomySignal(uGrowth) * muscleVisibility,
          0.0,
          ${MALE_ANATOMY_LIMITS.maxNormalDisplacement.toFixed(3)}
        );
        float fatDisplacement = clamp(
          fatExpansion * clamp(uFat, 0.0, 1.18),
          0.0,
          ${MALE_ANATOMY_LIMITS.maxTotalNormalDisplacement.toFixed(3)}
        );
        float totalNormalDisplacement = clamp(
          muscleDisplacement + fatDisplacement,
          0.0,
          ${MALE_ANATOMY_LIMITS.maxTotalNormalDisplacement.toFixed(3)}
        );
        transformed += objectNormal * totalNormalDisplacement;

        float regionalGrowth = anatomySignal(uGrowth) * muscleVisibility;
        float lateralGrowth = clamp(
          regionalGrowth * max(
            max(
              anatomySignal(uBack) * backMask * 0.055,
              anatomySignal(uShoulders) * shoulderMask * 0.035
            ),
            max(
              max(
                anatomySignal(uGlutes) * gluteMask * 0.035,
                anatomySignal(uQuads) * quadMask * 0.045
              ),
              max(
                anatomySignal(uHamstrings) * hamstringMask * 0.04,
                anatomySignal(uCalves) * calfMask * 0.025
              )
            )
          ),
          0.0,
          ${MALE_ANATOMY_LIMITS.maxLateralScale.toFixed(3)}
        );
        float depthGrowth = clamp(
          regionalGrowth * max(
            max(
              anatomySignal(uChest) * chestMask * 0.05,
              anatomySignal(uBack) * backMask * 0.045
            ),
            max(
              max(
                anatomySignal(uCore) * coreMask * 0.018,
                anatomySignal(uGlutes) * gluteMask * 0.055
              ),
              max(
                anatomySignal(uQuads) * quadMask * 0.04,
                max(
                  anatomySignal(uHamstrings) * hamstringMask * 0.04,
                  anatomySignal(uCalves) * calfMask * 0.022
                )
              )
            )
          ),
          0.0,
          ${MALE_ANATOMY_LIMITS.maxDepthScale.toFixed(3)}
        );
        transformed.x *= 1.0 + lateralGrowth;
        transformed.z *= 1.0 + depthGrowth;

        float maleCentralScale = anatomyBand(
          position.y,
          -0.3,
          0.84,
          0.44
        ) * (1.0 - smoothstep(0.7, 0.95, ax));
        float femaleTrunkScale = anatomyBand(
          position.y,
          -0.76,
          0.8,
          0.48
        ) * (1.0 - smoothstep(0.74, 0.98, ax));
        float femaleHipScale = anatomyBand(
          position.y,
          -0.88,
          0.1,
          0.38
        ) * (1.0 - smoothstep(0.78, 1.0, ax));
        float femaleThighScale = anatomyBand(
          position.y,
          -1.58,
          -0.08,
          0.42
        ) * legZone;
        float fatXScale =
          maleCentralScale * 0.18 -
          hipEnvelope * 0.1 -
          thighEnvelope * 0.05;
        float fatZScale = maleCentralScale * 0.24;
        transformed.x *= 1.0 + uFat * fatXScale;
        transformed.z *= 1.0 + uFat * fatZScale;

        float bodyWidthMask = 1.0 - smoothstep(1.48, 1.96, position.y);
        float extremityMask =
          smoothstep(-2.38, -2.08, position.y) *
          (1.0 - smoothstep(1.5, 1.92, position.y));
        float widthBlend = bodyWidthMask * mix(0.55, 1.0, extremityMask);
        transformed.x *= mix(1.0, uWidth, widthBlend);
        transformed.z *= mix(1.0, uWidth, widthBlend * 0.72);
        vAnatomyPosition = transformed;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uDefinition;
        uniform float uStimulus;
        uniform float uFat;
        uniform vec3 uStimulusColor;
        varying vec3 vAnatomyPosition;

        float anatomyBand(float value, float low, float high, float fade) {
          return smoothstep(low, low + fade, value) *
            (1.0 - smoothstep(high - fade, high, value));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float anatomyX = abs(vAnatomyPosition.x);
        float anatomyFront = smoothstep(0.02, 0.18, vAnatomyPosition.z);
        float anatomyRear = smoothstep(0.02, 0.18, -vAnatomyPosition.z);
        float torsoCenter = 1.0 - smoothstep(0.4, 0.72, anatomyX);
        float anatomyArms = anatomyBand(anatomyX, 0.56, 1.2, 0.2);
        float anatomyLegs = anatomyBand(anatomyX, 0.09, 0.62, 0.16);
        float pecArea = anatomyBand(vAnatomyPosition.y, 0.52, 1.3, 0.2) *
          anatomyFront * torsoCenter;
        float backArea = anatomyBand(vAnatomyPosition.y, 0.42, 1.38, 0.22) *
          anatomyRear;
        float armArea = anatomyBand(vAnatomyPosition.y, 0.1, 1.15, 0.22) *
          anatomyArms;
        float coreArea = anatomyBand(vAnatomyPosition.y, -0.28, 0.76, 0.2) *
          anatomyFront * torsoCenter;
        float thighArea = anatomyBand(vAnatomyPosition.y, -1.4, -0.15, 0.22) *
          anatomyLegs;
        float calfArea = anatomyBand(vAnatomyPosition.y, -2.2, -1.02, 0.22) *
          anatomyLegs;

        float horizontalFibers = 0.5 + 0.5 * sin(
          vAnatomyPosition.x * 118.0 + vAnatomyPosition.y * 16.0
        );
        float verticalFibers = 0.5 + 0.5 * sin(
          vAnatomyPosition.y * 116.0 + vAnatomyPosition.x * 13.0
        );
        float diagonalFibers = 0.5 + 0.5 * sin(
          (vAnatomyPosition.y + anatomyX * 0.42) * 105.0
        );
        float fiber =
          pow(horizontalFibers, 13.0) * pecArea +
          pow(diagonalFibers, 14.0) * backArea +
          pow(verticalFibers, 15.0) *
            (armArea + coreArea * 0.72 + thighArea + calfArea);
        float muscleSurface = clamp(
          pecArea + backArea + armArea + coreArea + thighArea + calfArea,
          0.0,
          1.0
        );
        float surfaceDefinition = uDefinition * (
          1.0 - clamp(uFat * 0.82, 0.0, 0.92)
        );
        float visibleStimulus = uStimulus * (
          1.0 - clamp(uFat * 0.65, 0.0, 0.82)
        );
        diffuseColor.rgb *= 1.0 - fiber * surfaceDefinition * 0.028;
        diffuseColor.rgb = mix(
          diffuseColor.rgb,
          uStimulusColor,
          muscleSurface * visibleStimulus * 0.022
        );`,
      );
  };

  material.customProgramCacheKey = () => "realistic-male-anatomy-v15";
}

function createSkinMaterial(
  appearance: CharacterAppearance,
  anatomy: AnatomyUniforms,
) {
  const base = new THREE.Color(appearance.bodyColor);
  const material = new THREE.MeshPhysicalMaterial({
    color: base,
    roughness: 0.68,
    metalness: 0,
    clearcoat: 0.025,
    clearcoatRoughness: 0.88,
    sheen: 0.13,
    sheenColor: base.clone().lerp(new THREE.Color("#ffd2ba"), 0.25),
    sheenRoughness: 0.82,
    envMapIntensity: 0.72,
  });
  material.name = "male-skin";
  injectAnatomyShader(material, anatomy);
  return material;
}

export function RealisticMaleBody({
  appearance,
  anatomy,
}: RealisticMaleBodyProps) {
  const { scene } = useGLTF("/models/male-base.glb");
  const skinMaterial = useMemo(
    () => createSkinMaterial(appearance, anatomy),
    [anatomy, appearance],
  );
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const clonedGeometries: THREE.BufferGeometry[] = [];
    model.traverse((object: THREE.Object3D) => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone();
      geometry.deleteAttribute("normal");
      geometry.computeVertexNormals();
      object.geometry = geometry;
      object.material = skinMaterial;
      object.castShadow = true;
      object.receiveShadow = true;
      clonedGeometries.push(geometry);
    });

    return () => {
      clonedGeometries.forEach((geometry) => geometry.dispose());
      skinMaterial.dispose();
    };
  }, [model, skinMaterial]);

  return (
    <group dispose={null}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload("/models/male-base.glb");

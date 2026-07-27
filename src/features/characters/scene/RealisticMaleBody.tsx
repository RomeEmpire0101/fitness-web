"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  CharacterAppearance,
  CharacterBodyType,
} from "../types";

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

type RealisticBodyProps = {
  appearance: CharacterAppearance;
  bodyType: CharacterBodyType;
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
        uniform float uFeminine;
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
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float ax = abs(position.x);
        float front = smoothstep(0.015, 0.2, position.z);
        float rear = smoothstep(0.015, 0.2, -position.z);
        float centerTorso = 1.0 - smoothstep(0.38, 0.72, ax);
        float armZone = anatomyBand(ax, 0.58, 1.22, 0.2);
        float legZone = anatomyBand(ax, 0.1, 0.62, 0.16);

        float chestMask = anatomyBand(position.y, 0.52, 1.3, 0.2) *
          front * centerTorso;
        float backMask = anatomyBand(position.y, 0.42, 1.38, 0.24) *
          rear * (1.0 - smoothstep(0.76, 1.15, ax));
        float shoulderMask = anatomyBand(position.y, 0.82, 1.5, 0.18) *
          anatomyBand(ax, 0.42, 0.98, 0.18);
        float bicepsMask = anatomyBand(position.y, 0.12, 1.12, 0.24) *
          armZone * front;
        float tricepsMask = anatomyBand(position.y, 0.12, 1.12, 0.24) *
          armZone * rear;
        float coreMask = anatomyBand(position.y, -0.25, 0.75, 0.2) *
          centerTorso * front;
        float gluteMask = anatomyBand(position.y, -0.48, 0.22, 0.2) *
          legZone * rear;
        float quadMask = anatomyBand(position.y, -1.35, -0.18, 0.24) *
          legZone * front;
        float hamstringMask = anatomyBand(position.y, -1.38, -0.18, 0.24) *
          legZone * rear;
        float calfMask = anatomyBand(position.y, -2.18, -1.05, 0.22) *
          legZone;

        float expansion =
          uChest * chestMask * 0.072 +
          uBack * backMask * 0.065 +
          uShoulders * shoulderMask * 0.068 +
          uBiceps * bicepsMask * 0.055 +
          uTriceps * tricepsMask * 0.052 +
          uCore * coreMask * 0.032 +
          uGlutes * gluteMask * 0.06 +
          uQuads * quadMask * 0.06 +
          uHamstrings * hamstringMask * 0.057 +
          uCalves * calfMask * 0.052;

        // Body presentation changes regional frame proportions without changing
        // the shared height/weight calculation.
        float shoulderFrame = anatomyBand(position.y, 0.78, 1.48, 0.18) *
          anatomyBand(ax, 0.34, 1.02, 0.2);
        float waistFrame = anatomyBand(position.y, -0.28, 0.62, 0.2) *
          (1.0 - smoothstep(0.64, 0.86, ax));
        float hipFrame = anatomyBand(position.y, -0.72, 0.08, 0.18) *
          (1.0 - smoothstep(0.7, 0.9, ax));
        float thighFrame = anatomyBand(position.y, -1.48, -0.2, 0.24) *
          legZone;
        float feminineXScale =
          1.0 -
          shoulderFrame * 0.075 -
          waistFrame * 0.07 +
          hipFrame * 0.12 +
          thighFrame * 0.055;
        transformed.x *= mix(1.0, feminineXScale, uFeminine);
        float feminineChestShape =
          anatomyBand(position.y, 0.45, 1.14, 0.18) *
          front *
          (1.0 - smoothstep(0.38, 0.64, ax));
        transformed += objectNormal *
          feminineChestShape *
          uFeminine *
          0.075;

        // Fat is intentionally regional rather than a global scale. The signal
        // is identical for both presentations; only the distribution changes.
        float torsoZone = 1.0 - smoothstep(0.58, 0.82, ax);
        float sideFacing = smoothstep(0.35, 0.88, abs(objectNormal.x));
        float abdomenFat = anatomyBand(position.y, -0.5, 0.72, 0.22) *
          front * torsoZone;
        float lowerBellyFat = anatomyBand(position.y, -0.58, 0.18, 0.18) *
          front * torsoZone;
        float flankFat = anatomyBand(position.y, -0.48, 0.62, 0.2) *
          anatomyBand(ax, 0.3, 0.72, 0.14) * sideFacing;
        float lowerBackFat = anatomyBand(position.y, -0.48, 0.5, 0.2) *
          rear * (1.0 - smoothstep(0.65, 0.85, ax));
        float chestFat = anatomyBand(position.y, 0.5, 1.25, 0.22) *
          front * centerTorso;
        float upperBackFat = anatomyBand(position.y, 0.45, 1.2, 0.25) *
          rear * (1.0 - smoothstep(0.7, 0.95, ax));
        float neckFat = anatomyBand(position.y, 1.38, 1.82, 0.12) *
          (1.0 - smoothstep(0.22, 0.42, ax));
        float jawFat = anatomyBand(position.y, 1.65, 1.92, 0.1) *
          front * (1.0 - smoothstep(0.18, 0.38, ax));
        float armFat = anatomyBand(position.y, 0.05, 1.1, 0.24) * armZone;
        float gluteFat = anatomyBand(position.y, -0.5, 0.2, 0.2) *
          legZone * rear;
        float thighFat = anatomyBand(position.y, -1.45, -0.12, 0.25) *
          legZone;
        float calfFat = anatomyBand(position.y, -2.18, -1.06, 0.22) *
          legZone;
        float maleFatExpansion =
          abdomenFat * 0.16 +
          lowerBellyFat * 0.11 +
          flankFat * 0.14 +
          lowerBackFat * 0.09 +
          chestFat * 0.075 +
          upperBackFat * 0.065 +
          neckFat * 0.04 +
          jawFat * 0.03 +
          armFat * 0.055 +
          gluteFat * 0.115 +
          thighFat * 0.085 +
          calfFat * 0.025;
        float femaleLowerAbdomen = anatomyBand(
          position.y,
          -0.62,
          0.22,
          0.18
        ) * front * torsoZone;
        float femaleWaist = anatomyBand(position.y, -0.38, 0.45, 0.2) *
          anatomyBand(ax, 0.24, 0.68, 0.14) * sideFacing;
        float femaleHip = anatomyBand(position.y, -0.72, 0.08, 0.18) *
          (1.0 - smoothstep(0.78, 0.98, ax));
        float femaleGlute = anatomyBand(position.y, -0.72, 0.1, 0.18) *
          legZone * rear;
        float femaleThigh = anatomyBand(position.y, -1.55, -0.1, 0.24) *
          legZone;
        float femaleChest = anatomyBand(position.y, 0.43, 1.2, 0.2) *
          front * centerTorso;
        float femaleUpperArm = anatomyBand(position.y, 0.08, 1.05, 0.22) *
          armZone;
        float femaleFatExpansion =
          femaleLowerAbdomen * 0.105 +
          femaleWaist * 0.085 +
          lowerBackFat * 0.07 +
          femaleHip * 0.15 +
          femaleGlute * 0.17 +
          femaleThigh * 0.135 +
          femaleChest * 0.095 +
          femaleUpperArm * 0.065 +
          calfFat * 0.025 +
          jawFat * 0.022;
        float fatExpansion = mix(
          maleFatExpansion,
          femaleFatExpansion,
          uFeminine
        );
        float muscleVisibility = mix(
          1.0,
          0.72,
          clamp(uFat * 0.75, 0.0, 1.0)
        );
        transformed += objectNormal * (
          expansion * uGrowth * muscleVisibility +
          fatExpansion * uFat
        );

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
          1.0 - clamp(uFat * 0.72, 0.0, 0.88)
        );
        float visibleStimulus = uStimulus * (
          1.0 - clamp(uFat * 0.55, 0.0, 0.75)
        );
        diffuseColor.rgb *= 1.0 - fiber * surfaceDefinition * 0.028;
        diffuseColor.rgb = mix(
          diffuseColor.rgb,
          uStimulusColor,
          muscleSurface * visibleStimulus * 0.022
        );`,
      );
  };

  material.customProgramCacheKey = () => "realistic-body-anatomy-v4";
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
  injectAnatomyShader(material, anatomy);
  return material;
}

export function RealisticBody({
  appearance,
  bodyType,
  anatomy,
}: RealisticBodyProps) {
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
    <group
      dispose={null}
      scale={[bodyType === "female" ? 0.985 : 1, 1, 1]}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload("/models/male-base.glb");

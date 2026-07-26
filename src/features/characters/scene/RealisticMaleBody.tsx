"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CharacterAppearance } from "../types";

export type MaleAnatomyUniforms = {
  uGrowth: { value: number };
  uDefinition: { value: number };
  uStimulus: { value: number };
  uWidth: { value: number };
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
  anatomy: MaleAnatomyUniforms;
};

function injectAnatomyShader(
  material: THREE.MeshPhysicalMaterial,
  anatomy: MaleAnatomyUniforms,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, anatomy);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uGrowth;
        uniform float uWidth;
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
        transformed += objectNormal * expansion * uGrowth;

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
        diffuseColor.rgb *= 1.0 - fiber * uDefinition * 0.028;
        diffuseColor.rgb = mix(
          diffuseColor.rgb,
          uStimulusColor,
          muscleSurface * uStimulus * 0.022
        );`,
      );
  };

  material.customProgramCacheKey = () => "realistic-male-anatomy-v2";
}

function createSkinMaterial(
  appearance: CharacterAppearance,
  anatomy: MaleAnatomyUniforms,
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

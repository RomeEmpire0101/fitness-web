"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CharacterAppearance } from "../types";
import { AnatomyUniforms } from "./RealisticMaleBody";

type RealisticFemaleBodyProps = {
  appearance: CharacterAppearance;
  anatomy: AnatomyUniforms;
};

function injectFemaleAnatomyShader(
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
        varying vec3 vFemaleAnatomyPosition;

        float femaleBand(float value, float low, float high, float fade) {
          return smoothstep(low, low + fade, value) *
            (1.0 - smoothstep(high - fade, high, value));
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float ax = abs(position.x);
        float front = smoothstep(0.018, 0.19, position.z);
        float rear = smoothstep(0.018, 0.19, -position.z);
        float torso = 1.0 - smoothstep(0.36, 0.69, ax);
        float arms = femaleBand(ax, 0.53, 1.15, 0.2);
        float legs = femaleBand(ax, 0.08, 0.66, 0.17);

        float chestMask = femaleBand(position.y, 0.47, 1.2, 0.22) *
          front * torso;
        float backMask = femaleBand(position.y, 0.35, 1.31, 0.28) *
          rear * (1.0 - smoothstep(0.7, 0.94, ax));
        float shoulderMask = femaleBand(position.y, 0.78, 1.45, 0.2) *
          femaleBand(ax, 0.36, 0.88, 0.18);
        float bicepsMask = femaleBand(position.y, 0.08, 1.05, 0.25) *
          arms * front;
        float tricepsMask = femaleBand(position.y, 0.08, 1.05, 0.25) *
          arms * rear;
        float coreMask = femaleBand(position.y, -0.3, 0.69, 0.24) *
          torso * front;
        float gluteMask = femaleBand(position.y, -0.78, 0.14, 0.28) *
          legs * rear;
        float quadMask = femaleBand(position.y, -1.47, -0.12, 0.3) *
          legs * front;
        float hamstringMask = femaleBand(position.y, -1.5, -0.12, 0.3) *
          legs * rear;
        float calfMask = femaleBand(position.y, -2.2, -1.04, 0.24) * legs;

        // Female-specific hypertrophy favors glutes and legs, with a softer
        // upper-body response and a narrower transition through the waist.
        float muscleExpansion =
          uChest * chestMask * 0.044 +
          uBack * backMask * 0.052 +
          uShoulders * shoulderMask * 0.043 +
          uBiceps * bicepsMask * 0.038 +
          uTriceps * tricepsMask * 0.038 +
          uCore * coreMask * 0.025 +
          uGlutes * gluteMask * 0.092 +
          uQuads * quadMask * 0.075 +
          uHamstrings * hamstringMask * 0.08 +
          uCalves * calfMask * 0.048;

        float trunkEnvelope = femaleBand(position.y, -0.72, 1.24, 0.46) *
          (1.0 - smoothstep(0.66, 0.93, ax));
        float hipEnvelope = femaleBand(position.y, -0.86, 0.08, 0.36) *
          (1.0 - smoothstep(0.76, 0.98, ax));
        float thighEnvelope = femaleBand(position.y, -1.62, -0.04, 0.42) *
          legs;
        float upperArmEnvelope = femaleBand(position.y, -0.05, 1.13, 0.36) *
          arms;
        float lowerAbdomen = femaleBand(position.y, -0.5, 0.3, 0.3) *
          front * (1.0 - smoothstep(0.62, 0.86, ax));
        float waistEnvelope = femaleBand(position.y, -0.34, 0.5, 0.34) *
          femaleBand(ax, 0.18, 0.68, 0.2);
        float gluteEnvelope = femaleBand(position.y, -0.8, 0.1, 0.32) *
          legs * rear;
        float chestEnvelope = femaleBand(position.y, 0.43, 1.2, 0.28) *
          front * torso;

        float fatExpansion =
          trunkEnvelope * 0.022 +
          hipEnvelope * 0.046 +
          thighEnvelope * 0.038 +
          upperArmEnvelope * 0.016 +
          lowerAbdomen * 0.052 +
          waistEnvelope * 0.025 +
          gluteEnvelope * 0.05 +
          chestEnvelope * 0.026;
        float muscleVisibility = mix(
          1.0,
          0.62,
          clamp(uFat * 0.76, 0.0, 1.0)
        );
        transformed += objectNormal * (
          muscleExpansion * uGrowth * 1.8 * muscleVisibility +
          fatExpansion * uFat
        );

        float hipScale = femaleBand(position.y, -0.9, 0.08, 0.38) *
          (1.0 - smoothstep(0.78, 1.0, ax));
        float thighScale = femaleBand(position.y, -1.6, -0.04, 0.42) * legs;
        float torsoScale = femaleBand(position.y, -0.66, 0.72, 0.44) *
          (1.0 - smoothstep(0.72, 0.96, ax));
        transformed.x *= 1.0 + uFat * (
          hipScale * 0.042 +
          thighScale * 0.025 +
          torsoScale * 0.035
        );
        transformed.z *= 1.0 + uFat * (
          hipScale * 0.04 +
          thighScale * 0.02 +
          torsoScale * 0.085
        );

        float bodyWidthMask = 1.0 - smoothstep(1.5, 1.94, position.y);
        float extremityMask =
          smoothstep(-2.38, -2.08, position.y) *
          (1.0 - smoothstep(1.5, 1.91, position.y));
        float widthBlend = bodyWidthMask * mix(0.5, 1.0, extremityMask);
        transformed.x *= mix(1.0, uWidth, widthBlend);
        transformed.z *= mix(1.0, uWidth, widthBlend * 0.66);
        vFemaleAnatomyPosition = transformed;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uDefinition;
        uniform float uStimulus;
        uniform float uFat;
        uniform vec3 uStimulusColor;
        varying vec3 vFemaleAnatomyPosition;

        float femaleBand(float value, float low, float high, float fade) {
          return smoothstep(low, low + fade, value) *
            (1.0 - smoothstep(high - fade, high, value));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float anatomyX = abs(vFemaleAnatomyPosition.x);
        float anatomyFront = smoothstep(
          0.02,
          0.18,
          vFemaleAnatomyPosition.z
        );
        float anatomyRear = smoothstep(
          0.02,
          0.18,
          -vFemaleAnatomyPosition.z
        );
        float torsoCenter = 1.0 - smoothstep(0.38, 0.69, anatomyX);
        float anatomyArms = femaleBand(anatomyX, 0.52, 1.14, 0.2);
        float anatomyLegs = femaleBand(anatomyX, 0.08, 0.66, 0.17);
        float chestArea = femaleBand(
          vFemaleAnatomyPosition.y,
          0.47,
          1.2,
          0.22
        ) * anatomyFront * torsoCenter;
        float backArea = femaleBand(
          vFemaleAnatomyPosition.y,
          0.35,
          1.31,
          0.26
        ) * anatomyRear;
        float armArea = femaleBand(
          vFemaleAnatomyPosition.y,
          0.08,
          1.08,
          0.24
        ) * anatomyArms;
        float coreArea = femaleBand(
          vFemaleAnatomyPosition.y,
          -0.3,
          0.69,
          0.23
        ) * anatomyFront * torsoCenter;
        float thighArea = femaleBand(
          vFemaleAnatomyPosition.y,
          -1.48,
          -0.1,
          0.28
        ) * anatomyLegs;
        float calfArea = femaleBand(
          vFemaleAnatomyPosition.y,
          -2.2,
          -1.04,
          0.23
        ) * anatomyLegs;

        float longFibers = 0.5 + 0.5 * sin(
          vFemaleAnatomyPosition.y * 108.0 +
          vFemaleAnatomyPosition.x * 12.0
        );
        float diagonalFibers = 0.5 + 0.5 * sin(
          (vFemaleAnatomyPosition.y + anatomyX * 0.38) * 96.0
        );
        float fiber =
          pow(diagonalFibers, 15.0) * (chestArea + backArea) +
          pow(longFibers, 16.0) *
            (armArea + coreArea * 0.58 + thighArea + calfArea);
        float muscleSurface = clamp(
          chestArea + backArea + armArea + coreArea + thighArea + calfArea,
          0.0,
          1.0
        );
        float surfaceDefinition = uDefinition * (
          1.0 - clamp(uFat * 0.84, 0.0, 0.94)
        );
        float visibleStimulus = uStimulus * (
          1.0 - clamp(uFat * 0.68, 0.0, 0.84)
        );
        diffuseColor.rgb *= 1.0 - fiber * surfaceDefinition * 0.021;
        diffuseColor.rgb = mix(
          diffuseColor.rgb,
          uStimulusColor,
          muscleSurface * visibleStimulus * 0.014
        );`,
      );
  };

  material.customProgramCacheKey = () => "realistic-female-anatomy-v1";
}

function createFemaleSkinMaterial(
  appearance: CharacterAppearance,
  anatomy: AnatomyUniforms,
) {
  const base = new THREE.Color(appearance.bodyColor);
  const material = new THREE.MeshPhysicalMaterial({
    color: base,
    roughness: 0.72,
    metalness: 0,
    clearcoat: 0.018,
    clearcoatRoughness: 0.9,
    sheen: 0.16,
    sheenColor: base.clone().lerp(new THREE.Color("#ffd7c5"), 0.28),
    sheenRoughness: 0.84,
    envMapIntensity: 0.7,
  });
  material.name = "female-skin";
  injectFemaleAnatomyShader(material, anatomy);
  return material;
}

function FemaleHair({ color }: { color: string }) {
  return (
    <group>
      <mesh
        position={[0, 2.08, -0.025]}
        scale={[0.43, 0.4, 0.42]}
        castShadow
      >
        <sphereGeometry
          args={[1, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.48]}
        />
        <meshPhysicalMaterial
          color={color}
          roughness={0.86}
          clearcoat={0.04}
          clearcoatRoughness={0.78}
        />
      </mesh>

      <mesh
        position={[0, 1.77, -0.31]}
        scale={[0.39, 0.72, 0.16]}
        castShadow
      >
        <sphereGeometry args={[1, 28, 20]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.88}
          clearcoat={0.035}
          clearcoatRoughness={0.8}
        />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          position={[side * 0.36, 1.89, -0.055]}
          scale={[0.135, 0.55, 0.17]}
          rotation={[0, 0, side * -0.055]}
          castShadow
        >
          <sphereGeometry args={[1, 20, 16]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.87}
            clearcoat={0.035}
            clearcoatRoughness={0.8}
          />
        </mesh>
      ))}

      {([-1, 1] as const).map((side) => (
        <mesh
          key={`fringe-${side}`}
          position={[side * 0.14, 2.2, 0.33]}
          scale={[0.19, 0.075, 0.055]}
          rotation={[0.08, side * 0.08, side * 0.2]}
          castShadow
        >
          <sphereGeometry args={[1, 18, 12]} />
          <meshPhysicalMaterial color={color} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

export function RealisticFemaleBody({
  appearance,
  anatomy,
}: RealisticFemaleBodyProps) {
  const { scene } = useGLTF("/models/female-base.glb");
  const skinMaterial = useMemo(
    () => createFemaleSkinMaterial(appearance, anatomy),
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
      <FemaleHair color={appearance.hairColor} />
    </group>
  );
}

useGLTF.preload("/models/female-base.glb");

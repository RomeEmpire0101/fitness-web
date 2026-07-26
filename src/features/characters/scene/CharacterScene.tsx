"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { deriveCharacterMorphology } from "../morphology";
import {
  CharacterProfile,
  CharacterVisualization,
} from "../types";
import { RegisteredCharacterModel } from "./characterRegistry";
import { SceneLighting } from "./SceneLighting";

export type CharacterSceneProps = CharacterVisualization & {
  profile: CharacterProfile;
  compact?: boolean;
  interactive?: boolean;
};

function AdaptiveCamera({
  profile,
  compact,
}: {
  profile: CharacterProfile;
  compact: boolean;
}) {
  const morphology = useMemo(
    () => deriveCharacterMorphology(profile.measurements),
    [profile.measurements],
  );

  useFrame(({ camera }, delta) => {
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      morphology.cameraDistance + (compact ? 0.7 : 0),
      5,
      delta,
    );
  });

  return null;
}

export default function CharacterScene(props: CharacterSceneProps) {
  const compact = props.compact ?? false;
  const interactive = props.interactive ?? true;

  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{
        position: [0, compact ? 0.16 : 0.13, compact ? 10.8 : 10.3],
        fov: compact ? 34 : 32,
      }}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      fallback={
        <div className="webgl-fallback">
          Interactive 3D preview is unavailable in this browser.
        </div>
      }
    >
      <AdaptiveCamera profile={props.profile} compact={compact} />
      <SceneLighting />
      <RegisteredCharacterModel {...props} />
      <ContactShadows
        position={[0, -2.48, 0]}
        scale={5.2}
        opacity={0.32}
        blur={2.4}
        far={4}
        color="#000000"
      />
      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.22}
          maxPolarAngle={Math.PI / 2 + 0.22}
          rotateSpeed={0.46}
          dampingFactor={0.06}
          enableDamping
          target={[0, 0.05, 0]}
        />
      )}
    </Canvas>
  );
}

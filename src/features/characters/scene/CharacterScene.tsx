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
};

function AdaptiveCamera({ profile }: { profile: CharacterProfile }) {
  const morphology = useMemo(
    () => deriveCharacterMorphology(profile.measurements),
    [profile.measurements],
  );

  useFrame(({ camera }, delta) => {
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      morphology.cameraDistance,
      5,
      delta,
    );
  });

  return null;
}

export default function CharacterScene(props: CharacterSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.13, 9.25], fov: 32 }}
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
      <AdaptiveCamera profile={props.profile} />
      <SceneLighting />
      <RegisteredCharacterModel {...props} />
      <ContactShadows
        position={[0, -2.3, 0]}
        scale={5.2}
        opacity={0.38}
        blur={2.8}
        far={4}
        color="#000000"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2 - 0.16}
        maxPolarAngle={Math.PI / 2 + 0.16}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
        rotateSpeed={0.38}
        dampingFactor={0.06}
        enableDamping
        target={[0, 0.05, 0]}
      />
    </Canvas>
  );
}

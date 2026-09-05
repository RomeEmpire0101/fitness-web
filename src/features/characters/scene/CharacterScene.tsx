"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { deriveCharacterMorphology } from "../morphology";
import { CharacterModelProps } from "./CharacterModel";
import { RegisteredCharacterModel } from "./characterRegistry";
import { SceneLighting } from "./SceneLighting";

export type CharacterSceneProps = CharacterModelProps & {
  compact?: boolean;
  interactive?: boolean;
};

export default function CharacterScene(props: CharacterSceneProps) {
  const { compact = false, interactive = true, ...modelProps } = props;
  const morphology = useMemo(
    () => deriveCharacterMorphology(props.profile.measurements),
    [props.profile.measurements],
  );
  const cameraDistance =
    morphology.cameraDistance + (compact ? 0.7 : 0);
  const camera = useMemo(
    () => ({
      position: [0, compact ? 0.16 : 0.13, cameraDistance] as [
        number,
        number,
        number,
      ],
      fov: compact ? 34 : 32,
    }),
    [cameraDistance, compact],
  );

  return (
    <Canvas
      aria-label={
        interactive
          ? "Interactive 3D physique. Drag to rotate all the way around the character, scroll to zoom, click a muscle to edit its dose."
          : "3D physique preview"
      }
      role="img"
      dpr={[1, 1.75]}
      camera={camera}
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
      <SceneLighting />
      <RegisteredCharacterModel {...modelProps} />
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
          enableZoom
          minDistance={cameraDistance * 0.62}
          maxDistance={cameraDistance * 1.65}
          minPolarAngle={Math.PI / 2 - 0.22}
          maxPolarAngle={Math.PI / 2 + 0.22}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          rotateSpeed={0.58}
          zoomSpeed={0.72}
          zoomToCursor
          dampingFactor={0.06}
          enableDamping
          target={[0, 0.05, 0]}
        />
      )}
    </Canvas>
  );
}

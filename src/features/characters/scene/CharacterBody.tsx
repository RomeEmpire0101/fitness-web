/* eslint-disable react-hooks/refs -- R3F rig refs are forwarded as JSX ref targets; their current values are never read while rendering. */
import * as THREE from "three";
import { CharacterAppearance } from "../types";
import { CharacterRig } from "./rig";

type CharacterBodyProps = {
  appearance: CharacterAppearance;
  rig: CharacterRig;
};

function BodyMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.31}
      metalness={0.2}
      clearcoat={0.7}
      clearcoatRoughness={0.28}
      envMapIntensity={0.8}
    />
  );
}

function ShadowMaterial() {
  return (
    <meshStandardMaterial
      color="#101512"
      roughness={0.55}
      metalness={0.12}
    />
  );
}

export function CharacterBody({ appearance, rig }: CharacterBodyProps) {
  const bodyColor = new THREE.Color(appearance.bodyColor);

  return (
    <group ref={rig.bodyScale}>
      <group ref={rig.breath}>
        <mesh
          position={[0, 2.07, 0.01]}
          scale={[0.285, 0.365, 0.292]}
          castShadow
        >
          <sphereGeometry args={[1, 40, 40]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>
        <mesh position={[0, 1.745, 0]} scale={[0.19, 0.24, 0.2]} castShadow>
          <cylinderGeometry args={[0.86, 1, 1.6, 32]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>

        <mesh
          ref={rig.upperChest}
          position={[0, 1.38, 0]}
          scale={[0.78, 0.46, 0.36]}
          castShadow
        >
          <sphereGeometry args={[1, 48, 36]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>
        <mesh
          ref={rig.chest}
          position={[0, 1.01, 0]}
          scale={[0.73, 0.73, 0.36]}
          castShadow
        >
          <sphereGeometry args={[1, 48, 36]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>
        <mesh ref={rig.waist} position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.43, 0.5, 0.82, 40]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>
        <mesh position={[0, 0.19, 0]} scale={[0.55, 0.35, 0.33]} castShadow>
          <sphereGeometry args={[1, 40, 32]} />
          <ShadowMaterial />
        </mesh>

        <mesh
          ref={rig.leftShoulder}
          position={[-0.755, 1.39, 0]}
          scale={0.28}
          castShadow
        >
          <sphereGeometry args={[1, 36, 30]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>
        <mesh
          ref={rig.rightShoulder}
          position={[0.755, 1.39, 0]}
          scale={0.28}
          castShadow
        >
          <sphereGeometry args={[1, 36, 30]} />
          <BodyMaterial color={bodyColor.getStyle()} />
        </mesh>

        <group
          ref={rig.leftArm}
          position={[-0.755, 1.31, 0]}
          rotation={[0, 0, -0.075]}
        >
          <mesh
            ref={rig.leftUpperArm}
            position={[-0.035, -0.39, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.19, 0.48, 12, 28]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh position={[-0.075, -0.78, 0]} scale={0.17} castShadow>
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            ref={rig.leftForearm}
            position={[-0.11, -1.09, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.15, 0.43, 12, 28]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            position={[-0.15, -1.48, 0.035]}
            scale={[0.16, 0.24, 0.12]}
            castShadow
          >
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
        </group>

        <group
          ref={rig.rightArm}
          position={[0.755, 1.31, 0]}
          rotation={[0, 0, 0.075]}
        >
          <mesh
            ref={rig.rightUpperArm}
            position={[0.035, -0.39, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.19, 0.48, 12, 28]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh position={[0.075, -0.78, 0]} scale={0.17} castShadow>
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            ref={rig.rightForearm}
            position={[0.11, -1.09, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.15, 0.43, 12, 28]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            position={[0.15, -1.48, 0.035]}
            scale={[0.16, 0.24, 0.12]}
            castShadow
          >
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
        </group>

        <group position={[-0.285, -0.17, 0]}>
          <mesh ref={rig.leftThigh} position={[0, -0.55, 0]} castShadow>
            <capsuleGeometry args={[0.255, 0.68, 14, 30]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh position={[0, -1.14, 0]} scale={0.2} castShadow>
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            ref={rig.leftCalf}
            position={[0, -1.62, 0.015]}
            castShadow
          >
            <capsuleGeometry args={[0.19, 0.57, 14, 30]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            position={[0, -2.09, 0.11]}
            scale={[0.2, 0.15, 0.39]}
            castShadow
          >
            <sphereGeometry args={[1, 30, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
        </group>

        <group position={[0.285, -0.17, 0]}>
          <mesh ref={rig.rightThigh} position={[0, -0.55, 0]} castShadow>
            <capsuleGeometry args={[0.255, 0.68, 14, 30]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh position={[0, -1.14, 0]} scale={0.2} castShadow>
            <sphereGeometry args={[1, 28, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            ref={rig.rightCalf}
            position={[0, -1.62, 0.015]}
            castShadow
          >
            <capsuleGeometry args={[0.19, 0.57, 14, 30]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
          <mesh
            position={[0, -2.09, 0.11]}
            scale={[0.2, 0.15, 0.39]}
            castShadow
          >
            <sphereGeometry args={[1, 30, 24]} />
            <BodyMaterial color={bodyColor.getStyle()} />
          </mesh>
        </group>

        <mesh
          position={[0, 1.17, 0.347]}
          scale={[0.025, 0.58, 0.018]}
        >
          <capsuleGeometry args={[0.55, 0.7, 8, 16]} />
          <meshStandardMaterial
            ref={rig.contourMaterial}
            color={appearance.accentColor}
            emissive={appearance.accentColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[-0.27, 1.39, 0.342]}
          rotation={[0, 0, -0.77]}
          scale={[0.018, 0.29, 0.014]}
        >
          <capsuleGeometry args={[0.55, 0.7, 8, 16]} />
          <meshBasicMaterial
            color="#f7fafc"
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0.27, 1.39, 0.342]}
          rotation={[0, 0, 0.77]}
          scale={[0.018, 0.29, 0.014]}
        >
          <capsuleGeometry args={[0.55, 0.7, 8, 16]} />
          <meshBasicMaterial
            color="#f7fafc"
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

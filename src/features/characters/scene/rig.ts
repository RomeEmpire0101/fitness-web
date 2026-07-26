import { RefObject } from "react";
import * as THREE from "three";

export type CharacterRig = {
  bodyScale: RefObject<THREE.Group | null>;
  breath: RefObject<THREE.Group | null>;
  chest: RefObject<THREE.Mesh | null>;
  upperChest: RefObject<THREE.Mesh | null>;
  waist: RefObject<THREE.Mesh | null>;
  leftShoulder: RefObject<THREE.Mesh | null>;
  rightShoulder: RefObject<THREE.Mesh | null>;
  leftArm: RefObject<THREE.Group | null>;
  rightArm: RefObject<THREE.Group | null>;
  leftUpperArm: RefObject<THREE.Mesh | null>;
  rightUpperArm: RefObject<THREE.Mesh | null>;
  leftForearm: RefObject<THREE.Mesh | null>;
  rightForearm: RefObject<THREE.Mesh | null>;
  leftThigh: RefObject<THREE.Mesh | null>;
  rightThigh: RefObject<THREE.Mesh | null>;
  leftCalf: RefObject<THREE.Mesh | null>;
  rightCalf: RefObject<THREE.Mesh | null>;
  contourMaterial: RefObject<THREE.MeshStandardMaterial | null>;
};


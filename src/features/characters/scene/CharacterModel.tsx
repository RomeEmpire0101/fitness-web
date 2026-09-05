"use client";

/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps -- R3F useFrame intentionally updates stable Three.js shader uniform objects outside React render. */
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MuscleGroupId } from "@/lib/simulation";
import { deriveCharacterMorphology } from "../morphology";
import {
  CharacterProfile,
  CharacterVisualization,
} from "../types";
import {
  classifyMusclePoint,
  createAnchorFrame,
  MUSCLE_ANCHOR_IDS,
  MUSCLE_ANCHORS,
  MuscleAnchorFrame,
} from "./muscleRegions";
import {
  AnatomyUniforms,
  RealisticMaleBody,
} from "./RealisticMaleBody";
import { RealisticFemaleBody } from "./RealisticFemaleBody";

export type CharacterModelProps = CharacterVisualization & {
  profile: CharacterProfile;
  /** Fires when the viewer clicks a muscle region on the body. */
  onMusclePick?: (id: MuscleGroupId) => void;
  /** Fires every frame with the screen position of each muscle anchor. */
  onMuscleAnchors?: (frame: MuscleAnchorFrame) => void;
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
  baselineMuscularity = 0.25,
  muscleSignals,
  reducedMotion,
  onMusclePick,
  onMuscleAnchors,
}: CharacterModelProps) {
  const root = useRef<THREE.Group>(null);
  const bodyScale = useRef<THREE.Group>(null);
  const breath = useRef<THREE.Group>(null);
  const bodyMesh = useRef<THREE.Mesh | null>(null);
  const { camera, size } = useThree();

  const morphology = useMemo(
    () => deriveCharacterMorphology(profile.measurements),
    [profile.measurements],
  );
  // Shader uniforms must retain object identity for the compiled WebGL program.
  const anatomy = useMemo<AnatomyUniforms>(
    () => ({
      uGrowth: { value: growth },
      uDefinition: { value: definition },
      uStimulus: { value: stimulus },
      uWidth: { value: morphology.widthScale },
      uFat: { value: morphology.fatLevel },
      uBaselineMuscularity: { value: baselineMuscularity },
      uFeminine: { value: profile.bodyType === "female" ? 1 : 0 },
      uChest: { value: muscleSignals?.chest ?? 0 },
      uBack: { value: muscleSignals?.back ?? 0 },
      uShoulders: { value: muscleSignals?.shoulders ?? 0 },
      uBiceps: { value: muscleSignals?.biceps ?? 0 },
      uTriceps: { value: muscleSignals?.triceps ?? 0 },
      uForearms: { value: muscleSignals?.forearms ?? 0 },
      uCore: { value: muscleSignals?.core ?? 0 },
      uQuads: { value: muscleSignals?.quads ?? 0 },
      uHamstrings: { value: muscleSignals?.hamstrings ?? 0 },
      uGlutes: { value: muscleSignals?.glutes ?? 0 },
      uCalves: { value: muscleSignals?.calves ?? 0 },
      uStimulusColor: { value: new THREE.Color("#b85b48") },
    }),
    [],
  );
  const currentGrowth = useRef(growth);
  const currentDefinition = useRef(definition);
  const currentStimulus = useRef(stimulus);
  const currentHeight = useRef(morphology.heightScale);
  const currentWidth = useRef(morphology.widthScale);
  const currentFat = useRef(morphology.fatLevel);
  const currentBaselineMuscularity = useRef(baselineMuscularity);
  const currentFeminine = useRef(profile.bodyType === "female" ? 1 : 0);

  // Reused scratch objects so anchor projection allocates nothing per frame.
  const anchorFrame = useMemo(() => createAnchorFrame(), []);
  const anchorWorld = useMemo(() => new THREE.Vector3(), []);
  const anchorView = useMemo(() => new THREE.Vector3(), []);
  const centerView = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    // The body mesh is swapped when the body type changes.
    bodyMesh.current = null;
  }, [profile.bodyType]);

  const findBodyMesh = () => {
    if (bodyMesh.current) return bodyMesh.current;
    let found: THREE.Mesh | null = null;
    root.current?.traverse((object) => {
      if (!found && object instanceof THREE.Mesh) found = object;
    });
    bodyMesh.current = found;
    return found;
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!onMusclePick) return;
    const mesh = event.object;
    if (!(mesh instanceof THREE.Mesh)) return;
    event.stopPropagation();
    const local = mesh.worldToLocal(event.point.clone());
    const picked = classifyMusclePoint(local.x, local.y, local.z);
    if (picked) onMusclePick(picked);
  };

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
    const fat = damp(
      currentFat.current,
      morphology.fatLevel,
      4.6,
      delta,
    );
    const baseMuscle = damp(
      currentBaselineMuscularity.current,
      baselineMuscularity,
      4.8,
      delta,
    );
    const feminine = damp(
      currentFeminine.current,
      profile.bodyType === "female" ? 1 : 0,
      5.2,
      delta,
    );
    currentGrowth.current = g;
    currentDefinition.current = d;
    currentStimulus.current = s;
    currentHeight.current = height;
    currentWidth.current = width;
    currentFat.current = fat;
    currentBaselineMuscularity.current = baseMuscle;
    currentFeminine.current = feminine;

    const elapsed = clock.getElapsedTime();
    const inhale = reducedMotion ? 0 : Math.sin(elapsed * 1.68) * 0.5 + 0.5;
    const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.32);
    const groundOffset = (height - 1) * 2.49;

    if (root.current) {
      root.current.rotation.y = sway * 0.04;
      root.current.rotation.z = sway * 0.0025;
      root.current.position.y =
        groundOffset +
        (reducedMotion ? 0 : Math.sin(elapsed * 1.68) * 0.005);
    }
    // Stature must scale the whole body uniformly. Scaling only the vertical
    // axis makes shorter profiles unnaturally squat and amplifies every
    // regional muscle deformation relative to their height.
    bodyScale.current?.scale.set(height, height, height);
    if (breath.current) {
      breath.current.scale.x = 1 + inhale * 0.0015;
      breath.current.scale.z = 1 + inhale * 0.006;
    }
    const signal = (id: keyof NonNullable<typeof muscleSignals>) =>
      muscleSignals?.[id] ?? 0;
    anatomy.uGrowth.value = g;
    anatomy.uDefinition.value = d;
    anatomy.uStimulus.value = s;
    anatomy.uWidth.value = width;
    anatomy.uFat.value = fat;
    anatomy.uBaselineMuscularity.value = baseMuscle;
    anatomy.uFeminine.value = feminine;
    anatomy.uChest.value = damp(anatomy.uChest.value, signal("chest"), 5, delta);
    anatomy.uBack.value = damp(anatomy.uBack.value, signal("back"), 5, delta);
    anatomy.uShoulders.value = damp(
      anatomy.uShoulders.value,
      signal("shoulders"),
      5,
      delta,
    );
    anatomy.uBiceps.value = damp(
      anatomy.uBiceps.value,
      signal("biceps"),
      5,
      delta,
    );
    anatomy.uTriceps.value = damp(
      anatomy.uTriceps.value,
      signal("triceps"),
      5,
      delta,
    );
    anatomy.uForearms.value = damp(
      anatomy.uForearms.value,
      signal("forearms"),
      5,
      delta,
    );
    anatomy.uCore.value = damp(anatomy.uCore.value, signal("core"), 5, delta);
    anatomy.uQuads.value = damp(anatomy.uQuads.value, signal("quads"), 5, delta);
    anatomy.uHamstrings.value = damp(
      anatomy.uHamstrings.value,
      signal("hamstrings"),
      5,
      delta,
    );
    anatomy.uGlutes.value = damp(
      anatomy.uGlutes.value,
      signal("glutes"),
      5,
      delta,
    );
    anatomy.uCalves.value = damp(
      anatomy.uCalves.value,
      signal("calves"),
      5,
      delta,
    );

    if (!onMuscleAnchors) return;
    const mesh = findBodyMesh();
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    centerView.set(0, 0, 0).applyMatrix4(mesh.matrixWorld);
    centerView.applyMatrix4(camera.matrixWorldInverse);
    MUSCLE_ANCHOR_IDS.forEach((id) => {
      const [x, y, z] = MUSCLE_ANCHORS[id];
      anchorWorld.set(x, y, z).applyMatrix4(mesh.matrixWorld);
      anchorView.copy(anchorWorld).applyMatrix4(camera.matrixWorldInverse);
      anchorWorld.project(camera);
      const target = anchorFrame[id];
      target.x = ((anchorWorld.x + 1) / 2) * size.width;
      target.y = ((1 - anchorWorld.y) / 2) * size.height;
      // View space looks down -z, so a smaller z is farther from the camera.
      target.behind = anchorView.z < centerView.z - 0.04;
    });
    onMuscleAnchors(anchorFrame);
  });

  return (
    <group ref={root} onClick={handleClick}>
      <group ref={bodyScale}>
        <group ref={breath}>
          {profile.bodyType === "female" ? (
            <RealisticFemaleBody
              key="female"
              appearance={profile.appearance}
              anatomy={anatomy}
            />
          ) : (
            <RealisticMaleBody
              key="male"
              appearance={profile.appearance}
              anatomy={anatomy}
            />
          )}
        </group>
      </group>
    </group>
  );
}

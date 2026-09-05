import type { MuscleGroupId } from "@/lib/simulation";

export type MuscleAnchorScreen = {
  /** CSS pixels from the left edge of the canvas. */
  x: number;
  /** CSS pixels from the top edge of the canvas. */
  y: number;
  /** True when the anchor faces away from the camera (behind the body). */
  behind: boolean;
};

export type MuscleAnchorFrame = Record<MuscleGroupId, MuscleAnchorScreen>;

/**
 * Mesh-local anchor points for each muscle group. The coordinates sit inside
 * the same regional bands the anatomy vertex shader uses, so a label anchored
 * here points at the region that actually deforms.
 */
export const MUSCLE_ANCHORS: Record<
  MuscleGroupId,
  readonly [number, number, number]
> = {
  shoulders: [-0.76, 1.22, 0.06],
  chest: [-0.3, 0.94, 0.3],
  biceps: [-0.92, 0.74, 0.16],
  forearms: [-0.98, 0.06, 0.06],
  quads: [-0.36, -0.86, 0.28],
  calves: [-0.34, -1.64, -0.12],
  back: [0.32, 1.1, -0.3],
  triceps: [0.92, 0.72, -0.16],
  core: [0.14, 0.26, 0.32],
  glutes: [0.32, -0.34, -0.28],
  hamstrings: [0.36, -0.86, -0.28],
};

export const MUSCLE_ANCHOR_IDS = Object.keys(
  MUSCLE_ANCHORS,
) as MuscleGroupId[];

export function createAnchorFrame(): MuscleAnchorFrame {
  return Object.fromEntries(
    MUSCLE_ANCHOR_IDS.map((id) => [id, { x: 0, y: 0, behind: false }]),
  ) as MuscleAnchorFrame;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const band = (value: number, low: number, high: number, fade: number) =>
  smoothstep(low, low + fade, value) *
  (1 - smoothstep(high - fade, high, value));

/**
 * Classifies a mesh-local point into the muscle region with the strongest
 * influence there. This mirrors the regional masks in the anatomy shader so a
 * click on the body selects the region the projection deforms.
 */
export function classifyMusclePoint(
  x: number,
  y: number,
  z: number,
): MuscleGroupId | null {
  const ax = Math.abs(x);
  const front = smoothstep(0.015, 0.2, z);
  const rear = smoothstep(0.015, 0.2, -z);
  const rearBias = 0.16 + rear * 0.84;
  const centerTorso = 1 - smoothstep(0.38, 0.72, ax);
  const armZone = band(ax, 0.58, 1.22, 0.2);
  const upperArmZone = band(ax, 0.62, 1.16, 0.18);
  const legZone = band(ax, 0.055, 0.72, 0.17);
  const hipZone = 1 - smoothstep(0.72, 0.94, ax);

  const upperBack =
    band(y, 0.64, 1.58, 0.22) * rearBias * (1 - smoothstep(0.7, 0.84, ax));
  const lats =
    band(y, 0.2, 1.2, 0.28) * band(ax, 0.2, 0.72, 0.18) * (0.3 + rear * 0.7);

  const masks: Record<MuscleGroupId, number> = {
    chest: band(y, 0.52, 1.3, 0.2) * front * centerTorso,
    back: Math.max(upperBack, lats),
    shoulders: band(y, 0.82, 1.5, 0.18) * band(ax, 0.42, 0.98, 0.18),
    biceps: band(y, 0.32, 1.14, 0.22) * upperArmZone * front,
    triceps: band(y, 0.3, 1.14, 0.22) * upperArmZone * rear,
    forearms: band(y, -0.48, 0.44, 0.2) * armZone,
    core: band(y, -0.25, 0.75, 0.2) * centerTorso * front,
    glutes: band(y, -0.78, 0.18, 0.26) * hipZone * (0.18 + rear * 0.82),
    quads: band(y, -1.58, -0.08, 0.3) * legZone * (0.3 + front * 0.7),
    hamstrings: band(y, -1.58, -0.08, 0.3) * legZone * (0.3 + rear * 0.7),
    calves: band(y, -2.24, -0.98, 0.24) * legZone,
  };

  let best: MuscleGroupId | null = null;
  let bestValue = 0.08;
  (Object.keys(masks) as MuscleGroupId[]).forEach((id) => {
    if (masks[id] > bestValue) {
      bestValue = masks[id];
      best = id;
    }
  });
  return best;
}

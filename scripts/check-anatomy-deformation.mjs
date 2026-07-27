import assert from "node:assert/strict";
import fs from "node:fs/promises";

const root = new URL("../", import.meta.url);
const limitsPath = new URL(
  "src/features/characters/scene/anatomyLimits.json",
  root,
);
const limits = JSON.parse(await fs.readFile(limitsPath, "utf8"));

const hardCaps = {
  maxNormalDisplacement: 0.09,
  maxTotalNormalDisplacement: 0.14,
  maxLateralScale: 0.06,
  maxDepthScale: 0.06,
};

const bodies = [
  {
    id: "male",
    constant: "MALE_ANATOMY_LIMITS",
    source: "src/features/characters/scene/RealisticMaleBody.tsx",
  },
  {
    id: "female",
    constant: "FEMALE_ANATOMY_LIMITS",
    source: "src/features/characters/scene/RealisticFemaleBody.tsx",
  },
];

for (const body of bodies) {
  const bodyLimits = limits[body.id];
  assert(bodyLimits, `Missing deformation limits for ${body.id}`);

  for (const [name, hardCap] of Object.entries(hardCaps)) {
    const value = bodyLimits[name];
    assert(
      Number.isFinite(value) && value > 0 && value <= hardCap,
      `${body.id}.${name} must stay between 0 and ${hardCap}`,
    );
  }

  const source = await fs.readFile(new URL(body.source, root), "utf8");
  const requiredGuards = [
    "float anatomySignal(float value)",
    "uniform float uForearms;",
    "uniform float uBaselineMuscularity;",
    "attribute vec3 aNeutralPosition;",
    "attribute vec3 aNeutralNormal;",
    "float forearmMask",
    "float regionalSignal = max(",
    "float striationVisibility",
    "float upperExpansion = max(",
    "float lowerExpansion = max(",
    "float muscleDisplacement = clamp(",
    "float totalNormalDisplacement = clamp(",
    "float lateralGrowth = clamp(",
    "float depthGrowth = clamp(",
    "float baselineSoftening =",
    "float baselineNeutralization =",
    "float neutralNormalBlend =",
    `${body.constant}.maxNormalDisplacement`,
    `${body.constant}.maxTotalNormalDisplacement`,
    `${body.constant}.maxLateralScale`,
    `${body.constant}.maxDepthScale`,
  ];

  for (const guard of requiredGuards) {
    assert(
      source.includes(guard),
      `${body.source} is missing the deformation guard: ${guard}`,
    );
  }
}

const maleSource = await fs.readFile(
  new URL("src/features/characters/scene/RealisticMaleBody.tsx", root),
  "utf8",
);
const femaleSource = await fs.readFile(
  new URL("src/features/characters/scene/RealisticFemaleBody.tsx", root),
  "utf8",
);
for (const source of [maleSource, femaleSource]) {
  assert(
    !source.includes("anatomySignal(uGrowth) * muscleVisibility"),
    "Regional physical signals must not be multiplied by global growth again.",
  );
  assert(
    source.includes("value / 0.06"),
    "Fragment shading must normalize physical radial growth separately.",
  );
}
assert(
  maleSource.includes("chestMask * 0.373"),
  "Male mesh must retain measured regional-radius calibration.",
);
assert(
  femaleSource.includes("chestMask * 0.354"),
  "Female mesh must retain measured regional-radius calibration.",
);

const neutralMeshSource = await fs.readFile(
  new URL("src/features/characters/scene/neutralMesh.ts", root),
  "utf8",
);
assert(
  neutralMeshSource.includes("new Uint32Array(vertexCount)") &&
    neutralMeshSource.includes("computeVertexNormals()"),
  "Baseline neutralization must smooth both geometry and surface normals.",
);

const characterModel = await fs.readFile(
  new URL(
    "src/features/characters/scene/CharacterModel.tsx",
    root,
  ),
  "utf8",
);
assert(
  characterModel.includes(".scale.set(height, height, height)"),
  "Character height must scale all axes uniformly",
);
assert(
  !characterModel.includes(".scale.set(1, height, 1)"),
  "Vertical-only character scaling can create distorted short profiles",
);
assert(
  characterModel.includes("anatomy.uForearms.value = damp("),
  "Forearm growth must be animated with the other regional signals",
);
assert(
  characterModel.includes("anatomy.uBaselineMuscularity.value = baseMuscle"),
  "The athletic source mesh must be neutralized by baseline muscularity.",
);

const simulation = await fs.readFile(
  new URL("src/lib/simulation.ts", root),
  "utf8",
);
assert(
  !simulation.includes("TARGET_SYNERGIES[target][muscle.id] ?? 0.06"),
  "Non-synergist muscles must not receive phantom growth",
);
assert(
  simulation.includes("Math.cbrt(1 + meanPercent / 100) - 1"),
  "Mesh growth must convert measured MRI volume change to linear deformation.",
);
assert(
  !simulation.includes("TARGET_SYNERGIES"),
  "Arbitrary target-synergy multipliers must not return.",
);

console.log("Anatomy deformation safety checks passed.");

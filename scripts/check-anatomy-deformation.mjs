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
    "float upperExpansion = max(",
    "float lowerExpansion = max(",
    "float muscleDisplacement = clamp(",
    "float totalNormalDisplacement = clamp(",
    "float lateralGrowth = clamp(",
    "float depthGrowth = clamp(",
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

console.log("Anatomy deformation safety checks passed.");

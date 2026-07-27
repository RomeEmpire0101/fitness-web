"use client";
import { CharacterMorphology } from "../morphology";
import { CharacterProfile } from "../types";

type CharacterLayersProps = {
  profile: CharacterProfile;
  morphology: CharacterMorphology;
};

const CLOTH_ROUGHNESS = 0.88;

function ClothMaterial({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={CLOTH_ROUGHNESS}
      metalness={0}
    />
  );
}

function Hair({
  profile,
}: {
  profile: CharacterProfile;
}) {
  const { hairStyle, hairColor } = profile.appearance;
  const hatOn = profile.wardrobe.headwear !== "none";
  const crownScale = hatOn ? 0.88 : 1;

  return (
    <group>
      <mesh
        position={[0, 2.19, -0.015]}
        scale={[0.43 * crownScale, 0.37 * crownScale, 0.4 * crownScale]}
        castShadow
      >
        <sphereGeometry
          args={[1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.56]}
        />
        <meshStandardMaterial
          color={hairColor}
          roughness={0.93}
          metalness={0}
        />
      </mesh>

      {hairStyle === "crop" && !hatOn && (
        <group position={[0, 2.47, 0.03]}>
          {[-0.22, -0.08, 0.08, 0.22].map((x, index) => (
            <mesh
              key={x}
              position={[x, index % 2 === 0 ? -0.01 : 0.025, 0]}
              scale={[0.14, 0.1, 0.18]}
              castShadow
            >
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
          ))}
        </group>
      )}

      {(hairStyle === "bob" || hairStyle === "long") && (
        <>
          <mesh
            position={[-0.36, hairStyle === "long" ? 1.79 : 1.98, -0.06]}
            scale={[0.15, hairStyle === "long" ? 0.62 : 0.39, 0.2]}
            castShadow
          >
            <capsuleGeometry args={[1, 1, 8, 14]} />
            <meshStandardMaterial color={hairColor} roughness={0.94} />
          </mesh>
          <mesh
            position={[0.36, hairStyle === "long" ? 1.79 : 1.98, -0.06]}
            scale={[0.15, hairStyle === "long" ? 0.62 : 0.39, 0.2]}
            castShadow
          >
            <capsuleGeometry args={[1, 1, 8, 14]} />
            <meshStandardMaterial color={hairColor} roughness={0.94} />
          </mesh>
        </>
      )}

      {hairStyle === "long" && (
        <mesh
          position={[0, 1.68, -0.27]}
          scale={[0.4, 0.65, 0.18]}
          castShadow
        >
          <capsuleGeometry args={[1, 1, 8, 18]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </mesh>
      )}

      {hairStyle === "ponytail" && (
        <>
          <mesh position={[0, 2.06, -0.42]} castShadow>
            <sphereGeometry args={[0.18, 18, 12]} />
            <meshStandardMaterial color={hairColor} roughness={0.93} />
          </mesh>
          <mesh
            position={[0, 1.67, -0.47]}
            scale={[0.17, 0.46, 0.17]}
            rotation={[0.16, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[1, 1, 8, 14]} />
            <meshStandardMaterial color={hairColor} roughness={0.95} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Top({
  profile,
  morphology,
}: CharacterLayersProps) {
  const { top, topColor } = profile.wardrobe;
  if (top === "none") return null;

  const feminine = profile.bodyType === "female";
  const fatFit = morphology.fatLevel * 0.075;
  const torsoX =
    (feminine ? 0.92 : 1.02) * morphology.widthScale + fatFit;
  const torsoZ = 0.82 * morphology.widthScale + fatFit * 1.25;
  const isHoodie = top === "hoodie";
  const isTee = top === "tee";

  return (
    <group>
      <mesh
        position={[0, isHoodie ? 0.53 : 0.61, 0]}
        scale={[
          torsoX,
          isHoodie ? 1.02 : top === "tank" ? 0.92 : 0.96,
          torsoZ,
        ]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry
          args={[
            isHoodie ? 0.55 : 0.51,
            isHoodie ? 0.86 : 0.78,
            10,
            24,
          ]}
        />
        <ClothMaterial color={topColor} />
      </mesh>

      {(isTee || isHoodie) &&
        ([-1, 1] as const).map((side) => (
          <mesh
            key={side}
            position={[
              side * (isHoodie ? 0.76 : 0.73) * morphology.widthScale,
              isHoodie ? 0.48 : 0.91,
              0,
            ]}
            scale={[
              isHoodie ? 0.2 : 0.21,
              isHoodie ? 0.75 : 0.32,
              isHoodie ? 0.21 : 0.22,
            ]}
            rotation={[0, 0, side * (isHoodie ? 0.025 : 0.08)]}
            castShadow
          >
            <capsuleGeometry args={[1, 1, 8, 16]} />
            <ClothMaterial color={topColor} />
          </mesh>
        ))}

      {isHoodie && (
        <mesh
          position={[0, 1.42, -0.16]}
          scale={[0.48, 0.5, 0.32]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.48, 0.16, 10, 24, Math.PI * 1.55]} />
          <ClothMaterial color={topColor} />
        </mesh>
      )}
    </group>
  );
}

function Bottom({
  profile,
  morphology,
}: CharacterLayersProps) {
  const { bottom, bottomColor } = profile.wardrobe;
  const feminine = profile.bodyType === "female";
  const fatFit = morphology.fatLevel * (feminine ? 0.1 : 0.075);
  const hipWidth =
    (feminine ? 1.04 : 0.94) * morphology.widthScale + fatFit;
  const long = bottom !== "shorts";
  const fitted = bottom === "leggings";
  const legRadius = fitted ? 0.235 : long ? 0.27 : 0.29;
  const legLength = long ? 1.38 : 0.4;
  const legY = long ? -1.31 : -0.69;

  return (
    <group>
      <mesh
        position={[0, -0.42, 0]}
        scale={[hipWidth, 0.72, 0.78 + fatFit]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.46, 0.26, 8, 22]} />
        <ClothMaterial color={bottomColor} />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          position={[side * 0.27 * hipWidth, legY, 0]}
          scale={[
            (feminine ? 1.04 : 1) * morphology.widthScale +
              morphology.fatLevel * 0.035,
            1,
            0.92 + morphology.fatLevel * 0.045,
          ]}
          castShadow
          receiveShadow
        >
          <capsuleGeometry args={[legRadius, legLength, 8, 18]} />
          <ClothMaterial color={bottomColor} />
        </mesh>
      ))}
    </group>
  );
}

function Shoes({ profile }: { profile: CharacterProfile }) {
  const { shoes, shoeColor } = profile.wardrobe;
  const high = shoes === "high-tops";

  return (
    <group>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh
            position={[side * 0.25, -2.37, 0.13]}
            scale={[0.23, 0.13, 0.42]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color={shoeColor}
              roughness={0.72}
              metalness={0}
            />
          </mesh>
          <mesh
            position={[side * 0.25, -2.5, 0.14]}
            scale={[0.25, 0.035, 0.44]}
            castShadow
          >
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#f5f2ec" roughness={0.84} />
          </mesh>
          {high && (
            <mesh
              position={[side * 0.25, -2.18, 0]}
              scale={[0.24, 0.25, 0.25]}
              castShadow
            >
              <cylinderGeometry args={[1, 0.94, 1, 18]} />
              <meshStandardMaterial color={shoeColor} roughness={0.76} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Eyewear({ profile }: { profile: CharacterProfile }) {
  const eyewear = profile.wardrobe.eyewear;
  if (eyewear === "none") return null;

  if (eyewear === "sport") {
    return (
      <mesh position={[0, 2.02, 0.405]} scale={[0.47, 0.095, 0.025]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhysicalMaterial
          color="#27343b"
          transparent
          opacity={0.82}
          roughness={0.16}
          transmission={0.08}
        />
      </mesh>
    );
  }

  return (
    <group position={[0, 2.01, 0.41]}>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.2, 0, 0]}>
          <torusGeometry args={[0.145, 0.022, 8, 20]} />
          <meshStandardMaterial color="#24272a" roughness={0.48} />
        </mesh>
      ))}
      <mesh scale={[0.07, 0.015, 0.015]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#24272a" roughness={0.48} />
      </mesh>
    </group>
  );
}

function Headwear({ profile }: { profile: CharacterProfile }) {
  const { headwear, headwearColor } = profile.wardrobe;
  if (headwear === "none") return null;

  if (headwear === "cap") {
    return (
      <group>
        <mesh
          position={[0, 2.39, 0]}
          scale={[0.47, 0.24, 0.45]}
          castShadow
        >
          <sphereGeometry
            args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]}
          />
          <ClothMaterial color={headwearColor} />
        </mesh>
        <mesh
          position={[0, 2.27, 0.36]}
          scale={[0.34, 0.035, 0.27]}
          rotation={[0.12, 0, 0]}
          castShadow
        >
          <boxGeometry args={[2, 2, 2]} />
          <ClothMaterial color={headwearColor} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh
        position={[0, 2.36, 0]}
        scale={[0.47, 0.3, 0.44]}
        castShadow
      >
        <sphereGeometry
          args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]}
        />
        <ClothMaterial color={headwearColor} />
      </mesh>
      <mesh position={[0, 2.25, 0]} scale={[0.46, 0.08, 0.43]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 24]} />
        <ClothMaterial color={headwearColor} />
      </mesh>
    </group>
  );
}

export function CharacterLayers({
  profile,
  morphology,
}: CharacterLayersProps) {
  return (
    <group>
      <Hair profile={profile} />
      <Bottom profile={profile} morphology={morphology} />
      <Top profile={profile} morphology={morphology} />
      <Shoes profile={profile} />
      <Eyewear profile={profile} />
      <Headwear profile={profile} />
    </group>
  );
}

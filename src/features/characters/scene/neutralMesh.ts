import * as THREE from "three";

const NEUTRAL_POSITION_ATTRIBUTE = "aNeutralPosition";
const NEUTRAL_NORMAL_ATTRIBUTE = "aNeutralNormal";

/**
 * Builds a neutral, low-detail version of the scan with repeated local
 * Laplacian averaging. The shader blends toward it only inside muscle regions
 * and only when the measured starting muscularity is low. This removes baked
 * athletic definition without replacing the person's overall silhouette.
 */
export function addNeutralPositionAttribute(
  geometry: THREE.BufferGeometry,
  iterations = 6,
) {
  if (geometry.getAttribute(NEUTRAL_POSITION_ATTRIBUTE)) return;

  const position = geometry.getAttribute("position");
  const index = geometry.index;
  if (!(position instanceof THREE.BufferAttribute) || !index) {
    geometry.setAttribute(
      NEUTRAL_POSITION_ATTRIBUTE,
      position.clone(),
    );
    return;
  }

  const vertexCount = position.count;
  let current = Float32Array.from(position.array as ArrayLike<number>);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const neighbourSums = new Float32Array(vertexCount * 3);
    const neighbourCounts = new Uint32Array(vertexCount);

    const accumulate = (from: number, to: number) => {
      const fromOffset = from * 3;
      const toOffset = to * 3;
      neighbourSums[fromOffset] += current[toOffset];
      neighbourSums[fromOffset + 1] += current[toOffset + 1];
      neighbourSums[fromOffset + 2] += current[toOffset + 2];
      neighbourCounts[from] += 1;
    };

    for (let cursor = 0; cursor < index.count; cursor += 3) {
      const a = index.getX(cursor);
      const b = index.getX(cursor + 1);
      const c = index.getX(cursor + 2);
      accumulate(a, b);
      accumulate(a, c);
      accumulate(b, a);
      accumulate(b, c);
      accumulate(c, a);
      accumulate(c, b);
    }

    const next = new Float32Array(current.length);
    const strength = 0.38;
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const offset = vertex * 3;
      const count = neighbourCounts[vertex];
      if (count === 0) {
        next[offset] = current[offset];
        next[offset + 1] = current[offset + 1];
        next[offset + 2] = current[offset + 2];
        continue;
      }
      next[offset] =
        current[offset] +
        (neighbourSums[offset] / count - current[offset]) * strength;
      next[offset + 1] =
        current[offset + 1] +
        (neighbourSums[offset + 1] / count - current[offset + 1]) * strength;
      next[offset + 2] =
        current[offset + 2] +
        (neighbourSums[offset + 2] / count - current[offset + 2]) * strength;
    }
    current = next;
  }

  geometry.setAttribute(
    NEUTRAL_POSITION_ATTRIBUTE,
    new THREE.BufferAttribute(current, 3),
  );

  const neutralGeometry = geometry.clone();
  neutralGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(current.slice(), 3),
  );
  neutralGeometry.deleteAttribute("normal");
  neutralGeometry.computeVertexNormals();
  geometry.setAttribute(
    NEUTRAL_NORMAL_ATTRIBUTE,
    neutralGeometry.getAttribute("normal").clone(),
  );
  neutralGeometry.dispose();
}

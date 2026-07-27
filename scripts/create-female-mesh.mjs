import fs from "node:fs/promises";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

class NodeFileReader {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString(
        "base64",
      )}`;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (low, high, value) => {
  const t = clamp01((value - low) / (high - low));
  return t * t * (3 - 2 * t);
};
const band = (value, low, high, fade) =>
  smoothstep(low, low + fade, value) *
  (1 - smoothstep(high - fade, high, value));

const sourcePath = new URL("../public/models/male-base.glb", import.meta.url);
const outputPath = new URL(
  "../public/models/female-base.glb",
  import.meta.url,
);
const source = await fs.readFile(sourcePath);
const sourceBuffer = source.buffer.slice(
  source.byteOffset,
  source.byteOffset + source.byteLength,
);
const gltf = await new Promise((resolve, reject) => {
  new GLTFLoader().parse(sourceBuffer, "", resolve, reject);
});

gltf.scene.name = "female_base";
gltf.scene.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;

  const geometry = object.geometry.clone();
  const positions = geometry.getAttribute("position");

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const ax = Math.abs(x);
    const torsoCore = 1 - smoothstep(0.62, 0.86, ax);
    const lowerBody = 1 - smoothstep(0.7, 0.94, ax);

    const ribcage = band(y, 0.2, 1.35, 0.36) * torsoCore;
    const shoulders =
      band(y, 0.72, 1.5, 0.3) * smoothstep(0.34, 0.62, ax);
    const waist = band(y, -0.34, 0.58, 0.32) * torsoCore;
    const hips = band(y, -0.78, 0.1, 0.3) * lowerBody;
    const thighs = band(y, -1.58, -0.08, 0.38) * lowerBody;
    const arms =
      band(y, -0.48, 1.38, 0.38) * smoothstep(0.58, 0.84, ax);
    const neck = band(y, 1.28, 1.76, 0.18) * torsoCore;
    const jaw = band(y, 1.67, 2.02, 0.15);

    const xScale =
      1 -
      ribcage * 0.042 -
      shoulders * 0.072 -
      waist * 0.09 +
      hips * 0.105 +
      thighs * 0.05 -
      arms * 0.04 -
      neck * 0.045 -
      jaw * 0.032;
    const zScale =
      1 -
      ribcage * 0.025 +
      hips * 0.06 +
      thighs * 0.033 -
      arms * 0.026;

    const front = smoothstep(0.035, 0.24, z);
    const rear = smoothstep(0.035, 0.24, -z);
    const breastLobes = Math.exp(
      -Math.pow((ax - 0.23) / 0.235, 2),
    );
    const breastShape =
      band(y, 0.44, 1.16, 0.25) *
      front *
      breastLobes *
      (1 - smoothstep(0.54, 0.72, ax));
    const gluteShape =
      band(y, -0.74, 0.08, 0.28) *
      rear *
      (1 - smoothstep(0.7, 0.92, ax));

    positions.setXYZ(
      index,
      x * xScale,
      y,
      z * zScale + breastShape * 0.125 - gluteShape * 0.08,
    );
  }

  positions.needsUpdate = true;
  geometry.deleteAttribute("normal");
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name = "female_body_geometry";
  object.name = "female_body";
  object.geometry = geometry;
});

const exported = await new GLTFExporter().parseAsync(gltf.scene, {
  binary: true,
  onlyVisible: false,
});
await fs.writeFile(outputPath, Buffer.from(exported));

const stats = await fs.stat(outputPath);
console.log(`Created female-base.glb (${stats.size} bytes)`);

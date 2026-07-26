export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.75} color="#b8c8bc" />
      <directionalLight
        position={[3.2, 5.4, 4.5]}
        intensity={3.2}
        color="#f4ffe9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[-3.6, 2.8, 2.7]}
        intensity={18}
        distance={8}
        angle={0.42}
        penumbra={0.95}
        color="#baff4f"
      />
      <pointLight
        position={[3.2, 0.6, 2.2]}
        intensity={8}
        distance={6}
        color="#7868ff"
      />
      <pointLight
        position={[0, -1.5, 2.2]}
        intensity={5}
        distance={4}
        color="#67ead9"
      />
    </>
  );
}


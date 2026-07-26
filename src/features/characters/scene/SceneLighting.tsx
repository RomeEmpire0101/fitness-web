export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.35} color="#ffffff" />
      <directionalLight
        position={[3.2, 5.4, 4.5]}
        intensity={3.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[-3.6, 2.8, 2.7]}
        intensity={11}
        distance={8}
        angle={0.42}
        penumbra={0.95}
        color="#d8e4f2"
      />
      <pointLight
        position={[3.2, 0.6, 2.2]}
        intensity={4}
        distance={6}
        color="#f6f8fb"
      />
      <pointLight
        position={[0, -1.5, 2.2]}
        intensity={3}
        distance={4}
        color="#dfe6ed"
      />
    </>
  );
}

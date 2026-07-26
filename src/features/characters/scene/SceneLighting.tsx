export function SceneLighting() {
  return (
    <>
      <hemisphereLight
        intensity={1.35}
        color="#fff8f1"
        groundColor="#6f7b82"
      />
      <directionalLight
        position={[3.4, 5.8, 4.6]}
        intensity={3.1}
        color="#fff1e6"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-4.2, 3.2, 3.1]}
        intensity={7.5}
        distance={10}
        angle={0.48}
        penumbra={0.92}
        color="#d8eaff"
      />
      <spotLight
        position={[2.8, 3.4, -3.8]}
        intensity={6.2}
        distance={9}
        angle={0.5}
        penumbra={0.88}
        color="#ffd9c2"
      />
      <pointLight
        position={[0, -0.7, 2.8]}
        intensity={2.1}
        distance={5.5}
        color="#f3f7ff"
      />
    </>
  );
}

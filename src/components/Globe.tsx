import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const GLOBE_RADIUS = 2.5;

function GlobeSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, '/globe-texture.jpg');

  const dots = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 200;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = GLOBE_RADIUS * 1.02 * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * 1.02 * Math.sin(phi) * Math.sin(theta);
      const z = GLOBE_RADIUS * 1.02 * Math.cos(phi);
      positions.push([x, y, z]);
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.15 * delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main globe */}
      <Sphere ref={meshRef} args={[GLOBE_RADIUS, 64, 64]}>
        <meshPhongMaterial
          map={texture}
          color="#ffffff"
          emissive="#0a0a1a"
          emissiveIntensity={0.15}
          shininess={10}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[GLOBE_RADIUS * 1.08, 64, 64]}>
        <meshBasicMaterial
          color="#B8A14E"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Financial center dots */}
      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.015, 4, 4]} />
          <meshBasicMaterial
            color="#B8A14E"
            transparent
            opacity={0.5 + Math.sin(i * 0.5) * 0.3}
          />
        </mesh>
      ))}

      {/* Ambient + directional lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, -5]} intensity={0.2} color="#B8A14E" />
    </group>
  );
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Globe() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Stars />
        <GlobeSphere />
      </Canvas>
    </div>
  );
}

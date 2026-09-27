import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ScenePhase = 'ingest' | 'normalize' | 'score' | 'contradict' | 'decide';

const ARMS = 3;

function createDotTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Galaxy({ phase, count }: { phase: ScenePhase; count: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const tint = useMemo(() => new THREE.Color(), []);
  const texture = useMemo(createDotTexture, []);

  const { positions, colors } = useMemo(() => {
    const positionArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const inner = new THREE.Color('#7c3aed');
    const outer = new THREE.Color('#0ea5e9');
    const mixed = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const radius = 0.35 + Math.pow(Math.random(), 0.8) * 2.6;
      const arm = ((i % ARMS) / ARMS) * Math.PI * 2;
      const spin = radius * 1.35;
      const spread = (Math.random() - 0.5) * 0.55 * (1 + radius * 0.25);
      const angle = arm + spin + spread;
      const lift = (Math.random() - 0.5) * 0.42 * (1.2 / (0.6 + radius));

      positionArray[i * 3] = Math.cos(angle) * radius;
      positionArray[i * 3 + 1] = lift;
      positionArray[i * 3 + 2] = Math.sin(angle) * radius;

      mixed.copy(inner).lerp(outer, Math.min(radius / 2.8, 1));
      colorArray[i * 3] = mixed.r;
      colorArray[i * 3 + 1] = mixed.g;
      colorArray[i * 3 + 2] = mixed.b;
    }

    return { positions: positionArray, colors: colorArray };
  }, [count]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    const galaxy = points.current;
    const mat = material.current;
    if (!galaxy || !mat) return;

    const speed = phase === 'ingest' ? 0.42 : phase === 'normalize' ? 0.3 : phase === 'decide' ? 0.08 : 0.16;
    galaxy.rotation.y += delta * speed;
    galaxy.rotation.x = THREE.MathUtils.damp(galaxy.rotation.x, 0.95 + pointer.current.y * 0.22, 3, delta);
    galaxy.rotation.z = THREE.MathUtils.damp(galaxy.rotation.z, -pointer.current.x * 0.22, 3, delta);

    const targetScale =
      phase === 'normalize' ? 0.78 : phase === 'score' ? 0.9 : phase === 'contradict' ? 1.04 : phase === 'decide' ? 1.14 : 1;
    galaxy.scale.setScalar(THREE.MathUtils.damp(galaxy.scale.x, targetScale, 3.5, delta));

    tint.set(phase === 'contradict' ? '#fdba74' : '#ffffff');
    mat.color.lerp(tint, 1 - Math.exp(-5 * delta));
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        map={texture}
        size={0.055}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField({ phase, active }: { phase: ScenePhase; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <Galaxy phase={phase} count={2600} />
    </Canvas>
  );
}

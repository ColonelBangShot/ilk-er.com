'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#c9a14a';
const GOLD_BRIGHT = '#e0b86a';
const FRONT = new THREE.Vector3(0, 0.12, 1).normalize();
const R = 2;

// lat/lng (degrees) -> unit direction on the sphere
function latLngToVec(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize();
}

/* ── Wireframe globe + atmosphere, rotates to face the active focus ── */
function Globe({ focus, markers }) {
  const group = useRef();
  const idleQ = useMemo(() => new THREE.Quaternion(), []);
  const targetQ = useMemo(() => new THREE.Quaternion(), []);
  const spin = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.0016),
    []
  );

  const markerDirs = useMemo(
    () => (markers ?? []).map((m) => ({ ...m, dir: latLngToVec(m.lat, m.lng).multiplyScalar(R) })),
    [markers]
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    if (focus) {
      const dir = latLngToVec(focus.lat, focus.lng);
      targetQ.setFromUnitVectors(dir, FRONT);
      group.current.quaternion.slerp(targetQ, Math.min(1, delta * 1.8));
    } else {
      group.current.quaternion.multiply(spin);
    }
  });

  return (
    <group ref={group}>
      {/* solid core */}
      <mesh>
        <sphereGeometry args={[R * 0.985, 48, 48]} />
        <meshStandardMaterial color="#15120b" roughness={1} metalness={0} />
      </mesh>
      {/* wireframe shell */}
      <mesh>
        <sphereGeometry args={[R, 36, 36]} />
        <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.22} />
      </mesh>
      {/* atmosphere rim */}
      <mesh scale={1.14}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* location markers */}
      {markerDirs.map((m, i) => (
        <Marker key={i} pos={m.dir} primary={m.primary} />
      ))}
    </group>
  );
}

function Marker({ pos, primary }) {
  const ref = useRef();
  const ring = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 2.2) * 0.18;
    if (ref.current) ref.current.scale.setScalar(s);
    if (ring.current) {
      const r = 1 + ((t * 0.6) % 1) * 2.2;
      ring.current.scale.setScalar(r);
      ring.current.material.opacity = 0.5 * (1 - ((t * 0.6) % 1));
    }
  });
  const color = primary ? GOLD_BRIGHT : GOLD;
  return (
    <group position={pos.toArray()}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring} rotation={[0, 0, 0]} onUpdate={(self) => self.lookAt(0, 0, 0)}>
        <ringGeometry args={[0.05, 0.07, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Orbiting tech halo for the PMS / AI sections ── */
function TechHalo({ ring }) {
  const group = useRef();
  const scale = useRef(0.0001);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = ring ? 1 : 0.0001;
    scale.current = THREE.MathUtils.lerp(scale.current, target, Math.min(1, delta * 3));
    group.current.scale.setScalar(scale.current);
    group.current.rotation.z += delta * 0.25;
    group.current.rotation.x = 0.5;
  });

  const nodes = useMemo(() => {
    const count = ring?.count ?? 4;
    const rad = R * 1.7;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return [Math.cos(a) * rad, Math.sin(a) * rad, 0];
    });
  }, [ring?.count]);

  const hue = ring?.hue ?? GOLD;

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 1.7, 0.012, 12, 100]} />
        <meshBasicMaterial color={hue} transparent opacity={0.5} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial color={hue} wireframe />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ section }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color={GOLD_BRIGHT} />
      <Stars radius={60} depth={40} count={1800} factor={3} saturation={0} fade speed={0.6} />
      <Globe focus={section?.focus} markers={section?.markers} />
      <TechHalo ring={section?.ring} />
    </>
  );
}

export default function Scene({ section }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Rig section={section} />
    </Canvas>
  );
}

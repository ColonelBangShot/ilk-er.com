'use client';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './experience.module.css';

const GOLD = '#c9a14a';
const GOLD_BRIGHT = '#e0b86a';
const FRONT = new THREE.Vector3(0, 0.12, 1).normalize();
const R = 2;

function latLngToVec(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize();
}

function monogram(name, mono) {
  if (mono) return mono;
  const parts = String(name).replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
}

/* ── Floating logo/name/status chip anchored to a 3D point ── */
function Chip({ item, position, occludeRef, index = 0 }) {
  const icon = item.iconPath;
  return (
    <Html
      position={position}
      center
      occlude={occludeRef ? [occludeRef] : undefined}
      zIndexRange={[20, 0]}
      pointerEvents="none"
      style={{ pointerEvents: 'none' }}
    >
      <div className={styles.chip} style={{ animationDelay: `${index * 110}ms` }}>
        {icon ? (
          <span className={styles.chipLogo}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon} fill="currentColor" /></svg>
          </span>
        ) : (
          <span className={styles.chipMono}>{monogram(item.name, item.mono)}</span>
        )}
        <span className={styles.chipText}>
          <span className={styles.chipName}>{item.name}</span>
          {item.status && <span className={styles.chipStatus}>{item.status}</span>}
        </span>
      </div>
    </Html>
  );
}

/* ── Globe: wireframe sphere that rotates to the active focus ── */
function Globe({ focus, chips, halo, icons }) {
  const world = useRef();
  const core = useRef();
  const haloGroup = useRef();
  const haloScale = useRef(0.0001);
  const targetQ = useMemo(() => new THREE.Quaternion(), []);
  const spin = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.0018),
    []
  );

  // geo chips (hotels / languages / contact) sit on the rotating world group
  const geoChips = useMemo(
    () =>
      (chips ?? [])
        .filter((c) => c.lat !== undefined)
        .map((c) => ({ ...c, pos: latLngToVec(c.lat, c.lng).multiplyScalar(R * 1.06), iconPath: c.logo ? icons[c.logo] : null })),
    [chips, icons]
  );

  // halo chips (pms / ai) orbit on a ring around the globe
  const haloChips = useMemo(() => {
    if (!halo) return [];
    const list = (chips ?? []).filter((c) => c.lat === undefined);
    const rad = R * 1.55;
    return list.map((c, i) => {
      const a = (i / list.length) * Math.PI * 2;
      return { ...c, pos: [Math.cos(a) * rad, Math.sin(a) * 0.35 * rad, Math.sin(a) * rad], iconPath: c.logo ? icons[c.logo] : null };
    });
  }, [chips, halo, icons]);

  useFrame((_, delta) => {
    if (world.current) {
      if (focus) {
        targetQ.setFromUnitVectors(latLngToVec(focus.lat, focus.lng), FRONT);
        world.current.quaternion.slerp(targetQ, Math.min(1, delta * 1.6));
      } else {
        world.current.quaternion.multiply(spin);
      }
    }
    if (haloGroup.current) {
      const target = halo ? 1 : 0.0001;
      haloScale.current = THREE.MathUtils.lerp(haloScale.current, target, Math.min(1, delta * 3));
      haloGroup.current.scale.setScalar(haloScale.current);
      haloGroup.current.rotation.y += delta * 0.22;
    }
  });

  const hue = halo?.hue ?? GOLD;

  return (
    <>
      <group ref={world}>
        <mesh ref={core}>
          <sphereGeometry args={[R * 0.985, 48, 48]} />
          <meshStandardMaterial color="#15120b" roughness={1} metalness={0} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R, 36, 36]} />
          <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.2} />
        </mesh>
        <mesh scale={1.14}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.05} side={THREE.BackSide} />
        </mesh>
        {geoChips.map((c, i) => (
          <group key={i} position={c.pos.toArray()}>
            <mesh>
              <sphereGeometry args={[0.04, 14, 14]} />
              <meshBasicMaterial color={GOLD_BRIGHT} />
            </mesh>
            <Chip item={c} position={[0, 0, 0]} occludeRef={core} index={i} />
          </group>
        ))}
      </group>

      <group ref={haloGroup}>
        <mesh rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[R * 1.55, 0.01, 12, 120]} />
          <meshBasicMaterial color={hue} transparent opacity={0.45} />
        </mesh>
        {haloChips.map((c, i) => (
          <group key={i} position={c.pos}>
            <mesh>
              <icosahedronGeometry args={[0.06, 0]} />
              <meshBasicMaterial color={hue} wireframe />
            </mesh>
            <Chip item={c} position={[0, 0, 0]} occludeRef={core} index={i} />
          </group>
        ))}
      </group>
    </>
  );
}

function Rig({ section, icons }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color={GOLD_BRIGHT} />
      <Stars radius={60} depth={40} count={1600} factor={3} saturation={0} fade speed={0.6} />
      <Globe focus={section?.focus} chips={section?.chips} halo={section?.halo} icons={icons} />
    </>
  );
}

export default function Scene({ section }) {
  const [icons, setIcons] = useState({});

  // load simple-icons paths once (client only)
  useEffect(() => {
    let alive = true;
    import('simple-icons')
      .then((si) => {
        const want = ['tui', 'radissonhotelgroup', 'ihg', 'oracle', 'anthropic', 'googlegemini', 'openai', 'x'];
        const map = {};
        for (const slug of want) {
          const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
          const ic = si[key];
          if (ic?.path) map[slug] = ic.path;
        }
        if (alive) setIcons(map);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <Rig section={section} icons={icons} />
    </Canvas>
  );
}

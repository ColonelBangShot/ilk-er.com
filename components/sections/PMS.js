'use client';
import { useEffect, useRef } from 'react';
import styles from './PMS.module.css';

// Hub sits at SVG center
const HUB = { cx: 600, cy: 350 };
const CARD = { w: 210, h: 128 };

// 4 systems — final SVG positions at the four corners
const SYSTEMS = [
  {
    key: 'opera',
    name: 'OPERA PMS',
    vendor: 'Oracle Hospitality',
    version: 'v5.6 · REST API',
    code: 'PMS-01',
    years: '2015 – Present',
    // card center in final SVG state
    cx: 870, cy: 135,
  },
  {
    key: 'elektra',
    name: 'ELEKTRAWEB',
    vendor: 'Elektraweb Software',
    version: 'v3.4 · On-Premise',
    code: 'PMS-02',
    years: '2021 – 2025',
    cx: 330, cy: 135,
  },
  {
    key: 'fidelio',
    name: 'FIDELIO',
    vendor: 'Micros / Oracle',
    version: 'v8.9 · On-Premise',
    code: 'PMS-03',
    years: '2010 – 2015',
    cx: 870, cy: 565,
  },
  {
    key: 'sejour',
    name: 'SÉJOUR',
    vendor: 'Séjour Hospitality',
    version: 'v2.1 · Local DB',
    code: 'PMS-04',
    years: '2015 – 2020',
    cx: 330, cy: 565,
  },
];

// Line length ≈ distance from hub center to card center
// sqrt((870-600)²+(135-350)²) = sqrt(270²+215²) = sqrt(72900+46225) ≈ 345
const LINE_LEN = 360;

export default function PMS() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx;

    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // ── Set all initial states before timeline runs ─────
        gsap.set('#pms-hub', {
          scale: 0.2,
          opacity: 0,
          transformOrigin: `${HUB.cx}px ${HUB.cy}px`,
        });
        gsap.set('#pms-header-label', { opacity: 0, y: -12 });

        SYSTEMS.forEach(({ key, cx, cy }) => {
          // offset = (hubCenter - cardCenter) → card starts at hub
          gsap.set(`#pms-card-${key}`, {
            x: HUB.cx - cx,
            y: HUB.cy - cy,
            opacity: 0,
            transformOrigin: 'center',
          });
          gsap.set(`#pms-line-${key}`, { strokeDashoffset: LINE_LEN });
          gsap.set(`#pms-ann-${key}`, { opacity: 0 });
        });

        // ── Scroll-scrubbed timeline ─────────────────────────
        // Sticky wrapper (CSS) holds the section pinned; ScrollTrigger
        // maps the wrapper's total scroll height to tl progress.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.4,
          },
        });

        // Hub + label fade-in
        tl.to('#pms-hub', {
          scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)',
        });
        tl.to('#pms-header-label', {
          opacity: 1, y: 0, duration: 0.4,
        }, '<0.3');

        // Each system explodes out sequentially
        SYSTEMS.forEach(({ key }) => {
          tl.to(`#pms-card-${key}`, {
            x: 0, y: 0, opacity: 1, duration: 1.4, ease: 'power3.out',
          }, '+=0.3');
          // Line draws as card travels
          tl.to(`#pms-line-${key}`, {
            strokeDashoffset: 0, duration: 1.1,
          }, '<0.5');
          // Annotation fades in after card settles
          tl.to(`#pms-ann-${key}`, {
            opacity: 1, duration: 0.5,
          }, '>-0.3');
        });
      }, wrapperRef);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    // Tall wrapper creates scroll real-estate for scrubbed animation
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.sticky}>

        {/* Floating section label */}
        <div className={styles.floatHeader}>
          <p className="eyebrow">04 — PMS Systems</p>
          <p className={styles.floatSub}>Property Management Architecture</p>
        </div>

        {/* ── Blueprint SVG ──────────────────────────────── */}
        <svg
          viewBox="0 0 1200 700"
          className={styles.schematic}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Exploded PMS architecture diagram"
        >
          <defs>
            {/* Blueprint dot-grid */}
            <pattern id="dot-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.5" fill="#c9a14a" fillOpacity="0.18" />
            </pattern>
            {/* Arrowhead */}
            <marker id="dim-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0.5 L5,3 L0,5.5" fill="none" stroke="#c9a14a" strokeWidth="0.8" strokeOpacity="0.5" />
            </marker>
          </defs>

          {/* Grid */}
          <rect width="1200" height="700" fill="url(#dot-grid)" />

          {/* Outer frame */}
          <rect x="18" y="18" width="1164" height="664"
            fill="none" stroke="#c9a14a" strokeWidth="0.6" strokeOpacity="0.12" />

          {/* Corner accent marks */}
          {[
            [18, 18, 58, 18, 18, 58],
            [1182, 18, 1142, 18, 1182, 58],
            [18, 682, 58, 682, 18, 642],
            [1182, 682, 1142, 682, 1182, 642],
          ].map(([x1, y1, x2, y2, x3, y3], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a14a" strokeWidth="1.2" strokeOpacity="0.35" />
              <line x1={x1} y1={y1} x2={x3} y2={y3} stroke="#c9a14a" strokeWidth="1.2" strokeOpacity="0.35" />
            </g>
          ))}

          {/* Header label (GSAP animates opacity) */}
          <g id="pms-header-label">
            <text x="600" y="52" textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill="#c9a14a" opacity="0.45"
              letterSpacing="4">
              EXPLODED VIEW — PMS ARCHITECTURE
            </text>
            <line x1="440" y1="57" x2="560" y2="57" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.25" />
            <line x1="640" y1="57" x2="760" y2="57" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.25" />
          </g>

          {/* ── Dimension lines (drawn by strokeDashoffset) ── */}
          {SYSTEMS.map(({ key, cx, cy }) => (
            <line
              key={key}
              id={`pms-line-${key}`}
              x1={HUB.cx} y1={HUB.cy}
              x2={cx} y2={cy}
              stroke="#c9a14a"
              strokeWidth="0.7"
              strokeOpacity="0.3"
              strokeDasharray={LINE_LEN}
              strokeDashoffset={LINE_LEN}
              markerEnd="url(#dim-arrow)"
            />
          ))}

          {/* ── System cards ─────────────────────────────── */}
          {SYSTEMS.map(({ key, cx, cy, name, vendor, version, code, years }) => (
            <g key={key} id={`pms-card-${key}`}>
              {/* Card body */}
              <rect
                x={cx - CARD.w / 2} y={cy - CARD.h / 2}
                width={CARD.w} height={CARD.h}
                fill="#0d0c0b"
                stroke="#c9a14a" strokeWidth="0.8" strokeOpacity="0.45"
              />
              {/* Top gold bar */}
              <rect
                x={cx - CARD.w / 2 + 1} y={cy - CARD.h / 2 + 1}
                width={CARD.w - 2} height={3}
                fill="#c9a14a" fillOpacity="0.45"
              />
              {/* System name */}
              <text
                x={cx} y={cy - 28}
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontSize="17"
                fontWeight="300"
                fill="#f0ece4"
              >{name}</text>
              {/* Vendor */}
              <text
                x={cx} y={cy - 8}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize="10"
                fill="#7a7570"
              >{vendor}</text>
              {/* Version / protocol */}
              <text
                x={cx} y={cy + 11}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="9"
                fill="#c9a14a"
                opacity="0.75"
              >{version}</text>
              {/* Code + years */}
              <text
                x={cx} y={cy + 40}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8"
                fill="#4a4743"
                letterSpacing="1.5"
              >{code} · {years}</text>
            </g>
          ))}

          {/* ── Annotations (appear last) ──────────────────── */}
          {SYSTEMS.map(({ key, cx, cy }) => {
            const right = cx > HUB.cx;
            const bottom = cy > HUB.cy;
            const ax = right ? cx + CARD.w / 2 + 14 : cx - CARD.w / 2 - 86;
            const ay = bottom ? cy + CARD.h / 2 - 6 : cy - CARD.h / 2 - 6;
            return (
              <g key={key} id={`pms-ann-${key}`}>
                <line
                  x1={right ? cx + CARD.w / 2 : cx - CARD.w / 2}
                  y1={cy}
                  x2={right ? cx + CARD.w / 2 + 10 : cx - CARD.w / 2 - 10}
                  y2={cy}
                  stroke="#c9a14a" strokeWidth="0.5" strokeOpacity="0.3"
                />
                <text
                  x={ax} y={ay}
                  fontFamily="var(--font-mono)"
                  fontSize="7.5"
                  fill="#c9a14a"
                  opacity="0.4"
                  letterSpacing="1"
                >INTEGRATED</text>
                <text
                  x={ax} y={ay + 11}
                  fontFamily="var(--font-mono)"
                  fontSize="7.5"
                  fill="#4a4743"
                  letterSpacing="1"
                >{right ? '→' : '←'} ACTIVE NODE</text>
              </g>
            );
          })}

          {/* ── Central hub ────────────────────────────────── */}
          <g id="pms-hub">
            {/* Outer pulse ring */}
            <circle cx={HUB.cx} cy={HUB.cy} r="86"
              fill="none" stroke="#c9a14a" strokeWidth="0.4"
              strokeOpacity="0.15" strokeDasharray="2 8" />
            {/* Main circle */}
            <circle cx={HUB.cx} cy={HUB.cy} r="68"
              fill="#0a0908" stroke="#c9a14a" strokeWidth="1" strokeOpacity="0.5" />
            {/* Inner ring */}
            <circle cx={HUB.cx} cy={HUB.cy} r="52"
              fill="none" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.2" />
            {/* Label */}
            <text
              x={HUB.cx} y={HUB.cy - 10}
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="26"
              fontWeight="300"
              fill="#c9a14a"
            >PMS</text>
            <text
              x={HUB.cx} y={HUB.cy + 14}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="8"
              fill="#7a7570"
              letterSpacing="4"
            >CENTRAL HUB</text>
          </g>
        </svg>

      </section>
    </div>
  );
}

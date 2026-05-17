'use client';
import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const svgRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    let animeInstance;

    const init = async () => {
      // anime.js v3 CJS/ESM interop: handle both module shapes
      const animeModule = await import('animejs/lib/anime.es.js');
      const anime = animeModule.default ?? animeModule;

      if (!svgRef.current) return;

      // ── Entrance: stagger-fade the text lines ──────────────────
      anime({
        targets: sectionRef.current?.querySelectorAll('.hero-reveal'),
        opacity: [0, 1],
        translateY: [28, 0],
        delay: anime.stagger(110, { start: 200 }),
        duration: 1000,
        easing: 'easeOutExpo',
      });

      // ── Entrance: scale in the whole SVG ──────────────────────
      anime({
        targets: svgRef.current,
        opacity: [0, 1],
        scale: [0.82, 1],
        duration: 1400,
        delay: 100,
        easing: 'easeOutExpo',
      });

      // ── Continuous ring rotations ──────────────────────────────
      anime({
        targets: '#ring-1',
        rotate: '1turn',
        duration: 22000,
        easing: 'linear',
        loop: true,
      });
      anime({
        targets: '#ring-2',
        rotate: '-1turn',
        duration: 16000,
        easing: 'linear',
        loop: true,
      });
      anime({
        targets: '#ring-3',
        rotate: '1turn',
        duration: 9500,
        easing: 'linear',
        loop: true,
      });

      // ── Pulse the central monogram glow ───────────────────────
      anime({
        targets: '#center-glow',
        opacity: [0.18, 0.38],
        r: [52, 62],
        duration: 3200,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      });
    };

    init();
    return () => {
      if (animeInstance) animeInstance.pause();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      {/* ── Left column ──────────────────────────────────────── */}
      <div className={styles.left}>
        <p className={`eyebrow hero-reveal ${styles.eyebrow}`}>
          Front Office Manager
        </p>

        <h1 className={styles.name}>
          <span className={`hero-reveal ${styles.firstName}`}>İlker</span>
          <span className={`hero-reveal ${styles.lastName}`}>DEGE</span>
        </h1>

        <p className={`hero-reveal ${styles.tagline}`}>
          25+ years shaping guest experience<br />
          across luxury &amp; resort hospitality.
        </p>

        <div className={`hero-reveal ${styles.meta}`}>
          <span className="mono-sm">TR · EN · DE · RU</span>
          <span className={styles.metaDot} />
          <span className="mono-sm">Antalya, Turkey</span>
        </div>

        <a
          href="mailto:ilker@ilk-er.com"
          className={`hero-reveal ${styles.cta}`}
        >
          <span>Speak with my assistant</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* ── Right column — orbital monogram ───────────────────── */}
      <div className={styles.right}>
        <svg
          ref={svgRef}
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.orbital}
          aria-label="İD orbital monogram"
          style={{ opacity: 0 }}
        >
          <defs>
            {/* Radial glow behind monogram */}
            <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#c9a14a" stopOpacity="0.22" />
              <stop offset="55%"  stopColor="#c9a14a" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#c9a14a" stopOpacity="0" />
            </radialGradient>

            {/* Node glow filter */}
            <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Monogram text glow */}
            <filter id="text-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background radial wash */}
          <circle cx="250" cy="250" r="220" fill="url(#bg-glow)" />

          {/* Subtle cross-hair guides */}
          <line x1="250" y1="30"  x2="250" y2="80"  stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.2" />
          <line x1="250" y1="420" x2="250" y2="470" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.2" />
          <line x1="30"  y1="250" x2="80"  y2="250" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.2" />
          <line x1="420" y1="250" x2="470" y2="250" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.2" />

          {/* ── Ring 1 — inner, steep tilt, clockwise ─────────── */}
          {/* rx=88, ry=20 → nearly edge-on; initial 2D rotation 18° */}
          <g id="ring-1" className="orbital-ring" transform="rotate(18, 250, 250)">
            <ellipse
              cx="250" cy="250" rx="88" ry="20"
              stroke="#c9a14a" strokeWidth="0.9" strokeOpacity="0.55" fill="none"
            />
            {/* nodes at θ=0°, 120°, 240° on this ellipse */}
            {/* θ=0:   (338, 250) */}
            <circle cx="338" cy="250" r="5.5" fill="#c9a14a" filter="url(#node-glow)" />
            {/* θ=120°: (250+88*cos120, 250+20*sin120) = (250-44, 250+17.3) = (206, 267) */}
            <circle cx="206" cy="267" r="3.5" fill="#c9a14a" filter="url(#node-glow)" opacity="0.7" />
            {/* θ=240°: (250-44, 250-17.3) = (206, 233) */}
            <circle cx="206" cy="233" r="3.5" fill="#c9a14a" filter="url(#node-glow)" opacity="0.7" />
          </g>

          {/* ── Ring 2 — middle, moderate tilt, counter-clockwise */}
          {/* rx=148, ry=50; initial 2D rotation -25° */}
          <g id="ring-2" className="orbital-ring" transform="rotate(-25, 250, 250)">
            <ellipse
              cx="250" cy="250" rx="148" ry="50"
              stroke="#c9a14a" strokeWidth="0.65" strokeOpacity="0.35" fill="none"
            />
            {/* θ=0:   (398, 250) */}
            <circle cx="398" cy="250" r="4.5" fill="#c9a14a" filter="url(#node-glow)" />
            {/* θ=90:  (250, 300) */}
            <circle cx="250" cy="300" r="3"   fill="#c9a14a" opacity="0.55" />
            {/* θ=180: (102, 250) */}
            <circle cx="102" cy="250" r="4.5" fill="#c9a14a" filter="url(#node-glow)" />
            {/* θ=270: (250, 200) */}
            <circle cx="250" cy="200" r="3"   fill="#c9a14a" opacity="0.55" />
            {/* θ=60:  (250+74, 250+43.3) = (324, 293) */}
            <circle cx="324" cy="293" r="2.5" fill="#c9a14a" opacity="0.4" />
            {/* θ=300: (324, 207) */}
            <circle cx="324" cy="207" r="2.5" fill="#c9a14a" opacity="0.4" />
          </g>

          {/* ── Ring 3 — outer, near-horizontal, fast clockwise ── */}
          {/* rx=205, ry=68; dashed; initial 2D rotation 8° */}
          <g id="ring-3" className="orbital-ring" transform="rotate(8, 250, 250)">
            <ellipse
              cx="250" cy="250" rx="205" ry="68"
              stroke="#c9a14a" strokeWidth="0.5" strokeOpacity="0.22"
              strokeDasharray="5 9" fill="none"
            />
            {/* θ=0:   (455, 250) */}
            <circle cx="455" cy="250" r="3.5" fill="#c9a14a" filter="url(#node-glow)" opacity="0.8" />
            {/* θ=180: (45, 250) */}
            <circle cx="45"  cy="250" r="3.5" fill="#c9a14a" filter="url(#node-glow)" opacity="0.8" />
            {/* θ=60:  (250+102.5, 250+58.9) = (352.5, 308.9) */}
            <circle cx="353" cy="309" r="2.5" fill="#c9a14a" opacity="0.4" />
            {/* θ=120: (147.5, 308.9) */}
            <circle cx="148" cy="309" r="2.5" fill="#c9a14a" opacity="0.4" />
            {/* θ=240: (147.5, 191.1) */}
            <circle cx="148" cy="191" r="2.5" fill="#c9a14a" opacity="0.4" />
            {/* θ=300: (352.5, 191.1) */}
            <circle cx="353" cy="191" r="2.5" fill="#c9a14a" opacity="0.4" />
          </g>

          {/* ── Central platform ─────────────────────────────── */}
          <circle cx="250" cy="250" r="52" fill="#0a0908" />
          <circle
            id="center-glow"
            cx="250" cy="250" r="52"
            fill="#c9a14a" opacity="0.18"
          />
          <circle
            cx="250" cy="250" r="51"
            stroke="#c9a14a" strokeWidth="0.6" strokeOpacity="0.4" fill="none"
          />

          {/* ── İD monogram ──────────────────────────────────── */}
          <text
            x="250" y="265"
            textAnchor="middle"
            fontFamily="var(--font-fraunces), Fraunces, Georgia, serif"
            fontSize="38"
            fontWeight="300"
            fontStyle="italic"
            fill="#c9a14a"
            filter="url(#text-glow)"
          >
            İD
          </text>
        </svg>
      </div>

      {/* ── Scroll hint ───────────────────────────────────────── */}
      <div className="scroll-hint">
        <span>scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 1v14M2 9l6 6 6-6" stroke="currentColor" strokeWidth="1"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}

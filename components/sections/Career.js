'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Career.module.css';

// Hotel data — ordered newest → oldest, dates from CV
const HOTELS = [
  {
    id: 'tui-blue',
    name: 'TUI Blue Maviss',
    role: 'Front Office Manager',
    period: '05/2026 — Present',
    location: 'Antalya, Turkey',
    brand: 'TUI',
    iconSlug: 'tui',
    iconFallback: 'T',
    color: '#003063',
  },
  {
    id: 'siam',
    name: 'Siam Elegance',
    role: 'Front Office Manager',
    period: '2025 — 2026',
    location: 'Antalya, Turkey',
    brand: 'Independent',
    iconSlug: null,
    iconFallback: 'SE',
    color: '#8B6914',
  },
  {
    id: 'radisson',
    name: 'Radisson Blu Kaş',
    role: 'Front Office Manager',
    period: '08/2023 — 10/2023',
    location: 'Antalya, Turkey',
    brand: 'Radisson',
    iconSlug: 'radissonhotelgroup',
    iconFallback: 'RB',
    color: '#CC0000',
  },
  {
    id: 'venezia',
    name: 'Venezia Palace',
    role: 'Front Office Manager',
    period: '07/2021 — 06/2022',
    location: 'Antalya, Turkey',
    brand: 'Independent',
    iconSlug: null,
    iconFallback: 'VP',
    color: '#5C3D1E',
  },
  {
    id: 'ihg',
    name: 'Crowne Plaza Antalya',
    role: 'Front Office Manager',
    period: '09/2020 — 03/2021',
    location: 'Antalya, Turkey',
    brand: 'IHG',
    iconSlug: 'ihg',
    iconFallback: 'CP',
    color: '#006340',
  },
  {
    id: 'avantgarde',
    name: 'Avantgarde Hotel & Resort',
    role: 'Front Office Manager',
    period: '06/2015 — 06/2018',
    location: 'Antalya, Turkey',
    brand: 'Independent',
    iconSlug: null,
    iconFallback: 'AV',
    color: '#3A3A5C',
  },
];

// Compute positions on an elliptical orbit (6 items, 60° apart)
function orbitPos(index, total, rx = 220, ry = 80) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // start top
  return {
    x: 250 + rx * Math.cos(angle),
    y: 250 + ry * Math.sin(angle),
  };
}

export default function Career() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [icons, setIcons] = useState({});
  const ringRef = useRef(null);
  const frameRef = useRef(null);
  const angleRef = useRef(0);
  const activeAngleRef = useRef(0); // target angle offset for active item at top

  const hotel = HOTELS[activeIdx];

  // Load simple-icons for brands that have slugs
  useEffect(() => {
    const load = async () => {
      const loaded = {};
      for (const h of HOTELS) {
        if (!h.iconSlug) continue;
        try {
          const si = await import('simple-icons');
          const key = `si${h.iconSlug.charAt(0).toUpperCase()}${h.iconSlug.slice(1)}`;
          if (si[key]) loaded[h.id] = si[key].svg;
        } catch {}
      }
      setIcons(loaded);
    };
    load();
  }, []);

  // Auto-rotate: advance active hotel every 3.5 s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % HOTELS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Animate ring rotation with anime.js when activeIdx changes
  useEffect(() => {
    let cancelled = false;

    const rotate = async () => {
      const animeModule = await import('animejs/lib/anime.es.js');
      const anime = animeModule.default ?? animeModule;
      if (cancelled || !ringRef.current) return;

      // Each step = 1/6 turn counter-clockwise so active is always at top
      const targetDeg = -(activeIdx / HOTELS.length) * 360;
      anime({
        targets: ringRef.current,
        rotate: `${targetDeg}deg`,
        duration: 900,
        easing: 'easeInOutCubic',
      });
    };

    rotate();
    return () => { cancelled = true; };
  }, [activeIdx]);

  return (
    <section className={styles.section}>
      <div className={styles.layout}>

        {/* ── Left: info panel ─────────────────────────────── */}
        <div className={styles.infoPanel}>
          <p className={`eyebrow ${styles.eyebrow}`}>03 — Career</p>

          <div className={styles.hotelInfo} key={hotel.id}>
            <div className={styles.logoWrap}>
              {icons[hotel.id] ? (
                <span
                  className={styles.brandSvg}
                  dangerouslySetInnerHTML={{ __html: icons[hotel.id] }}
                  style={{ '--brand-color': hotel.color }}
                />
              ) : (
                <span className={styles.brandFallback} style={{ background: hotel.color }}>
                  {hotel.iconFallback}
                </span>
              )}
            </div>

            <h2 className={styles.hotelName}>{hotel.name}</h2>
            <p className={styles.hotelRole}>{hotel.role}</p>

            <div className={styles.hotelMeta}>
              <span className="mono-sm">{hotel.period}</span>
              <span className={styles.metaDot} />
              <span className="mono-sm">{hotel.location}</span>
            </div>
          </div>

          {/* Step indicators */}
          <div className={styles.dots}>
            {HOTELS.map((h, i) => (
              <button
                key={h.id}
                className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`View ${h.name}`}
              />
            ))}
          </div>
        </div>

        {/* ── Right: orbital ring ───────────────────────────── */}
        <div className={styles.orbitWrap}>
          <svg viewBox="0 0 500 500" className={styles.orbitSvg} aria-hidden>
            <defs>
              <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#c9a14a" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#c9a14a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Static ellipse track */}
            <ellipse
              cx="250" cy="250" rx="220" ry="80"
              stroke="#c9a14a" strokeWidth="0.5" strokeOpacity="0.2"
              strokeDasharray="4 8" fill="none"
            />

            {/* Background glow */}
            <circle cx="250" cy="250" r="180" fill="url(#orbit-glow)" />

            {/* Rotating group of hotel nodes */}
            <g
              ref={ringRef}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              {HOTELS.map((h, i) => {
                const pos = orbitPos(i, HOTELS.length);
                const isActive = i === activeIdx;
                return (
                  <g
                    key={h.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveIdx(i)}
                  >
                    {/* Node ring */}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isActive ? 16 : 10}
                      fill={isActive ? h.color : 'var(--bg-surface)'}
                      stroke="#c9a14a"
                      strokeWidth={isActive ? 1.5 : 0.8}
                      strokeOpacity={isActive ? 0.9 : 0.4}
                      style={{ transition: 'all 0.4s' }}
                    />
                    {/* Fallback initials */}
                    <text
                      x={pos.x} y={pos.y + 4}
                      textAnchor="middle"
                      fontSize={isActive ? 9 : 7}
                      fontFamily="var(--font-mono)"
                      fill={isActive ? '#fff' : 'var(--text-dim)'}
                      pointerEvents="none"
                    >
                      {h.iconFallback}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Centre hub */}
            <circle cx="250" cy="250" r="36" fill="var(--bg)" stroke="#c9a14a" strokeWidth="0.6" strokeOpacity="0.4" />
            <text
              x="250" y="255"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="18"
              fontWeight="300"
              fill="#c9a14a"
            >
              İD
            </text>
          </svg>
        </div>

      </div>
    </section>
  );
}

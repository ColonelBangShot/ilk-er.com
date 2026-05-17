'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './AIToolchain.module.css';

// AI tools — Claude is primary (larger, top)
const TOOLS = [
  {
    key: 'claude',
    name: 'Claude',
    maker: 'Anthropic',
    role: 'Primary AI Assistant',
    slug: 'anthropic',
    siKey: 'siAnthropic',
    hex: 'CC785C',
    // Final SVG position (top-center, prominent)
    cx: 600, cy: 120,
    size: 64, // icon square size
    cardW: 220, cardH: 140,
    // start offset (pulled to hub)
    startX: 0, startY: 215,
    primary: true,
  },
  {
    key: 'gemini',
    name: 'Gemini',
    maker: 'Google',
    role: 'Research & Analysis',
    slug: 'googlegemini',
    siKey: 'siGooglegemini',
    hex: '8E75B2',
    cx: 255, cy: 390,
    size: 44,
    cardW: 190, cardH: 120,
    startX: 280, startY: -55,
  },
  {
    key: 'openai',
    name: 'ChatGPT',
    maker: 'OpenAI',
    role: 'Code & Content Generation',
    slug: 'openai',
    siKey: 'siOpenai',
    hex: '74AA9C',
    cx: 945, cy: 390,
    size: 44,
    cardW: 190, cardH: 120,
    startX: -280, startY: -55,
  },
  {
    key: 'grok',
    name: 'Grok',
    maker: 'X / xAI',
    role: 'Real-time Intelligence',
    slug: 'x',
    siKey: 'siX',
    hex: 'FFFFFF',
    cx: 600, cy: 590,
    size: 44,
    cardW: 190, cardH: 120,
    startX: 0, startY: -255,
  },
];

const HUB = { cx: 600, cy: 350 };
// Line lengths (hub to each card center):
// Claude: dy=230, dx=0 → 230
// Gemini: dx=345, dy=-40 → ~347
// OpenAI: dx=-345, dy=-40 → ~347
// Grok:   dy=-240, dx=0 → 240
const LINE_LENS = { claude: 240, gemini: 360, openai: 360, grok: 250 };

export default function AIToolchain() {
  const wrapperRef = useRef(null);
  const [iconPaths, setIconPaths] = useState({});

  // Load simple-icons paths
  useEffect(() => {
    const load = async () => {
      try {
        const si = await import('simple-icons');
        const paths = {};
        TOOLS.forEach(({ key, siKey }) => {
          if (si[siKey]?.path) paths[key] = si[siKey].path;
        });
        setIconPaths(paths);
      } catch (e) {
        // simple-icons not available — fallback letters will show
      }
    };
    load();
  }, []);

  // GSAP scroll animation
  useEffect(() => {
    let ctx;

    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Initial states
        gsap.set('#ai-hub', { scale: 0.2, opacity: 0, transformOrigin: `${HUB.cx}px ${HUB.cy}px` });
        gsap.set('#ai-tagline', { opacity: 0, y: 8 });

        TOOLS.forEach(({ key, startX, startY }) => {
          gsap.set(`#ai-card-${key}`, { x: startX, y: startY, opacity: 0 });
          gsap.set(`#ai-line-${key}`, { strokeDashoffset: LINE_LENS[key] ?? 350 });
          gsap.set(`#ai-label-${key}`, { opacity: 0 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });

        // Hub
        tl.to('#ai-hub', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' });
        tl.to('#ai-tagline', { opacity: 1, y: 0, duration: 0.3 }, '<0.3');

        // Claude first (primary — slides from below)
        tl.to('#ai-card-claude', { x: 0, y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, '+=0.2');
        tl.to('#ai-line-claude', { strokeDashoffset: 0, duration: 1 }, '<0.4');
        tl.to('#ai-label-claude', { opacity: 1, duration: 0.4 }, '>-0.2');

        // Gemini (left)
        tl.to('#ai-card-gemini', { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, '+=0.3');
        tl.to('#ai-line-gemini', { strokeDashoffset: 0, duration: 0.9 }, '<0.4');
        tl.to('#ai-label-gemini', { opacity: 1, duration: 0.4 }, '>-0.2');

        // OpenAI (right)
        tl.to('#ai-card-openai', { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, '+=0.3');
        tl.to('#ai-line-openai', { strokeDashoffset: 0, duration: 0.9 }, '<0.4');
        tl.to('#ai-label-openai', { opacity: 1, duration: 0.4 }, '>-0.2');

        // Grok (bottom)
        tl.to('#ai-card-grok', { x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, '+=0.3');
        tl.to('#ai-line-grok', { strokeDashoffset: 0, duration: 0.9 }, '<0.4');
        tl.to('#ai-label-grok', { opacity: 1, duration: 0.4 }, '>-0.2');

      }, wrapperRef);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.sticky}>

        <div className={styles.floatHeader}>
          <p className="eyebrow">05 — AI Toolchain</p>
          <p className={styles.floatSub}>Intelligence Stack</p>
        </div>

        <svg
          viewBox="0 0 1200 700"
          className={styles.schematic}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="AI toolchain constellation diagram"
        >
          <defs>
            {/* Radial gradient field */}
            <radialGradient id="ai-field" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#c9a14a" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#c9a14a" stopOpacity="0" />
            </radialGradient>
            {/* Hexagonal grid */}
            <pattern id="hex-bg" width="40" height="46.2" patternUnits="userSpaceOnUse">
              <polygon
                points="20,1 39,11.5 39,34.7 20,45.2 1,34.7 1,11.5"
                fill="none" stroke="#c9a14a" strokeWidth="0.2" strokeOpacity="0.1"
              />
            </pattern>
            {/* Connection line end dot */}
            <marker id="ai-dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <circle cx="3" cy="3" r="2" fill="#c9a14a" opacity="0.4" />
            </marker>
          </defs>

          {/* Backgrounds */}
          <rect width="1200" height="700" fill="url(#hex-bg)" />
          <circle cx={HUB.cx} cy={HUB.cy} r="320" fill="url(#ai-field)" />

          {/* Connection lines */}
          {TOOLS.map(({ key, cx, cy }) => (
            <line
              key={key}
              id={`ai-line-${key}`}
              x1={HUB.cx} y1={HUB.cy}
              x2={cx} y2={cy}
              stroke="#c9a14a"
              strokeWidth={key === 'claude' ? 1.2 : 0.7}
              strokeOpacity={key === 'claude' ? 0.4 : 0.25}
              strokeDasharray={LINE_LENS[key] ?? 350}
              strokeDashoffset={LINE_LENS[key] ?? 350}
              markerEnd="url(#ai-dot)"
            />
          ))}

          {/* ── Tool cards ───────────────────────────────── */}
          {TOOLS.map(({ key, cx, cy, name, maker, role, hex, cardW, cardH, size, primary }) => (
            <g key={key} id={`ai-card-${key}`}>
              {/* Card */}
              <rect
                x={cx - cardW / 2} y={cy - cardH / 2}
                width={cardW} height={cardH}
                rx="4" ry="4"
                fill="#0d0c0b"
                stroke={primary ? '#c9a14a' : '#c9a14a'}
                strokeWidth={primary ? 1.2 : 0.7}
                strokeOpacity={primary ? 0.55 : 0.35}
              />
              {/* Primary indicator bar */}
              {primary && (
                <rect
                  x={cx - cardW / 2 + 1} y={cy - cardH / 2 + 1}
                  width={cardW - 2} height={4}
                  rx="3"
                  fill="#c9a14a" fillOpacity="0.5"
                />
              )}

              {/* Brand icon (simple-icons path, or fallback letter) */}
              {iconPaths[key] ? (
                <svg
                  x={cx - size / 2}
                  y={cy - cardH / 2 + (primary ? 22 : 16)}
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                >
                  <path d={iconPaths[key]} fill={`#${hex}`} opacity="0.85" />
                </svg>
              ) : (
                <text
                  x={cx}
                  y={cy - cardH / 2 + (primary ? 22 : 18) + size * 0.6}
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                  fontStyle="italic"
                  fontSize={primary ? 28 : 20}
                  fill={`#${hex}`}
                  opacity="0.7"
                >
                  {name[0]}
                </text>
              )}

              {/* Tool name */}
              <text
                x={cx}
                y={primary ? cy + 24 : cy + 12}
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontWeight="300"
                fontSize={primary ? 18 : 15}
                fill="#f0ece4"
              >{name}</text>

              {/* Maker */}
              <text
                x={cx}
                y={primary ? cy + 42 : cy + 28}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8"
                fill="#7a7570"
                letterSpacing="1.5"
              >{maker.toUpperCase()}</text>
            </g>
          ))}

          {/* ── Floating role labels ──────────────────────── */}
          {TOOLS.map(({ key, cx, cy, role, cardW, cardH, primary }) => {
            const above = cy < HUB.cy;
            const ly = above ? cy - cardH / 2 - 14 : cy + cardH / 2 + 22;
            return (
              <g key={key} id={`ai-label-${key}`}>
                <text
                  x={cx} y={ly}
                  textAnchor="middle"
                  fontFamily="var(--font-body)"
                  fontSize="11"
                  fontWeight="300"
                  fill={primary ? '#c9a14a' : '#7a7570'}
                  opacity={primary ? 0.8 : 0.6}
                >{role}</text>
              </g>
            );
          })}

          {/* ── Central hub ──────────────────────────────── */}
          <g id="ai-hub">
            {/* Outer pulse ring */}
            <circle cx={HUB.cx} cy={HUB.cy} r="78"
              fill="none" stroke="#c9a14a" strokeWidth="0.5" strokeOpacity="0.12"
              strokeDasharray="3 9" />
            {/* Inner */}
            <circle cx={HUB.cx} cy={HUB.cy} r="60"
              fill="#0a0908" stroke="#c9a14a" strokeWidth="1" strokeOpacity="0.45" />
            <circle cx={HUB.cx} cy={HUB.cy} r="46"
              fill="none" stroke="#c9a14a" strokeWidth="0.4" strokeOpacity="0.18" />
            <text
              x={HUB.cx} y={HUB.cy - 8}
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontStyle="italic"
              fontSize="22"
              fontWeight="300"
              fill="#c9a14a"
            >AI</text>
            <text
              x={HUB.cx} y={HUB.cy + 13}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="7"
              fill="#7a7570"
              letterSpacing="4"
            >TOOLCHAIN</text>
          </g>

          {/* Tagline at bottom */}
          <g id="ai-tagline">
            <text x={HUB.cx} y="672" textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8"
              fill="#c9a14a" opacity="0.3" letterSpacing="2.5">
              AUGMENTING HOSPITALITY OPERATIONS WITH AI
            </text>
          </g>
        </svg>

      </section>
    </div>
  );
}

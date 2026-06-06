'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { SECTIONS } from './data';
import styles from './experience.module.css';

// 3D scene is client-only (WebGL) — never server-render it.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function Experience() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number(e.target.dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      // a block is "active" once it crosses the vertical centre of the viewport
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const section = SECTIONS[active];

  return (
    <div className={styles.shell}>
      {/* ── Left: sticky 3D stage ── */}
      <div className={styles.stage}>
        <div className={styles.canvasWrap}>
          <Scene section={section} />
        </div>
        <div className={styles.stageMeta}>
          <b>{String(active + 1).padStart(2, '0')}</b> / {String(SECTIONS.length).padStart(2, '0')} — {section.id}
        </div>
      </div>

      {/* ── Right: scrolling content ── */}
      <div className={styles.content}>
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            data-index={i}
            ref={(el) => (refs.current[i] = el)}
            className={styles.block}
          >
            <Block section={s} activeNow={active === i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ section: s, activeNow }) {
  switch (s.kind) {
    case 'intro':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h1 className={styles.title}>{s.title}</h1>
          <p className={styles.lead}>{s.lead}</p>
          <p className={styles.meta}>{s.meta}</p>
        </>
      );

    case 'quote':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <p className={styles.quote}>“{s.quote}”</p>
          <div className={styles.statGrid}>
            {s.stats.map((st) => (
              <div className={styles.stat} key={st.l}>
                <div className={styles.statV}>{st.v}</div>
                <div className={styles.statL}>{st.l}</div>
                <div className={styles.statD}>{st.d}</div>
              </div>
            ))}
          </div>
        </>
      );

    case 'career':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2 className={styles.title}>{s.title}</h2>
          <p className={styles.lead}>{s.lead}</p>
          <div className={styles.rows}>
            {s.hotels.map((h) => (
              <div className={styles.row} key={h.name}>
                <div>
                  <div className={styles.rowName}>{h.name}</div>
                  <div className={styles.rowRole}>{h.role} · {h.location}</div>
                </div>
                <div>
                  <div className={styles.rowPeriod}>{h.period}</div>
                  <div className={styles.rowBrand}>{h.brand}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case 'pms':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2 className={styles.title}>{s.title}</h2>
          <p className={styles.lead}>{s.lead}</p>
          <div className={styles.cards}>
            {s.systems.map((sys) => (
              <div className={styles.card} key={sys.name}>
                <div className={styles.cardName}>{sys.name}</div>
                <div className={styles.cardSub}>{sys.vendor}</div>
                <div className={styles.cardTag}>{sys.tag}</div>
              </div>
            ))}
          </div>
        </>
      );

    case 'ai':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2 className={styles.title}>{s.title}</h2>
          <p className={styles.lead}>{s.lead}</p>
          <div className={styles.cards}>
            {s.tools.map((t) => (
              <div className={styles.card} key={t.name}>
                <div className={styles.cardName}>{t.name}</div>
                <div className={styles.cardSub}>{t.maker}</div>
                <div className={styles.cardTag}>{t.role}</div>
              </div>
            ))}
          </div>
        </>
      );

    case 'languages':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2 className={styles.title}>{s.title}</h2>
          <div className={styles.langs}>
            {s.langs.map((l) => (
              <div key={l.code}>
                <div className={styles.langTop}>
                  <div className={styles.langName}><span>{l.code}</span>{l.name}</div>
                  <div className={styles.langLevel}>{l.level}</div>
                </div>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ width: activeNow ? `${l.pct}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case 'contact':
      return (
        <>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2 className={styles.title}>{s.title}</h2>
          <p className={styles.lead}>{s.lead}</p>
          <a className={styles.email} href={`mailto:${s.email}`}>{s.email}</a>
          <p className={styles.meta}>{s.meta}</p>
        </>
      );

    default:
      return null;
  }
}

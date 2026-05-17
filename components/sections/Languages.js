'use client';
import { useEffect, useRef } from 'react';
import styles from './Languages.module.css';

const LANGS = [
  { code: 'TR', name: 'Turkish', level: 'Native',       pct: 100 },
  { code: 'EN', name: 'English', level: 'Advanced',     pct: 88  },
  { code: 'DE', name: 'German',  level: 'Professional', pct: 75  },
  { code: 'RU', name: 'Russian', level: 'Elementary',   pct: 35  },
];

export default function Languages() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animateIn();
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animateIn = async () => {
    const animeModule = await import('animejs/lib/anime.es.js');
    const anime = animeModule.default ?? animeModule;

    anime({
      targets: sectionRef.current?.querySelectorAll('.lang-reveal'),
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100),
      duration: 800,
      easing: 'easeOutExpo',
    });

    // Animate bar widths
    sectionRef.current?.querySelectorAll('[data-pct]').forEach((bar) => {
      const pct = parseInt(bar.dataset.pct, 10);
      anime({
        targets: bar,
        width: [`0%`, `${pct}%`],
        delay: 300,
        duration: 1200,
        easing: 'easeOutCubic',
      });
    });
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">

        <div className={styles.header}>
          <p className={`eyebrow lang-reveal`}>06 — Languages</p>
          <h2 className={`lang-reveal ${styles.title}`}>
            Multilingual<br /><em>Communication</em>
          </h2>
        </div>

        <div className={styles.grid}>
          {LANGS.map(({ code, name, level, pct }) => (
            <div key={code} className={`lang-reveal ${styles.langCard}`}>
              <div className={styles.langTop}>
                <span className={styles.langCode}>{code}</span>
                <span className={styles.langLevel}>{level}</span>
              </div>
              <p className={styles.langName}>{name}</p>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  data-pct={pct}
                  style={{ width: 0 }}
                />
              </div>
              <span className={styles.langPct}>{pct}%</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

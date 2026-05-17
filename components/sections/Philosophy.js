'use client';
import { useEffect, useRef } from 'react';
import styles from './Philosophy.module.css';

const STATS = [
  { value: '95%', label: 'Guest Satisfaction', sub: 'Consistent TripAdvisor top-tier ratings' },
  { value: '+20%', label: 'RevPAR Growth', sub: 'Average across managed properties' },
  { value: '−30%', label: 'Check-in Time', sub: 'Process re-engineering with Opera PMS' },
  { value: '−30%', label: 'Staff Turnover', sub: 'Culture & mentorship programme' },
];

export default function Philosophy() {
  const sectionRef = useRef(null);
  const countersRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animateIn();
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animateIn = async () => {
    const animeModule = await import('animejs/lib/anime.es.js');
    const anime = animeModule.default ?? animeModule;

    anime({
      targets: sectionRef.current?.querySelectorAll('.phil-reveal'),
      opacity: [0, 1],
      translateY: [24, 0],
      delay: anime.stagger(90),
      duration: 900,
      easing: 'easeOutExpo',
    });

    // Count-up for numeric values in stat cells
    sectionRef.current?.querySelectorAll('[data-target]').forEach((el) => {
      const raw = el.dataset.target;
      const isNeg = raw.startsWith('−') || raw.startsWith('-');
      const isPos = raw.startsWith('+');
      const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
      const suffix = raw.replace(/[0-9]/g, '');

      const obj = { val: 0 };
      anime({
        targets: obj,
        val: [0, num],
        duration: 1600,
        delay: 400,
        easing: 'easeOutExpo',
        update: () => {
          el.textContent = `${isNeg ? '−' : isPos ? '+' : ''}${Math.round(obj.val)}${suffix.replace(/[−+]/, '')}`;
        },
      });
    });
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">
        <div className={styles.inner}>

          {/* ── Quote ──────────────────────────────────────────── */}
          <div className={styles.quoteCol}>
            <p className={`eyebrow phil-reveal ${styles.eyebrow}`}>02 — Philosophy</p>
            <blockquote className={`phil-reveal ${styles.quote}`}>
              "Excellence is not a destination — it is the{' '}
              <em>standard</em> from which every guest interaction
              is measured."
            </blockquote>
            <div className={`phil-reveal ${styles.attribution}`}>
              <span className="mono-sm">İlker DEGE</span>
              <span className={styles.attrLine} />
              <span className="body-sm">16 years in luxury &amp; resort hospitality</span>
            </div>
          </div>

          {/* ── Stats grid ─────────────────────────────────────── */}
          <div className={styles.statsGrid}>
            {STATS.map(({ value, label, sub }, i) => {
              const isNeg = value.startsWith('−') || value.startsWith('-');
              const isPos = value.startsWith('+');
              const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
              const suffix = value.replace(/[0-9]/g, '').replace(/[−+]/, '');

              return (
                <div key={label} className={`phil-reveal ${styles.statCell}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div
                    className={styles.statValue}
                    data-target={value}
                  >
                    {isNeg ? '−' : isPos ? '+' : ''}{num}{suffix}
                  </div>
                  <div className={styles.statLabel}>{label}</div>
                  <div className={styles.statSub}>{sub}</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Corner accent */}
      <div className={styles.cornerBR} aria-hidden />
    </section>
  );
}

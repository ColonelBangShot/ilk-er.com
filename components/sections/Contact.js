'use client';
import { useEffect, useRef } from 'react';
import styles from './Contact.module.css';

export default function Contact() {
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
      targets: sectionRef.current?.querySelectorAll('.contact-reveal'),
      opacity: [0, 1],
      translateY: [28, 0],
      delay: anime.stagger(130),
      duration: 1000,
      easing: 'easeOutExpo',
    });
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Background diagonal grid */}
      <div className={styles.bgDecor} aria-hidden />

      <div className={`container ${styles.inner}`}>

        <p className={`eyebrow contact-reveal ${styles.eyebrow}`}>
          07 — Contact
        </p>

        <h2 className={`contact-reveal ${styles.cta}`}>
          Speak with<br />
          <em>my assistant.</em>
        </h2>

        <p className={`contact-reveal ${styles.sub}`}>
          My AI assistant is available 24/7 to answer questions about
          my experience, share my CV, or schedule a conversation.
        </p>

        <a
          href="mailto:ilker@ilk-er.com"
          className={`contact-reveal ${styles.mailBtn}`}
        >
          <span>ilker@ilk-er.com</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor"
              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <div className={`contact-reveal ${styles.footer}`}>
          <a
            href="/ilker_dege_EN.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cvLink}
          >
            Download CV (PDF)
          </a>
          <span className={styles.sep}>·</span>
          <span className="mono-sm">Antalya, Turkey</span>
          <span className={styles.sep}>·</span>
          <span className="mono-sm">GMT+3</span>
        </div>

      </div>

      {/* Large decorative "İD" at lower-right */}
      <div className={`contact-reveal ${styles.bgMono}`} aria-hidden>
        İD
      </div>
    </section>
  );
}

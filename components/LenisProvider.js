'use client';
import { useEffect } from 'react';

export default function LenisProvider({ children }) {
  useEffect(() => {
    let lenis;
    let gsapLoaded = false;

    const init = async () => {
      const { default: Lenis } = await import('lenis');
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      gsap.registerPlugin(ScrollTrigger);
      gsapLoaded = true;

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      // Sync Lenis with GSAP ticker so ScrollTrigger works correctly
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Expose lenis on window for other components
      window.__lenis = lenis;
    };

    init();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return children;
}

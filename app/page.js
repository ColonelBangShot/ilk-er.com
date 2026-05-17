import LenisProvider from '@/components/LenisProvider';
import Hero from '@/components/sections/Hero';
import Philosophy from '@/components/sections/Philosophy';
import Career from '@/components/sections/Career';
import PMS from '@/components/sections/PMS';
import AIToolchain from '@/components/sections/AIToolchain';
import Languages from '@/components/sections/Languages';
import Contact from '@/components/sections/Contact';

export default function Page() {
  return (
    <LenisProvider>
      <main>
        <Hero />
        <Philosophy />
        <Career />
        <PMS />
        <AIToolchain />
        <Languages />
        <Contact />
      </main>
    </LenisProvider>
  );
}

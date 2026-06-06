import LenisProvider from '@/components/LenisProvider';
import Experience from '@/components/experience/Experience';
import ChatBot from '@/components/ChatBot';

export default function Page() {
  return (
    <LenisProvider>
      <main>
        <Experience />
      </main>
      <ChatBot />
    </LenisProvider>
  );
}

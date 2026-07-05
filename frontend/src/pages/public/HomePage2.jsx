import { useState } from 'react';
import Hero from '../../components/Hero3';
import NewsAndEvents from '../../components/NewsAndEvents';
import Membership from '../../components/Membership';
import About from '../../components/About';
import Sponsors from '../../components/Sponsors';
import Contact from '../../components/Contact';
import IntroOverlay from '../../components/IntroOverlay';
import Reveal from '../../components/Reveal';

/**
 * HomePage — assembled from section components.
 * Rendered inside <PageLayout /> via nested routes.
 *
 * On mount, an intro splash plays over the top of the already-mounted
 * <Hero /> (whose 3D terrain background is animating underneath). The
 * splash fades away to hand off directly into that live animation.
 */
export default function HomePage() {
  const [showIntro, setShowIntro] = useState(() => {
    // Check if the intro has already played in this session
    return !sessionStorage.getItem('introPlayed');
  });

  const handleIntroDone = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  return (
    <main>
      {showIntro && <IntroOverlay onDone={handleIntroDone} />}

      <Hero />

      <Reveal>
        <Membership />
      </Reveal>
      <Reveal delay={80}>
        <About />
      </Reveal>
      <Reveal delay={80}>
        <Sponsors />
      </Reveal>
      <Reveal delay={80}>
        <Contact />
      </Reveal>
      <Reveal delay={80}>
        <NewsAndEvents />
      </Reveal>
    </main>
  );
}

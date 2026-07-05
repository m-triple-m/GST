import Hero from '../../components/Hero2';
import NewsAndEvents from '../../components/NewsAndEvents';
import Membership from '../../components/Membership';
import About from '../../components/About';
import Sponsors from '../../components/Sponsors';
import Contact from '../../components/Contact';

/**
 * HomePage — assembled from section components.
 * Rendered inside <PageLayout /> via nested routes.
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <Membership />
      <About />
      <Sponsors />
      <Contact />
      <NewsAndEvents />

    </main>
  );
}

import { Footer } from './components/layout/Footer.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { WhatsAppFloat } from './components/layout/WhatsAppFloat.jsx';
import { useSmoothAnchorScroll } from './hooks/useSmoothAnchorScroll.js';
import { Booking } from './sections/Booking.jsx';
import { Experience } from './sections/Experience.jsx';
import { Faq } from './sections/Faq.jsx';
import { Hero } from './sections/Hero.jsx';
import { Portfolio } from './sections/Portfolio.jsx';
import { Pricing } from './sections/Pricing.jsx';

export function App() {
  useSmoothAnchorScroll();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Experience />
        <Portfolio />
        <Pricing />
        <Booking />
        <Faq />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

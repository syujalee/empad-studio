import { FAQ_ITEMS } from '../data/faq.js';
import { useDisclosure } from '../hooks/useDisclosure.js';
import { Collapsible } from '../components/ui/Collapsible.jsx';
import { ChevronDownIcon } from '../components/ui/icons.jsx';
import { ParallaxBackground } from '../components/ui/ParallaxBackground.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';

function Answer({ segments }) {
  return segments.map((segment, index) => (typeof segment === 'string' ? segment : <strong key={index}>{segment.strong}</strong>));
}

export function Faq() {
  const { isOpen, toggle } = useDisclosure();

  return (
    <section id="faq" aria-labelledby="faq-title" className="section">
      <ParallaxBackground image="/assets/background/bg_4.webp" className="section-bg" />
      <div className="tempered-glass w-full">
        <h2 id="faq-title" className="mb-7 text-center font-heading text-[1.6rem] text-foreground">Syarat &amp; Ketentuan</h2>
        <div>
          {FAQ_ITEMS.map((item, index) => {
            const panelId = `faq-panel-${index}`;
            const open = isOpen(panelId);
            return (
              <Reveal key={item.question} className="border-b border-[rgba(255,255,255,0.06)]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(panelId)}
                    className="flex min-h-14 w-full items-center justify-between py-5 text-left text-[0.95rem] font-medium transition-all hover:text-gold"
                  >
                    {item.question}
                    <ChevronDownIcon className={`h-[18px] w-[18px] min-w-[18px] transition-all ${open ? '[transform:rotate(180deg)] text-gold' : 'text-muted'}`} />
                  </button>
                </h3>
                <Collapsible id={panelId} open={open} openClassName="pb-5">
                  <p className="text-[0.88rem] leading-[1.8] text-muted"><Answer segments={item.answer} /></p>
                </Collapsible>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

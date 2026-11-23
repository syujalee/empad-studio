import { ADDONS } from '../data/addons.js';
import { useDisclosure } from '../hooks/useDisclosure.js';
import { Collapsible } from '../components/ui/Collapsible.jsx';
import { ChevronDownIcon } from '../components/ui/icons.jsx';

const PANEL_ID = 'addons-panel';

export function AddOns() {
  const { isOpen, toggle } = useDisclosure();
  const open = isOpen(PANEL_ID);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => toggle(PANEL_ID)}
        className="flex min-h-14 w-full items-center justify-between rounded-card border border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.45)] px-6 py-[18px] text-[0.95rem] font-semibold backdrop-blur-[20px] transition-all hover:border-[rgba(212,175,55,0.2)]"
      >
        <span>Layanan Tambahan (Add-ons)</span>
        <ChevronDownIcon className={`h-5 w-5 transition-all ${open ? '[transform:rotate(180deg)]' : ''}`} />
      </button>
      <Collapsible id={PANEL_ID} open={open}>
        <ul>
          {ADDONS.map((addon) => (
            <li key={addon.name} className="flex justify-between border-b border-[rgba(255,255,255,0.04)] px-6 py-3.5 text-[0.88rem]">
              <span>{addon.name}</span>
              <span className="font-semibold whitespace-nowrap text-gold">{addon.price}</span>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}

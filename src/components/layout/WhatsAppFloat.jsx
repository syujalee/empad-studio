import { WHATSAPP_MESSAGES } from '../../data/whatsapp-messages.js';
import { EXTERNAL_LINK_PROPS } from '../../lib/external-link.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';
import { WhatsAppIcon } from '../ui/icons.jsx';

export function WhatsAppFloat() {
  return (
    <a
      href={buildWhatsAppUrl(WHATSAPP_MESSAGES.float)}
      className="group fixed right-7 bottom-7 z-[900] flex h-14 w-14 items-center justify-center rounded-[50%] bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:[transform:scale(1.1)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)] phone:right-5 phone:bottom-5 phone:h-[50px] phone:w-[50px]"
      aria-label="WhatsApp"
      {...EXTERNAL_LINK_PROPS}
    >
      <WhatsAppIcon className="h-7 w-7 phone:h-6 phone:w-6" />
      <span className="pointer-events-none absolute top-1/2 right-[68px] [transform:translateY(-50%)] rounded-[8px] bg-bg-card px-4 py-2 text-[0.78rem] whitespace-nowrap text-foreground opacity-0 shadow-card transition-all group-hover:opacity-100">
        Butuh bantuan jadwal?
      </span>
    </a>
  );
}

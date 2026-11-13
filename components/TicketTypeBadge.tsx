import { TicketType } from '@/types/attendee';
import { Star, Mic, Shield, Ticket } from 'lucide-react';

const styles: Record<TicketType, string> = {
  VIP: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Speaker: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
  Staff: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
  General: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
};

const IconComponent: Record<TicketType, React.ComponentType<{ className?: string }>> = {
  VIP: Star,
  Speaker: Mic,
  Staff: Shield,
  General: Ticket,
};

export default function TicketTypeBadge({ type }: { type: TicketType }) {
  const Icon = IconComponent[type] || Ticket;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[type] || styles.General}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{type}</span>
    </span>
  );
}

import { Badge } from '@/components/ui';
import { STATUS_META } from '@/lib/booking-rules';

export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || { label: status, tone: 'slate' as const };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

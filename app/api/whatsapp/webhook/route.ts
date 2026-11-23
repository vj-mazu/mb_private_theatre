import { q } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

// Meta calls this once to verify the URL.
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === token) {
    return new Response(p.get('hub.challenge') || '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// Delivery receipts: sent -> delivered -> read, or failed with Meta's reason.
export async function POST(req: Request) {
  const body: any = await req.json().catch(() => null);
  const changes = (body?.entry || []).flatMap((e: any) => e.changes || []);
  for (const ch of changes) {
    for (const s of ch?.value?.statuses || []) {
      const id = String(s.id || '');
      if (!id) continue;
      if (s.status === 'failed') {
        const e = s.errors?.[0];
        const reason = e ? `${e.code}: ${e.title || ''}${e.error_data?.details ? ` - ${e.error_data.details}` : e.message ? ` - ${e.message}` : ''}` : 'Delivery failed';
        console.error('[whatsapp] delivery failed', id, reason);
        await q("UPDATE whatsapp_messages SET status='failed', error=$2 WHERE provider_id=$1", [id, reason]).catch(() => {});
      } else if (s.status === 'delivered' || s.status === 'read') {
        await q("UPDATE whatsapp_messages SET status=$2, error='' WHERE provider_id=$1 AND status <> 'read'", [id, s.status]).catch(() => {});
      }
    }
  }
  return new Response('ok', { status: 200 });
}

import { getSettings } from '@/lib/server/catalog';
import { getBranches } from '@/lib/server/content';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { WhatsAppButton } from '@/components/site/WhatsAppButton';
import { PromoPopup } from '@/components/site/PromoPopup';
import { getAnnouncement, getLivePromos } from '@/lib/server/promos';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const [branches, bar, promos] = await Promise.all([
    getBranches(),
    getAnnouncement(settings.announcement),
    getLivePromos(),
  ]);

  return (
    <>
      <SiteHeader business={settings.business} branches={branches} bar={bar} />
      <main className="overflow-x-clip">{children}</main>
      <SiteFooter settings={settings} branches={branches} />
      {settings.business.whatsapp && <WhatsAppButton number={settings.business.whatsapp} />}
      <PromoPopup promos={promos.filter((p) => p.placement === 'popup')} />
    </>
  );
}

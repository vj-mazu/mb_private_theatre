import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kolibrie Studio | Movie Bash Motion & Film Experience',
  description: 'Kolibrie Studio recreation featuring 3D peeling card stack, cursor card follower, font weight hover, and team parallax.',
};

export default function KolibriePage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#faf3e4]">
      <iframe
        src="/kolibrie.html"
        title="Kolibrie Studio Experience"
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

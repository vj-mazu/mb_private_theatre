import Image from '@/components/Img';
import { clsx } from 'clsx';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/moviebash-official-logo.png"
      alt="Movie Bash — The Private Theater Celebration"
      width={370}
      height={160}
      priority
      className={clsx('w-auto', className ?? 'h-10')}
    />
  );
}

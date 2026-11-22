'use client';

import { motion } from 'framer-motion';
import { cn } from '@/components/ui';

export function BranchTabs({ branches, value, onChange, className }: {
  branches: { id: number; name: string }[]; value: number; onChange: (id: number) => void; className?: string;
}) {
  if (branches.length < 2) return null;
  return (
    <div className={cn('inline-flex rounded-2xl border border-line bg-cream-card p-1', className)} role="tablist">
      {branches.map((b) => (
        <button key={b.id} role="tab" aria-selected={value === b.id} onClick={() => onChange(b.id)}
          className={cn('relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200', value === b.id ? 'text-white' : 'text-navy-soft hover:text-navy')}>
          {value === b.id && <motion.span layoutId={`branch-pill-${branches.map((x) => x.id).join('')}`} className="absolute inset-0 rounded-xl bg-brand-600" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
          <span className="relative">{b.name}</span>
        </button>
      ))}
    </div>
  );
}

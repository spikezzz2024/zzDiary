import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

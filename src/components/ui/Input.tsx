import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-[var(--app-text)]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30 bg-[var(--app-surface)] text-[var(--app-text)] ${
          error ? 'border-red-500' : 'border-[var(--app-border)]'
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

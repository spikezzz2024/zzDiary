import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary:
      'bg-[var(--app-accent)] text-[var(--app-accent-text)] hover:brightness-110 focus:ring-[var(--app-accent)]/30',
    secondary:
      'border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:brightness-95 focus:ring-[var(--app-accent)]/30',
    ghost:
      'text-[var(--app-text-secondary)] hover:bg-[var(--app-border)]/30 focus:ring-[var(--app-accent)]/30',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

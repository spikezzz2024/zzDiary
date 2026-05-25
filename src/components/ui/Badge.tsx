interface Props {
  label: string;
  color?: string;
  bg?: string;
  className?: string;
}

export default function Badge({ label, color = 'text-[var(--app-text-secondary)]', bg = 'bg-[var(--app-border)]/30', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${bg} ${className}`}
    >
      {label}
    </span>
  );
}

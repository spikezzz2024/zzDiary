interface Props {
  label: string;
  color?: string;
  bg?: string;
  className?: string;
}

export default function Badge({ label, color = 'text-gray-700', bg = 'bg-gray-100', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${bg} ${className}`}
    >
      {label}
    </span>
  );
}

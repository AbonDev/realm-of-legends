import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  selected?: boolean;
}

export function Card({
  children,
  selected = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'card',
        className
      )}
      style={{
        padding: '16px',
        backgroundColor: selected ? 'rgba(61, 92, 115, 0.8)' : 'rgba(25, 31, 39, 0.85)',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-dark)'}`,
        borderRadius: '4px',
        boxShadow: selected ? '0 0 8px rgba(180, 143, 88, 0.5)' : 'none',
        transition: 'all 0.3s ease',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

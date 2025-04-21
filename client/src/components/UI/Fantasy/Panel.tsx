import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../lib/utils';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'dark';
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(({
  children,
  variant = 'primary',
  className,
  ...props
}, ref) => {
  // Variant styles
  const variantStyles = {
    primary: {
      background: 'var(--panel-bg)',
      borderColor: 'var(--border-light)',
    },
    secondary: {
      background: 'rgba(30, 38, 48, 0.85)',
      borderColor: 'var(--border-dark)',
    },
    dark: {
      background: 'rgba(16, 20, 26, 0.9)',
      borderColor: '#262220',
    }
  };

  const selectedVariant = variantStyles[variant];

  return (
    <div
      ref={ref}
      className={cn(
        'panel',
        className
      )}
      style={{
        padding: '20px',
        backgroundColor: selectedVariant.background,
        border: `1px solid ${selectedVariant.borderColor}`,
        borderRadius: '4px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Panel.displayName = 'Panel';

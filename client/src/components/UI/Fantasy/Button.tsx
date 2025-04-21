import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  // Base button styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-family: var(--header-font)
    rounded-md
    transition-all duration-200
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
  `;
  
  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-b from-[#c9a66b] to-[#8a6f41]
      border border-[#d6b77c]
      text-[#20170c]
      shadow-md
      hover:from-[#d6b77c] hover:to-[#a18549]
      active:from-[#8a6f41] active:to-[#6a5331]
      focus:ring-[#c9a66b]
    `,
    secondary: `
      bg-gradient-to-b from-[#3d4c5c] to-[#263240]
      border border-[#4c5e73]
      text-[#e8e8e8]
      shadow-md
      hover:from-[#4c5e73] hover:to-[#3d4c5c]
      active:from-[#263240] active:to-[#1a232c]
      focus:ring-[#4c5e73]
    `,
    ghost: `
      bg-transparent
      border border-[#4c5e73]
      text-[#c9a66b]
      hover:bg-[rgba(76,94,115,0.2)]
      active:bg-[rgba(76,94,115,0.3)]
      focus:ring-[#4c5e73]
    `
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 min-w-[80px]',
    md: 'text-base px-4 py-2 min-w-[100px]',
    lg: 'text-lg px-6 py-3 min-w-[120px]'
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{
        fontFamily: 'var(--header-font)'
      }}
      {...props}
    >
      {children}
    </button>
  );
}

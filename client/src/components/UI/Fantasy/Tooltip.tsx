import { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate tooltip position based on target element and preferred position
  const calculatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return;
    
    const targetRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + 10;
        break;
    }
    
    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewport.height - 10) {
      top = viewport.height - tooltipRect.height - 10;
    }
    
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewport.width - 10) {
      left = viewport.width - tooltipRect.width - 10;
    }
    
    setTooltipPosition({ top, left });
  };
  
  // Show tooltip after delay
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Need a small delay to let the tooltip render before calculating position
      setTimeout(calculatePosition, 10);
    }, delay);
  };
  
  // Hide tooltip
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };
  
  // Update position if window is resized
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  
  return (
    <>
      <div 
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 9999,
            padding: '8px 12px',
            backgroundColor: 'var(--tooltip-bg)',
            color: 'var(--text-light)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            maxWidth: '250px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-dark)',
            pointerEvents: 'none',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Find the selected option
  const selectedOption = options.find(option => option.value === value);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };
  
  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          const option = options[highlightedIndex];
          if (option) handleOptionClick(option.value);
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, options]);
  
  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Highlight the currently selected option if available
      const selectedIndex = options.findIndex(option => option.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, options, value]);
  
  return (
    <div 
      ref={containerRef}
      className={cn('fantasy-select', className)} 
      style={{ position: 'relative' }}
    >
      <div
        ref={selectRef}
        className={cn(
          'select-trigger',
          disabled && 'select-disabled'
        )}
        onClick={toggleDropdown}
        tabIndex={disabled ? -1 : 0}
        style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border-light)'}`,
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-light)',
          fontSize: '1rem',
          opacity: disabled ? 0.6 : 1,
          boxShadow: isOpen ? '0 0 5px rgba(180, 143, 88, 0.5)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ 
          marginLeft: '10px', 
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div 
          className="select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            maxHeight: '250px',
            overflowY: 'auto',
            backgroundColor: 'var(--tooltip-bg)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-dark)',
            zIndex: 100
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              className={cn(
                'select-option',
                value === option.value && 'selected',
                index === highlightedIndex && 'highlighted'
              )}
              onClick={() => handleOptionClick(option.value)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                backgroundColor: index === highlightedIndex 
                  ? 'rgba(180, 143, 88, 0.2)' 
                  : 'transparent',
                borderBottom: index !== options.length - 1 
                  ? '1px solid rgba(118, 96, 67, 0.3)' 
                  : 'none',
                color: value === option.value ? 'var(--text-gold)' : 'var(--text-light)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
              {value === option.value && (
                <span style={{ marginLeft: '8px', color: 'var(--text-gold)' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

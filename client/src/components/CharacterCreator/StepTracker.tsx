import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Step {
  id: string;
  label: string;
}

interface StepTrackerProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export default function StepTracker({ steps, currentStepIndex, onStepClick }: StepTrackerProps) {
  const trackerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate the progress bar
    if (trackerRef.current) {
      gsap.to(trackerRef.current, {
        width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [currentStepIndex, steps.length]);
  
  return (
    <div className="step-tracker" style={{
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      width: '60%',
      maxWidth: '700px'
    }}>
      {/* Progress bar background */}
      <div className="tracker-line" style={{
        position: 'absolute',
        height: '2px',
        width: '100%',
        background: 'var(--border-dark)',
        zIndex: 0
      }}></div>
      
      {/* Animated progress bar */}
      <div 
        ref={trackerRef}
        className="tracker-progress" 
        style={{
          position: 'absolute',
          height: '2px',
          width: '0%',
          background: 'var(--primary)',
          zIndex: 1,
          transition: 'width 0.4s ease-out'
        }}
      ></div>
      
      {/* Step markers */}
      <div className="tracker-steps" style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div 
              key={step.id} 
              className="tracker-step" 
              onClick={() => onStepClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div className="step-marker" style={{
                width: isCurrent ? '18px' : '14px',
                height: isCurrent ? '18px' : '14px',
                borderRadius: '50%',
                background: isActive ? 'var(--primary)' : 'var(--background-dark)',
                border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-dark)'}`,
                transition: 'all 0.3s ease',
                marginBottom: '8px'
              }}></div>
              
              <span className="step-label" style={{
                fontSize: '0.8rem',
                color: isActive ? 'var(--text-gold)' : 'var(--text-light)',
                opacity: isActive ? 1 : 0.6,
                fontWeight: isCurrent ? 600 : 400,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                position: 'absolute',
                top: '24px',
                transform: 'translateX(-50%)',
                display: index % 2 === 0 || index === currentStepIndex ? 'block' : 'none'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

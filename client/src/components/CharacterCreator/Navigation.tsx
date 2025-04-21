import { Button } from '../UI/Fantasy/Button';
import { playSoundEffect } from '../../lib/soundEffects';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
}

export default function Navigation({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onStart 
}: NavigationProps) {
  
  const handlePrevious = () => {
    playSoundEffect('click');
    onPrevious();
  };
  
  const handleNext = () => {
    playSoundEffect('click');
    onNext();
  };
  
  const handleStart = () => {
    playSoundEffect('success');
    onStart();
  };
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="navigation-container" style={{
      padding: '20px 40px',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      <div>
        {!isFirstStep && (
          <Button variant="secondary" onClick={handlePrevious}>
            <span style={{ marginRight: '8px' }}>◀</span> Previous
          </Button>
        )}
      </div>
      
      <div>
        {isLastStep ? (
          <Button variant="primary" onClick={handleStart}>
            Start New Character
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            Next <span style={{ marginLeft: '8px' }}>▶</span>
          </Button>
        )}
      </div>
    </div>
  );
}

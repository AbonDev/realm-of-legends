import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import StepTracker from './StepTracker';
import Navigation from './Navigation';
import CanvasWrapper from '../CharacterPreview/CanvasWrapper';
import { useCharacter } from '../../lib/stores/useCharacter';
import { playSoundEffect } from '../../lib/soundEffects';

// Import steps
import RaceSelection from './steps/RaceSelection';
import ClassSelection from './steps/ClassSelection';
import AppearanceCustomization from './steps/AppearanceCustomization';
import AttributesAllocation from './steps/AttributesAllocation';
import SkillsSelection from './steps/SkillsSelection';
import BackgroundSelection from './steps/BackgroundSelection';
import EquipmentSelection from './steps/EquipmentSelection';
import CharacterSummary from './steps/CharacterSummary';
import { Panel } from '../UI/Fantasy/Panel';

const steps = [
  { id: 'race', label: 'Race', component: RaceSelection },
  { id: 'class', label: 'Class', component: ClassSelection },
  { id: 'appearance', label: 'Appearance', component: AppearanceCustomization },
  { id: 'attributes', label: 'Attributes', component: AttributesAllocation },
  { id: 'skills', label: 'Skills', component: SkillsSelection },
  { id: 'background', label: 'Background', component: BackgroundSelection },
  { id: 'equipment', label: 'Equipment', component: EquipmentSelection },
  { id: 'summary', label: 'Summary', component: CharacterSummary },
];

interface CreationLayoutProps {
  onFinalize?: () => void;
}

export default function CreationLayout({ onFinalize }: CreationLayoutProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeContent, setActiveContent] = useState<React.ReactNode | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const { resetCharacter } = useCharacter();

  const backgrounds = [
    "url('/src/assets/backgrounds/intro-bg.svg')",
    "url('/src/assets/backgrounds/character-bg.svg')"
  ];

  const CurrentStepComponent = steps[currentStepIndex].component;

  useEffect(() => {
    // Initial animation
    const InitialComponent = steps[currentStepIndex].component;
    setActiveContent(<InitialComponent />);
    gsap.fromTo(
      ".step-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
    
    // Set the background based on step
    if (currentStepIndex === 0) {
      setBackgroundIndex(0);
    } else {
      setBackgroundIndex(1);
    }
  }, []);

  const goToStep = (index: number) => {
    if (isTransitioning || index === currentStepIndex) return;
    if (index < 0 || index >= steps.length) return;
    
    setIsTransitioning(true);
    playSoundEffect('navigate');
    
    // Fade out current content
    gsap.to(".step-content", {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        // Change background if needed
        if (index === 0) {
          setBackgroundIndex(0);
        } else if (currentStepIndex === 0) {
          setBackgroundIndex(1);
        }
        
        // Update step and content
        setCurrentStepIndex(index);
        const StepComponent = steps[index].component;
        setActiveContent(<StepComponent />);
        
        // Fade in new content
        gsap.fromTo(
          ".step-content",
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3,
            onComplete: () => setIsTransitioning(false)
          }
        );
      }
    });
  };

  const goToPreviousStep = () => goToStep(currentStepIndex - 1);
  const goToNextStep = () => goToStep(currentStepIndex + 1);

  const handleStart = () => {
    resetCharacter();
    goToStep(0);
  };

  return (
    <div 
      className="creation-layout" 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: backgrounds[backgroundIndex],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.8s ease-in-out',
      }}
    >
      <header className="creation-header" style={{
        padding: '20px 40px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <h1 style={{
          fontFamily: 'var(--header-font)',
          color: 'var(--text-gold)',
          fontSize: '1.8rem',
          margin: 0
        }}>Character Creation</h1>
        <StepTracker steps={steps} currentStepIndex={currentStepIndex} onStepClick={goToStep} />
      </header>

      <div className="creation-body" style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Left panel for character preview */}
        <div className="character-preview-panel" style={{
          width: '40%',
          height: '100%',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CanvasWrapper />
        </div>

        {/* Right panel for creation steps */}
        <Panel className="creation-step-panel" style={{
          width: '60%',
          height: '100%',
          padding: '0',
          position: 'relative',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="step-content" style={{ padding: '30px', height: '100%' }}>
            {activeContent}
          </div>
        </Panel>
      </div>

      <Navigation 
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onPrevious={goToPreviousStep}
        onNext={() => {
          if (currentStepIndex === steps.length - 1 && onFinalize) {
            // If we're on the last step and onFinalize is provided, call it
            onFinalize();
          } else {
            // Otherwise, just go to the next step
            goToNextStep();
          }
        }}
        onStart={handleStart}
      />
    </div>
  );
}

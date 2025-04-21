import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreationLayout from '../components/CharacterCreator/CreationLayout';
import { Panel } from '../components/UI/Fantasy/Panel';
import { Button } from '../components/UI/Fantasy/Button';
import { useCharacter } from '../lib/stores/useCharacter';
import { playSuccess, playClick } from '../lib/soundEffects';

export default function CharacterCreationPage() {
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [characterStory, setCharacterStory] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const { character } = useCharacter();
  const navigate = useNavigate();
  
  const handleFinalize = () => {
    // This would be called by the CreationLayout when finalizing the character
    playClick();
    setShowFinalizeModal(true);
  };
  
  const generateCharacterStory = async () => {
    setIsGeneratingStory(true);
    
    try {
      // In a real implementation, this would call an AI service to generate
      // a story based on the character's race, class, background, etc.
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a story based on character info
      const story = `In the rolling hills of the western provinces, ${character.name || 'Your character'} was born to a family of ${character.race ? character.race.toLowerCase() : 'common'} ${character.background ? character.background.toLowerCase() : 'folk'}. From an early age, ${character.name || 'your character'} showed a natural talent for the ways of the ${character.class ? character.class.toLowerCase() : 'adventurer'}, impressing even the most seasoned veterans with innate abilities.
      
As the years passed, ${character.name || 'your character'} honed these skills through rigorous training and countless trials. The journey was not without hardship, but with each challenge overcome, ${character.name || 'your character'} grew stronger and more determined.

Now, destiny calls ${character.name || 'your character'} to adventure. Dark forces gather in the shadows, threatening the peace of the realm. Armed with courage, skill, and the lessons of the past, ${character.name || 'your character'} steps forth to meet this threat, ready to write a new chapter in the unfolding saga of a hero's journey.`;
      
      setCharacterStory(story);
      playSuccess();
    } catch (error) {
      console.error('Error generating story:', error);
      setCharacterStory('Failed to generate a story for your character. Please try again.');
    } finally {
      setIsGeneratingStory(false);
    }
  };
  
  const handleStartAdventure = () => {
    // Save character and story to localStorage or a database
    const gameData = {
      character,
      story: characterStory,
      createdAt: new Date().toISOString()
    };
    
    // In a full implementation, you would save this to a database
    localStorage.setItem('currentGameData', JSON.stringify(gameData));
    
    playSuccess();
    navigate('/game');
  };
  
  const handleBackToMenu = () => {
    playClick();
    navigate('/main-menu');
  };
  
  return (
    <div className="character-creation-page" style={{ height: '100vh' }}>
      <CreationLayout onFinalize={handleFinalize} />
      
      {/* Finalize Character Modal */}
      {showFinalizeModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <Panel className="finalize-modal" style={{
            width: '700px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            position: 'relative'
          }}>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowFinalizeModal(false)}
            >
              ✕
            </button>
            
            <h2 className="text-gold text-shadow font-title text-2xl mb-4 text-center">
              Complete Your Character
            </h2>
            
            <div className="character-summary mb-6">
              <h3 className="text-gold font-title text-lg mb-2">Character Summary</h3>
              <div className="bg-gray-900 bg-opacity-50 p-4 rounded-md">
                <p><span className="text-gold">Name:</span> {character.name || 'Unnamed'}</p>
                <p><span className="text-gold">Race:</span> {character.race || 'Not selected'}</p>
                <p><span className="text-gold">Class:</span> {character.class || 'Not selected'}</p>
                <p><span className="text-gold">Background:</span> {character.background || 'Not selected'}</p>
              </div>
            </div>
            
            <div className="character-story mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gold font-title text-lg">Character Backstory</h3>
                {!characterStory && (
                  <Button 
                    size="sm" 
                    onClick={generateCharacterStory}
                    disabled={isGeneratingStory}
                  >
                    {isGeneratingStory ? 'Generating...' : 'Generate Story'}
                  </Button>
                )}
              </div>
              
              {characterStory ? (
                <div className="bg-gray-900 bg-opacity-50 p-4 rounded-md scroll-text font-body">
                  {characterStory.split('\n\n').map((paragraph, index) => (
                    <p key={index} className={index === 0 ? 'first-letter mb-4' : 'mb-4'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900 bg-opacity-50 p-4 rounded-md text-gray-400 italic text-center">
                  {isGeneratingStory 
                    ? 'The AI is crafting your character\'s backstory...' 
                    : 'Generate a backstory for your character to bring them to life.'}
                </div>
              )}
            </div>
            
            <div className="action-buttons flex justify-between">
              <Button variant="ghost" onClick={() => setShowFinalizeModal(false)}>
                Continue Editing
              </Button>
              
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBackToMenu}>
                  Save & Exit
                </Button>
                <Button 
                  onClick={handleStartAdventure} 
                  disabled={!character.name || !characterStory}
                >
                  Begin Adventure
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
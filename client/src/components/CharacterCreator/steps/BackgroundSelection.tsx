import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../UI/Fantasy/Card';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterBackground } from '@shared/schema';
import { playSoundEffect } from '../../../lib/soundEffects';

export default function BackgroundSelection() {
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const { character, updateCharacter } = useCharacter();
  
  const { data: backgrounds = [], isLoading, error } = useQuery<CharacterBackground[]>({
    queryKey: ['/api/game-data/backgrounds'],
  });
  
  useEffect(() => {
    // Initialize selection from character state
    if (character.background) {
      setSelectedBackground(character.background);
    }
  }, [character.background]);
  
  const handleBackgroundSelection = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    updateCharacter({ background: backgroundId });
    playSoundEffect('select');
  };
  
  if (isLoading) {
    return <div className="loading">Loading backgrounds...</div>;
  }
  
  if (error) {
    return <div className="error">Error loading backgrounds: {String(error)}</div>;
  }
  
  return (
    <div className="background-selection">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Choose Your Background</h2>
      
      <p style={{ 
        color: 'var(--text-light)',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '800px'
      }}>
        Your background represents your character's upbringing, early life experiences, 
        and initial training before becoming an adventurer. It shapes your character's 
        identity and provides additional skills.
      </p>
      
      <div className="background-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '2rem'
      }}>
        {backgrounds.map((background) => (
          <Card 
            key={background.id}
            onClick={() => handleBackgroundSelection(background.id)}
            selected={selectedBackground === background.id}
            style={{ 
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s ease',
              transform: selectedBackground === background.id ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <h3 style={{ 
              fontFamily: 'var(--header-font)', 
              color: 'var(--text-gold)',
              marginBottom: '0.5rem'
            }}>{background.name}</h3>
            
            <p style={{ 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-light)'
            }}>{background.description}</p>
            
            <div style={{ marginBottom: '0.8rem' }}>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Skill Bonuses:</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}>
                {background.skillBonuses.map((skill, index) => (
                  <span key={index} style={{ 
                    background: 'rgba(180, 143, 88, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '0.8rem' }}>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Traits:</h4>
              <ul style={{ 
                listStyleType: 'none', 
                padding: 0,
                margin: 0,
                fontSize: '0.85rem'
              }}>
                {background.traits.map((trait, index) => (
                  <li key={index} style={{ marginBottom: '0.3rem' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span style={{ 
                        color: 'var(--text-gold)', 
                        fontSize: '0.7rem' 
                      }}>✦</span>
                      {trait}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Suggested Characteristics:</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}>
                {background.suggestedCharacteristics.map((trait, index) => (
                  <span key={index} style={{ 
                    color: 'var(--text-light)',
                    opacity: 0.8
                  }}>
                    {trait}{index < background.suggestedCharacteristics.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedBackground && (
        <div className="selected-background-info" style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ color: 'var(--text-gold)', marginBottom: '0.5rem' }}>
            Selected Background: {backgrounds.find(b => b.id === selectedBackground)?.name}
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            This background shapes your character's past and provides context for their adventures.
            Your selected skills and proficiencies reflect this background.
          </p>
        </div>
      )}
    </div>
  );
}

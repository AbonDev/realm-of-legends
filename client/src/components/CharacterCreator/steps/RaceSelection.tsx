import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../UI/Fantasy/Card';
import { Tooltip } from '../../UI/Fantasy/Tooltip';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterRace } from '@shared/schema';
import { playSoundEffect } from '../../../lib/soundEffects';

export default function RaceSelection() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const { character, updateCharacter } = useCharacter();
  
  const { data: races = [], isLoading, error } = useQuery<CharacterRace[]>({
    queryKey: ['/api/game-data/races'],
  });
  
  useEffect(() => {
    // Initialize selection from character state, if any
    if (character.race) {
      setSelectedRace(character.race);
    }
  }, [character.race]);
  
  const handleRaceSelection = (raceId: string) => {
    setSelectedRace(raceId);
    updateCharacter({ race: raceId });
    playSoundEffect('select');
  };
  
  if (isLoading) {
    return <div className="loading">Loading races...</div>;
  }
  
  if (error) {
    return <div className="error">Error loading races: {String(error)}</div>;
  }
  
  return (
    <div className="race-selection">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Choose Your Origin</h2>
      
      <p style={{ 
        color: 'var(--text-light)',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '800px'
      }}>
        Your race defines your character's appearance and natural talents. 
        Each race has unique abilities and traits that will influence your 
        journey in the world of Avara.
      </p>
      
      <div className="race-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '2rem'
      }}>
        {races.map((race) => (
          <Card 
            key={race.id}
            onClick={() => handleRaceSelection(race.id)}
            selected={selectedRace === race.id}
            style={{ 
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s ease',
              transform: selectedRace === race.id ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <h3 style={{ 
              fontFamily: 'var(--header-font)', 
              color: 'var(--text-gold)',
              marginBottom: '0.5rem'
            }}>{race.name}</h3>
            
            <p style={{ 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-light)'
            }}>{race.description}</p>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Attribute Modifiers:</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}>
                {Object.entries(race.attributeModifiers).map(([attr, value]) => (
                  <span key={attr} style={{ 
                    background: 'rgba(180, 143, 88, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)'
                  }}>
                    {attr.charAt(0).toUpperCase() + attr.slice(1)} +{value}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Racial Abilities:</h4>
              <ul style={{ 
                listStyleType: 'none', 
                padding: 0,
                margin: 0,
                fontSize: '0.85rem'
              }}>
                {race.abilities.map((ability, index) => (
                  <li key={index} style={{ marginBottom: '0.3rem' }}>
                    <Tooltip content={`Ability description for ${ability}`}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'help'
                      }}>
                        <span style={{ 
                          color: 'var(--text-gold)', 
                          fontSize: '0.7rem' 
                        }}>✦</span>
                        {ability}
                      </span>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedRace && (
        <div className="selected-race-info" style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ color: 'var(--text-gold)', marginBottom: '0.5rem' }}>
            Selected Origin: {races.find(r => r.id === selectedRace)?.name}
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            Your choice will influence your appearance, abilities, and how the world perceives you.
            Continue to the next step to select your class.
          </p>
        </div>
      )}
    </div>
  );
}

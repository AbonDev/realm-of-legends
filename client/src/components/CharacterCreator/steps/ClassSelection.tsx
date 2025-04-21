import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../UI/Fantasy/Card';
import { Tooltip } from '../../UI/Fantasy/Tooltip';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterClass } from '@shared/schema';
import { playSoundEffect } from '../../../lib/soundEffects';

export default function ClassSelection() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { character, updateCharacter } = useCharacter();
  
  const { data: classes = [], isLoading, error } = useQuery<CharacterClass[]>({
    queryKey: ['/api/game-data/classes'],
  });
  
  useEffect(() => {
    // Initialize selection from character state
    if (character.class) {
      setSelectedClass(character.class);
    }
  }, [character.class]);
  
  const handleClassSelection = (classId: string) => {
    setSelectedClass(classId);
    updateCharacter({ class: classId });
    playSoundEffect('select');
  };
  
  if (isLoading) {
    return <div className="loading">Loading classes...</div>;
  }
  
  if (error) {
    return <div className="error">Error loading classes: {String(error)}</div>;
  }
  
  return (
    <div className="class-selection">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Choose Your Class</h2>
      
      <p style={{ 
        color: 'var(--text-light)',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '800px'
      }}>
        Your class defines your character's abilities, combat style, and role in the world.
        Each class has unique skills and specializations that will shape your approach to 
        challenges and adventures.
      </p>
      
      <div className="class-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '2rem'
      }}>
        {classes.map((cls) => (
          <Card 
            key={cls.id}
            onClick={() => handleClassSelection(cls.id)}
            selected={selectedClass === cls.id}
            style={{ 
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s ease',
              transform: selectedClass === cls.id ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <h3 style={{ 
              fontFamily: 'var(--header-font)', 
              color: 'var(--text-gold)',
              marginBottom: '0.5rem'
            }}>{cls.name}</h3>
            
            <p style={{ 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-light)'
            }}>{cls.description}</p>
            
            <div style={{ marginBottom: '0.8rem' }}>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Primary Attribute:</h4>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(180, 143, 88, 0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem'
              }}>
                {cls.primaryAttribute.charAt(0).toUpperCase() + cls.primaryAttribute.slice(1)}
              </div>
            </div>
            
            <div>
              <h4 style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>Class Abilities:</h4>
              <ul style={{ 
                listStyleType: 'none', 
                padding: 0,
                margin: 0,
                fontSize: '0.85rem'
              }}>
                {cls.abilities.map((ability, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <Tooltip content={ability.description}>
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
                        <strong>{ability.name}</strong> (Level {ability.level})
                      </span>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedClass && (
        <div className="selected-class-info" style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ color: 'var(--text-gold)', marginBottom: '0.5rem' }}>
            Selected Class: {classes.find(c => c.id === selectedClass)?.name}
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            This class will determine your combat style, special abilities, and role in the party.
            Continue to customize your character's appearance.
          </p>
        </div>
      )}
    </div>
  );
}

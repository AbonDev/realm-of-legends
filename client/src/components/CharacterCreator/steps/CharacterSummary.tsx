import { useState } from 'react';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { Button } from '../../UI/Fantasy/Button';
import { apiRequest } from '../../../lib/queryClient';
import { Card } from '../../UI/Fantasy/Card';
import { playSoundEffect } from '../../../lib/soundEffects';
import { useQuery } from '@tanstack/react-query';
import { CharacterRace, CharacterClass, CharacterBackground } from '@shared/schema';

export default function CharacterSummary() {
  const { character, resetCharacter } = useCharacter();
  const [characterName, setCharacterName] = useState(character.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Get reference data for showing names instead of IDs
  const { data: races = [] } = useQuery<CharacterRace[]>({
    queryKey: ['/api/game-data/races'],
  });
  
  const { data: classes = [] } = useQuery<CharacterClass[]>({
    queryKey: ['/api/game-data/classes'],
  });
  
  const { data: backgrounds = [] } = useQuery<CharacterBackground[]>({
    queryKey: ['/api/game-data/backgrounds'],
  });
  
  const getRaceName = (id: string) => races.find(r => r.id === id)?.name || id;
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || id;
  const getBackgroundName = (id: string) => backgrounds.find(b => b.id === id)?.name || id;
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterName(e.target.value);
    // Update character state with the new name
    useCharacter.getState().updateCharacter({ name: e.target.value });
  };
  
  const handleSaveCharacter = async () => {
    if (!characterName.trim()) {
      setSaveError('Please provide a character name');
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    
    try {
      // Save character to API
      const response = await apiRequest('POST', '/api/characters', {
        ...character,
        name: characterName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        playSoundEffect('success');
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || 'Failed to save character');
        playSoundEffect('error');
      }
    } catch (error) {
      setSaveError(String(error) || 'An unexpected error occurred');
      playSoundEffect('error');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="character-summary">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Character Summary</h2>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div className="name-input" style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="character-name" 
            style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-gold)',
              fontSize: '1.1rem'
            }}
          >
            Character Name
          </label>
          <input
            id="character-name"
            type="text"
            value={characterName}
            onChange={handleNameChange}
            placeholder="Enter character name"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-light)',
              borderRadius: '4px',
              fontSize: '1rem',
              color: 'var(--text-light)',
              fontFamily: 'var(--body-font)'
            }}
          />
        </div>
        
        <Card style={{ marginBottom: '1rem' }}>
          <h3 style={{ 
            color: 'var(--text-gold)', 
            marginBottom: '1rem',
            fontFamily: 'var(--header-font)',
            fontSize: '1.2rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '0.5rem'
          }}>Character Overview</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Race</h4>
              <p>{getRaceName(character.race || '')}</p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Class</h4>
              <p>{getClassName(character.class || '')}</p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Background</h4>
              <p>{getBackgroundName(character.background || '')}</p>
            </div>
          </div>
        </Card>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Card style={{ flex: 1 }}>
            <h3 style={{ 
              color: 'var(--text-gold)', 
              marginBottom: '1rem',
              fontFamily: 'var(--header-font)',
              fontSize: '1.2rem',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.5rem'
            }}>Attributes</h3>
            
            {character.attributes && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem'
              }}>
                {Object.entries(character.attributes).map(([attr, value]) => (
                  <div key={attr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{attr}</span>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: value >= 16 ? 'var(--text-gold)' : 'var(--text-light)'
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          <Card style={{ flex: 1 }}>
            <h3 style={{ 
              color: 'var(--text-gold)', 
              marginBottom: '1rem',
              fontFamily: 'var(--header-font)',
              fontSize: '1.2rem',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.5rem'
            }}>Appearance</h3>
            
            {character.appearance && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Body Type</span>
                  <span style={{ textTransform: 'capitalize' }}>{character.appearance.bodyType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Skin Tone</span>
                  <span style={{ textTransform: 'capitalize' }}>{character.appearance.skinTone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hair</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {character.appearance.hairStyle} {character.appearance.hairColor}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Eyes</span>
                  <span style={{ textTransform: 'capitalize' }}>{character.appearance.eyeColor}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
        
        <Card>
          <h3 style={{ 
            color: 'var(--text-gold)', 
            marginBottom: '1rem',
            fontFamily: 'var(--header-font)',
            fontSize: '1.2rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '0.5rem'
          }}>Equipment</h3>
          
          {character.equipment && character.equipment.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem' 
            }}>
              {character.equipment.map((item, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(180, 143, 88, 0.2)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p>No equipment selected</p>
          )}
        </Card>
        
        <div className="save-character" style={{ marginTop: '1rem' }}>
          <Button 
            variant="primary" 
            onClick={handleSaveCharacter}
            disabled={isSaving || !characterName.trim()}
            style={{ width: '100%', padding: '14px' }}
          >
            {isSaving ? 'Saving...' : 'Save Character'}
          </Button>
          
          {saveSuccess && (
            <div style={{ 
              marginTop: '1rem',
              padding: '12px',
              background: 'rgba(39, 174, 96, 0.2)',
              border: '1px solid #27AE60',
              borderRadius: '4px',
              color: '#E0F2E9'
            }}>
              Character successfully saved! Your adventure awaits.
            </div>
          )}
          
          {saveError && (
            <div style={{ 
              marginTop: '1rem',
              padding: '12px',
              background: 'rgba(235, 87, 87, 0.2)',
              border: '1px solid #EB5757',
              borderRadius: '4px',
              color: '#F8E0E0'
            }}>
              Error: {saveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Select } from '../../UI/Fantasy/Select';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterAppearance } from '@shared/schema';
import { playSoundEffect } from '../../../lib/soundEffects';

// Appearance options
const bodyTypes = [
  { value: 'athletic', label: 'Athletic' },
  { value: 'slim', label: 'Slim' },
  { value: 'muscular', label: 'Muscular' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'average', label: 'Average' }
];

const skinTones = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'tan', label: 'Tan' },
  { value: 'dark', label: 'Dark' },
  { value: 'very-dark', label: 'Very Dark' },
  { value: 'pale-green', label: 'Pale Green (Elf)' },
  { value: 'ashen', label: 'Ashen (Undead)' }
];

const hairStyles = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'bald', label: 'Bald' },
  { value: 'mohawk', label: 'Mohawk' },
  { value: 'ponytail', label: 'Ponytail' },
  { value: 'braided', label: 'Braided' }
];

const hairColors = [
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'grey', label: 'Grey' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' }
];

const faceShapes = [
  { value: 'oval', label: 'Oval' },
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'heart', label: 'Heart' },
  { value: 'angular', label: 'Angular' }
];

const eyeColors = [
  { value: 'brown', label: 'Brown' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'grey', label: 'Grey' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'amber', label: 'Amber' },
  { value: 'red', label: 'Red' },
  { value: 'purple', label: 'Purple' },
  { value: 'yellow', label: 'Yellow' }
];

const facialHairOptions = [
  { value: 'none', label: 'None' },
  { value: 'stubble', label: 'Stubble' },
  { value: 'mustache', label: 'Mustache' },
  { value: 'goatee', label: 'Goatee' },
  { value: 'full-beard', label: 'Full Beard' },
  { value: 'short-beard', label: 'Short Beard' }
];

export default function AppearanceCustomization() {
  const { character, updateCharacter } = useCharacter();
  const [appearance, setAppearance] = useState<CharacterAppearance>({
    bodyType: 'average',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'brown',
    faceShape: 'oval',
    eyeColor: 'brown',
    facialHair: 'none',
    scars: [],
    tattoos: []
  });
  
  useEffect(() => {
    // Initialize from character state
    if (character.appearance) {
      setAppearance(character.appearance);
    }
  }, [character.appearance]);
  
  const handleChange = (key: keyof CharacterAppearance, value: string) => {
    const updatedAppearance = { ...appearance, [key]: value };
    setAppearance(updatedAppearance);
    updateCharacter({ appearance: updatedAppearance });
    playSoundEffect('select');
  };

  return (
    <div className="appearance-customization">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Customize Your Appearance</h2>
      
      <p style={{ 
        color: 'var(--text-light)',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '800px'
      }}>
        Define your character's physical appearance. These choices will affect how 
        your character is visualized and how certain NPCs might react to you.
      </p>
      
      <div className="appearance-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '2rem'
      }}>
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Body Type</label>
          <Select 
            options={bodyTypes}
            value={appearance.bodyType} 
            onChange={(value) => handleChange('bodyType', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Skin Tone</label>
          <Select 
            options={skinTones}
            value={appearance.skinTone} 
            onChange={(value) => handleChange('skinTone', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Hair Style</label>
          <Select 
            options={hairStyles}
            value={appearance.hairStyle} 
            onChange={(value) => handleChange('hairStyle', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Hair Color</label>
          <Select 
            options={hairColors}
            value={appearance.hairColor} 
            onChange={(value) => handleChange('hairColor', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Face Shape</label>
          <Select 
            options={faceShapes}
            value={appearance.faceShape} 
            onChange={(value) => handleChange('faceShape', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Eye Color</label>
          <Select 
            options={eyeColors}
            value={appearance.eyeColor} 
            onChange={(value) => handleChange('eyeColor', value)}
          />
        </div>
        
        <div className="appearance-group">
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-gold)',
            fontSize: '1rem'
          }}>Facial Hair</label>
          <Select 
            options={facialHairOptions}
            value={appearance.facialHair || 'none'} 
            onChange={(value) => handleChange('facialHair', value)}
          />
        </div>
      </div>
      
      <div className="appearance-preview" style={{
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        border: '1px solid var(--border-light)',
        marginTop: '1rem'
      }}>
        <h3 style={{ 
          color: 'var(--text-gold)', 
          marginBottom: '0.5rem',
          fontFamily: 'var(--header-font)'
        }}>Character Preview</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Your character's appearance is updating in real-time in the preview panel.
          These choices are purely aesthetic and don't affect gameplay mechanics.
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterAttributes } from '@shared/schema';
import { Button } from '../../UI/Fantasy/Button';
import { Tooltip } from '../../UI/Fantasy/Tooltip';
import { playSoundEffect } from '../../../lib/soundEffects';

// Attribute descriptions
const attributeDescriptions = {
  might: "Physical strength and raw power. Affects damage with melee weapons, carrying capacity, and athletic prowess.",
  finesse: "Agility, reflexes, and hand-eye coordination. Affects accuracy, evasion, and stealth.",
  constitution: "Physical endurance and toughness. Affects health points, resistance to poisons, and stamina.",
  intellect: "Mental acuity, memory, and logical reasoning. Affects spell power, knowledge skills, and learning ability.",
  wisdom: "Intuition, willpower, and perception. Affects awareness, insight, and connection to the natural world.",
  presence: "Force of personality, charisma, and social influence. Affects persuasion, intimidation, and leadership."
};

export default function AttributesAllocation() {
  const { character, updateCharacter } = useCharacter();
  const [attributes, setAttributes] = useState<CharacterAttributes>({
    might: 10,
    finesse: 10,
    constitution: 10,
    intellect: 10,
    wisdom: 10,
    presence: 10
  });
  const [pointsRemaining, setPointsRemaining] = useState(20);
  const [baseAttributes] = useState({
    might: 10,
    finesse: 10,
    constitution: 10,
    intellect: 10,
    wisdom: 10,
    presence: 10
  });
  
  useEffect(() => {
    // Initialize from character state
    if (character.attributes) {
      setAttributes(character.attributes);
      
      // Calculate remaining points
      const usedPoints = Object.values(character.attributes).reduce(
        (total, value) => total + (value - 10), 
        0
      );
      setPointsRemaining(20 - usedPoints);
    }
  }, [character.attributes]);
  
  const handleIncrement = (attr: keyof CharacterAttributes) => {
    if (pointsRemaining <= 0 || attributes[attr] >= 18) return;
    
    const newAttributes = { ...attributes, [attr]: attributes[attr] + 1 };
    setAttributes(newAttributes);
    setPointsRemaining(prev => prev - 1);
    updateCharacter({ attributes: newAttributes });
    playSoundEffect('click');
  };
  
  const handleDecrement = (attr: keyof CharacterAttributes) => {
    if (attributes[attr] <= baseAttributes[attr as keyof typeof baseAttributes]) return;
    
    const newAttributes = { ...attributes, [attr]: attributes[attr] - 1 };
    setAttributes(newAttributes);
    setPointsRemaining(prev => prev + 1);
    updateCharacter({ attributes: newAttributes });
    playSoundEffect('click');
  };
  
  const getAttributeModifier = (value: number) => {
    return Math.floor((value - 10) / 2);
  };
  
  const formatModifier = (mod: number) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  const getScoreColor = (value: number) => {
    if (value >= 16) return 'var(--text-gold)';
    if (value >= 13) return '#a0c8e0';
    return 'var(--text-light)';
  };
  
  return (
    <div className="attributes-allocation">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Allocate Attributes</h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <p style={{ 
          color: 'var(--text-light)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '600px'
        }}>
          Attributes define your character's core abilities and strengths.
          Distribute your points wisely based on your chosen class and playstyle.
        </p>
        
        <div style={{
          background: 'rgba(180, 143, 88, 0.2)',
          padding: '10px 20px',
          borderRadius: '4px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            Points Remaining
          </span>
          <span style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: pointsRemaining === 0 ? 'var(--text-gold)' : 'var(--primary)'
          }}>
            {pointsRemaining}
          </span>
        </div>
      </div>
      
      <div className="attributes-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
        marginBottom: '2rem'
      }}>
        {Object.entries(attributes).map(([key, value]) => {
          const attrKey = key as keyof CharacterAttributes;
          const modifier = getAttributeModifier(value);
          
          return (
            <div 
              key={key} 
              className="attribute-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                border: '1px solid var(--border-light)'
              }}
            >
              <Tooltip content={attributeDescriptions[attrKey]}>
                <div className="attribute-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontFamily: 'var(--header-font)',
                    color: 'var(--text-gold)',
                    cursor: 'help'
                  }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
              </Tooltip>
              
              <div className="attribute-controls" style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '10px'
              }}>
                <Button 
                  variant="secondary" 
                  onClick={() => handleDecrement(attrKey)}
                  disabled={value <= baseAttributes[attrKey]}
                  style={{ padding: '4px 8px', minWidth: 'unset' }}
                >
                  -
                </Button>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '60px'
                }}>
                  <span style={{ 
                    fontSize: '1.4rem', 
                    color: getScoreColor(value),
                    fontWeight: 'bold'
                  }}>
                    {value}
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: modifier >= 0 ? 'var(--text-gold)' : '#e57373'
                  }}>
                    {formatModifier(modifier)}
                  </span>
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={() => handleIncrement(attrKey)}
                  disabled={pointsRemaining <= 0 || value >= 18}
                  style={{ padding: '4px 8px', minWidth: 'unset' }}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        border: '1px solid var(--border-light)'
      }}>
        <h3 style={{ 
          color: 'var(--text-gold)', 
          marginBottom: '0.5rem',
          fontFamily: 'var(--header-font)'
        }}>Attribute Guidelines</h3>
        <ul style={{ 
          listStyleType: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.9rem'
        }}>
          <li style={{ marginBottom: '0.3rem' }}>• Score of 10 is average for a typical person</li>
          <li style={{ marginBottom: '0.3rem' }}>• 13-15 represents significant training or talent</li>
          <li style={{ marginBottom: '0.3rem' }}>• 16-18 represents exceptional ability, among the best</li>
          <li>• Focus on attributes that complement your class and playstyle</li>
        </ul>
      </div>
    </div>
  );
}

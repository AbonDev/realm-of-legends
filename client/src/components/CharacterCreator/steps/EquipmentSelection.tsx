import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterClass } from '@shared/schema';
import { Card } from '../../UI/Fantasy/Card';
import { Button } from '../../UI/Fantasy/Button';
import { playSoundEffect } from '../../../lib/soundEffects';

// Custom equipment items beyond starting equipment
const additionalEquipment = [
  { id: 'healing-potion', name: 'Healing Potion', description: 'Restores health when consumed', category: 'consumable' },
  { id: 'torch', name: 'Torch', description: 'Provides light in dark areas', category: 'gear' },
  { id: 'rope', name: 'Rope (50ft)', description: 'Useful for climbing and binding', category: 'gear' },
  { id: 'bedroll', name: 'Bedroll', description: 'For resting comfortably', category: 'gear' },
  { id: 'waterskin', name: 'Waterskin', description: 'Holds water for drinking', category: 'gear' },
  { id: 'rations', name: 'Rations (5 days)', description: 'Food for traveling', category: 'consumable' },
  { id: 'backpack', name: 'Backpack', description: 'Holds your equipment', category: 'gear' },
  { id: 'lantern', name: 'Lantern', description: 'Provides better light than a torch', category: 'gear' },
  { id: 'flint-steel', name: 'Flint and Steel', description: 'For starting fires', category: 'gear' },
  { id: 'poison-vial', name: 'Vial of Poison', description: 'Can be applied to weapons', category: 'consumable' },
  { id: 'lock-picks', name: 'Lock Picks', description: 'For opening locks without keys', category: 'tool' },
  { id: 'grappling-hook', name: 'Grappling Hook', description: 'For climbing and reaching', category: 'gear' }
];

export default function EquipmentSelection() {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const { character, updateCharacter } = useCharacter();
  
  const { data: classes = [], isLoading, error } = useQuery<CharacterClass[]>({
    queryKey: ['/api/game-data/classes'],
  });
  
  useEffect(() => {
    // Initialize selection from character state
    if (character.equipment && character.equipment.length > 0) {
      setSelectedEquipment(character.equipment);
    } else if (character.class && classes && classes.length > 0) {
      // Find class starting equipment
      const characterClass = classes.find(c => c.id === character.class);
      if (characterClass) {
        setSelectedEquipment(characterClass.startingEquipment);
        updateCharacter({ equipment: characterClass.startingEquipment });
      }
    }
  }, [character.equipment, character.class, classes]);
  
  const handleToggleEquipment = (item: string) => {
    let newEquipment;
    
    if (selectedEquipment.includes(item)) {
      // Remove item
      newEquipment = selectedEquipment.filter(i => i !== item);
      playSoundEffect('click');
    } else {
      // Add item
      newEquipment = [...selectedEquipment, item];
      playSoundEffect('select');
    }
    
    setSelectedEquipment(newEquipment);
    updateCharacter({ equipment: newEquipment });
  };
  
  if (isLoading) {
    return <div className="loading">Loading equipment options...</div>;
  }
  
  if (error) {
    return <div className="error">Error loading equipment: {String(error)}</div>;
  }
  
  // Find current class for starting equipment
  const currentClass = classes.find(c => c.id === character.class);
  
  return (
    <div className="equipment-selection">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Select Equipment</h2>
      
      <p style={{ 
        color: 'var(--text-light)',
        marginBottom: '1rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '800px'
      }}>
        Every adventurer needs gear to survive. Your class provides starting equipment, 
        but you can customize your loadout to suit your needs.
      </p>
      
      {currentClass && (
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            color: 'var(--text-gold)', 
            marginBottom: '0.5rem',
            fontFamily: 'var(--header-font)'
          }}>
            {currentClass.name} Starting Equipment
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            The following items are automatically provided to you based on your class.
            You can deselect any items you don't want.
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {currentClass.startingEquipment.map((item) => (
              <button
                key={item}
                onClick={() => handleToggleEquipment(item)}
                style={{
                  padding: '6px 12px',
                  background: selectedEquipment.includes(item) 
                    ? 'rgba(180, 143, 88, 0.4)' 
                    : 'rgba(60, 60, 60, 0.4)',
                  border: selectedEquipment.includes(item)
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-dark)',
                  borderRadius: '4px',
                  color: selectedEquipment.includes(item) 
                    ? 'var(--text-gold)' 
                    : 'var(--text-light)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {item}
                {selectedEquipment.includes(item) ? ' ✓' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <h3 style={{ 
        color: 'var(--text-gold)', 
        marginBottom: '1rem',
        fontFamily: 'var(--header-font)'
      }}>
        Additional Equipment
      </h3>
      
      <div className="equipment-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '2rem'
      }}>
        {additionalEquipment.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleToggleEquipment(item.name)}
            selected={selectedEquipment.includes(item.name)}
            style={{ 
              cursor: 'pointer',
              height: '100%',
              padding: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--body-font)', 
                color: 'var(--text-light)',
                fontSize: '1rem',
                marginBottom: '0.3rem'
              }}>
                {item.name}
              </h4>
              
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selectedEquipment.includes(item.name) 
                  ? 'var(--primary)' 
                  : 'transparent'
              }}>
                {selectedEquipment.includes(item.name) && (
                  <span style={{ color: 'black', fontSize: '0.8rem' }}>✓</span>
                )}
              </div>
            </div>
            
            <p style={{ 
              fontSize: '0.85rem',
              color: 'var(--text-light)',
              opacity: 0.8,
              marginBottom: '0.5rem'
            }}>
              {item.description}
            </p>
            
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              padding: '2px 6px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              color: 'var(--text-light)',
              opacity: 0.7
            }}>
              {item.category}
            </span>
          </Card>
        ))}
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
          fontFamily: 'var(--header-font)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 5L12 2L8.5 5M12 22V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 9H2V22H22V9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Equipment Summary
        </h3>
        
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          You have selected {selectedEquipment.length} items. Here's your current loadout:
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {selectedEquipment.map((item, index) => (
            <span 
              key={index}
              style={{
                padding: '6px 12px',
                background: 'rgba(180, 143, 88, 0.2)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {item}
              <button
                onClick={() => handleToggleEquipment(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(80, 80, 80, 0.5)'
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        
        {selectedEquipment.length === 0 && (
          <p style={{ fontSize: '0.9rem', color: '#e57373' }}>
            Warning: You currently have no equipment selected. This may make survival difficult.
          </p>
        )}
      </div>
    </div>
  );
}

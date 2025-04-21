import { useState, useEffect } from 'react';
import { useCharacter } from '../../../lib/stores/useCharacter';
import { CharacterSkills } from '@shared/schema';
import { Tooltip } from '../../UI/Fantasy/Tooltip';
import { playSoundEffect } from '../../../lib/soundEffects';

// Skill details
const skillsList = [
  { id: 'acrobatics', name: 'Acrobatics', attribute: 'finesse', description: 'Your ability to perform feats of agility, balance, and coordination.' },
  { id: 'athletics', name: 'Athletics', attribute: 'might', description: 'Your physical prowess in activities like climbing, jumping, and swimming.' },
  { id: 'deception', name: 'Deception', attribute: 'presence', description: 'Your ability to convincingly hide the truth or tell a lie.' },
  { id: 'insight', name: 'Insight', attribute: 'wisdom', description: 'Your ability to determine the true intentions of others.' },
  { id: 'intimidation', name: 'Intimidation', attribute: 'presence', description: 'Your ability to influence others through threats or displays of power.' },
  { id: 'investigation', name: 'Investigation', attribute: 'intellect', description: 'Your ability to search for clues and deduce information from evidence.' },
  { id: 'lore', name: 'Lore', attribute: 'intellect', description: 'Your knowledge of history, legends, and the wider world.' },
  { id: 'medicine', name: 'Medicine', attribute: 'wisdom', description: 'Your ability to stabilize the dying or diagnose illnesses.' },
  { id: 'nature', name: 'Nature', attribute: 'wisdom', description: 'Your knowledge of terrain, plants, animals, and the natural world.' },
  { id: 'perception', name: 'Perception', attribute: 'wisdom', description: 'Your awareness of the environment and ability to notice things.' },
  { id: 'performance', name: 'Performance', attribute: 'presence', description: 'Your ability to delight an audience with music, dance, or acting.' },
  { id: 'persuasion', name: 'Persuasion', attribute: 'presence', description: 'Your ability to influence others through tact, social grace, or good nature.' },
  { id: 'religion', name: 'Religion', attribute: 'intellect', description: 'Your knowledge of deities, rites, and religious practices.' },
  { id: 'sleight', name: 'Sleight of Hand', attribute: 'finesse', description: 'Your ability to perform fine manipulation and hand tricks.' },
  { id: 'stealth', name: 'Stealth', attribute: 'finesse', description: 'Your ability to hide, move silently, and avoid detection.' },
  { id: 'survival', name: 'Survival', attribute: 'wisdom', description: 'Your ability to navigate, track, hunt, and survive in the wilderness.' }
];

export default function SkillsSelection() {
  const { character, updateCharacter } = useCharacter();
  const [skills, setSkills] = useState<CharacterSkills>({});
  const [pointsRemaining, setPointsRemaining] = useState(10);
  
  useEffect(() => {
    // Initialize from character state or with zeroes
    if (character.skills && Object.keys(character.skills).length > 0) {
      setSkills(character.skills);
      
      // Calculate remaining points
      const usedPoints = Object.values(character.skills).reduce(
        (total, value) => total + value, 
        0
      );
      setPointsRemaining(10 - usedPoints);
    } else {
      // Initialize all skills to 0
      const initialSkills: CharacterSkills = {};
      skillsList.forEach(skill => {
        initialSkills[skill.id] = 0;
      });
      setSkills(initialSkills);
    }
  }, [character.skills]);
  
  const handleIncrement = (skillId: string) => {
    if (pointsRemaining <= 0 || (skills[skillId] || 0) >= 3) return;
    
    const newSkills = { ...skills, [skillId]: (skills[skillId] || 0) + 1 };
    setSkills(newSkills);
    setPointsRemaining(prev => prev - 1);
    updateCharacter({ skills: newSkills });
    playSoundEffect('click');
  };
  
  const handleDecrement = (skillId: string) => {
    if ((skills[skillId] || 0) <= 0) return;
    
    const newSkills = { ...skills, [skillId]: (skills[skillId] || 0) - 1 };
    setSkills(newSkills);
    setPointsRemaining(prev => prev + 1);
    updateCharacter({ skills: newSkills });
    playSoundEffect('click');
  };
  
  const getAttributeColor = (attribute: string) => {
    switch (attribute) {
      case 'might': return '#e57373';
      case 'finesse': return '#81c784';
      case 'constitution': return '#f4a742';
      case 'intellect': return '#64b5f6';
      case 'wisdom': return '#ba68c8';
      case 'presence': return '#ffb74d';
      default: return 'var(--text-light)';
    }
  };
  
  return (
    <div className="skills-selection">
      <h2 style={{ 
        fontFamily: 'var(--header-font)', 
        color: 'var(--text-gold)',
        marginBottom: '1.5rem'
      }}>Select Skills</h2>
      
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
          Skills represent specialized areas of expertise. Allocate points to skills 
          that complement your character's background and abilities.
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
      
      <div className="skills-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '2rem'
      }}>
        {skillsList.map((skill) => (
          <div 
            key={skill.id} 
            className="skill-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              border: '1px solid var(--border-dark)'
            }}
          >
            <Tooltip content={skill.description}>
              <div className="skill-info" style={{ cursor: 'help' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    fontSize: '1rem', 
                    color: 'var(--text-light)',
                  }}>
                    {skill.name}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem',
                    color: getAttributeColor(skill.attribute),
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    ({skill.attribute.slice(0, 3)})
                  </span>
                </div>
              </div>
            </Tooltip>
            
            <div className="skill-controls" style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handleDecrement(skill.id)}
                disabled={(skills[skill.id] || 0) <= 0}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: (skills[skill.id] || 0) <= 0 ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border-light)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: (skills[skill.id] || 0) <= 0 ? 'var(--border-light)' : 'var(--text-light)',
                  opacity: (skills[skill.id] || 0) <= 0 ? 0.5 : 1
                }}
              >
                -
              </button>
              
              <div className="skill-rank" style={{
                display: 'flex',
                gap: '4px'
              }}>
                {[0, 1, 2, 3].map((rank) => (
                  <div
                    key={rank}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: rank <= (skills[skill.id] || 0) - 1 ? 'var(--primary)' : 'transparent',
                      border: '1px solid var(--border-light)'
                    }}
                  />
                ))}
              </div>
              
              <button
                onClick={() => handleIncrement(skill.id)}
                disabled={pointsRemaining <= 0 || (skills[skill.id] || 0) >= 3}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: pointsRemaining <= 0 || (skills[skill.id] || 0) >= 3 ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border-light)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: pointsRemaining <= 0 || (skills[skill.id] || 0) >= 3 ? 'var(--border-light)' : 'var(--text-light)',
                  opacity: pointsRemaining <= 0 || (skills[skill.id] || 0) >= 3 ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>
          </div>
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
          fontFamily: 'var(--header-font)'
        }}>Skill Proficiency Levels</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong style={{ color: 'var(--text-gold)' }}>○○○○ - Untrained</strong>
            <p>No special training</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-gold)' }}>●○○○ - Novice</strong>
            <p>Basic understanding</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-gold)' }}>●●○○ - Adept</strong>
            <p>Considerable training</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-gold)' }}>●●●○ - Expert</strong>
            <p>Extensive mastery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Panel } from '../UI/Fantasy/Panel';
import CharacterModel from './CharacterModel';

export default function CanvasWrapper() {
  const { character } = useCharacter();
  
  return (
    <div className="canvas-wrapper" style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Character preview scene */}
      <Canvas
        shadows
        style={{ background: 'transparent' }}
        camera={{ position: [0, 1.5, 3], fov: 45 }}
      >
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </Canvas>
      
      {/* Character info overlay */}
      <div className="character-info-overlay" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }}>
        <Panel style={{
          padding: '15px',
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{
            fontFamily: 'var(--header-font)',
            color: 'var(--text-gold)',
            margin: 0,
            marginBottom: '5px',
            fontSize: '1.2rem'
          }}>
            {character.name || 'Unnamed Character'}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            fontSize: '0.9rem'
          }}>
            {character.race && (
              <span>{character.race.charAt(0).toUpperCase() + character.race.slice(1)}</span>
            )}
            
            {character.class && (
              <>
                <span style={{ opacity: 0.7 }}>•</span>
                <span>{character.class.charAt(0).toUpperCase() + character.class.slice(1)}</span>
              </>
            )}
            
            {character.background && (
              <>
                <span style={{ opacity: 0.7 }}>•</span>
                <span>{character.background.charAt(0).toUpperCase() + character.background.slice(1)}</span>
              </>
            )}
          </div>
        </Panel>
      </div>
      
      {/* "Preview Only" indicator */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'rgba(0,0,0,0.7)',
        color: 'var(--text-light)',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        opacity: 0.7
      }}>
        Preview
      </div>
    </div>
  );
}

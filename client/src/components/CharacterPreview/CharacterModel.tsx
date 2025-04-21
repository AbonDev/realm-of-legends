import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useAnimations } from '@react-three/drei';
import { useCharacter } from '../../lib/stores/useCharacter';

// Character model with appearance customization
export default function CharacterModel() {
  const group = useRef<THREE.Group>(null);
  const { character } = useCharacter();
  const { camera } = useThree();
  
  // Position camera for a good view of the character
  useEffect(() => {
    if (camera) {
      camera.position.set(0, 1.5, 2.5);
      camera.lookAt(0, 1, 0);
    }
  }, [camera]);
  
  // Rotate the character slightly for a more dynamic pose
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.1;
    }
  });

  // Placeholder character using a simple mesh group
  // In a real application, this would use actual 3D models
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Base body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
        <meshStandardMaterial 
          color={getBodyColor(character.appearance?.skinTone || 'medium')} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={getBodyColor(character.appearance?.skinTone || 'medium')} 
          roughness={0.7} 
        />
        
        {/* Eyes */}
        <group position={[0, 0, 0.3]}>
          <mesh position={[-0.15, 0.05, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={getEyeColor(character.appearance?.eyeColor || 'brown')} />
          </mesh>
          <mesh position={[0.15, 0.05, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={getEyeColor(character.appearance?.eyeColor || 'brown')} />
          </mesh>
        </group>
      </mesh>
      
      {/* Hair */}
      {character.appearance?.hairStyle !== 'bald' && (
        <mesh position={[0, 2.25, 0]} scale={1.1}>
          <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={getHairColor(character.appearance?.hairColor || 'brown')} 
            roughness={0.9} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Left arm */}
      <mesh position={[-0.5, 1.1, 0]} rotation={[0, 0, -Math.PI / 16]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 16]} />
        <meshStandardMaterial 
          color={getBodyColor(character.appearance?.skinTone || 'medium')} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Right arm */}
      <mesh position={[0.5, 1.1, 0]} rotation={[0, 0, Math.PI / 16]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 16]} />
        <meshStandardMaterial 
          color={getBodyColor(character.appearance?.skinTone || 'medium')} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Left leg */}
      <mesh position={[-0.2, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>
      
      {/* Right leg */}
      <mesh position={[0.2, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>
      
      {/* Controls and lighting */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2} 
      />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <Environment preset="studio" />
    </group>
  );
}

// Helper functions for appearance
function getBodyColor(skinTone: string): string {
  switch (skinTone) {
    case 'fair': return '#ffe0bd';
    case 'light': return '#f1c27d';
    case 'medium': return '#e0ac69';
    case 'tan': return '#c68642';
    case 'dark': return '#8d5524';
    case 'very-dark': return '#5c3213';
    case 'pale-green': return '#c5e0c7';
    case 'ashen': return '#b0b0b0';
    default: return '#e0ac69';
  }
}

function getHairColor(hairColor: string): string {
  switch (hairColor) {
    case 'black': return '#090806';
    case 'brown': return '#4a2f0c';
    case 'blonde': return '#e6be8a';
    case 'red': return '#8c3f28';
    case 'white': return '#ffffff';
    case 'grey': return '#b0b0b0';
    case 'blue': return '#2e5894';
    case 'green': return '#2e8f43';
    case 'purple': return '#5d3572';
    default: return '#4a2f0c';
  }
}

function getEyeColor(eyeColor: string): string {
  switch (eyeColor) {
    case 'brown': return '#634e34';
    case 'blue': return '#3b83bd';
    case 'green': return '#3d762f';
    case 'grey': return '#8c8c8c';
    case 'hazel': return '#967117';
    case 'amber': return '#b5651d';
    case 'red': return '#ac2c24';
    case 'purple': return '#8241a0';
    case 'yellow': return '#dab030';
    default: return '#634e34';
  }
}

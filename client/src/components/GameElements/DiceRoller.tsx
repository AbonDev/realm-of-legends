import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Button } from '../UI/Fantasy/Button';
import { playClick, playSuccess } from '../../lib/soundEffects';

// Dice types
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface DiceRollerProps {
  onRollComplete?: (result: number, diceType: DiceType) => void;
}

// Floor component
function Floor(props: any) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} {...props}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#333" roughness={0.8} />
    </mesh>
  );
}

// Dice component
function Dice({ diceType, onRollComplete }: { diceType: DiceType, onRollComplete?: (result: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [result, setResult] = useState(0);
  const [isRolling, setIsRolling] = useState(true);
  const [position, setPosition] = useState([0, 3, 0]);
  const [rotation, setRotation] = useState([
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  ]);
  
  // Initial velocity for animation
  const velocity = useRef({
    position: [0, -0.1, 0],
    rotation: [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1]
  });
  
  // Animation timer
  const timer = useRef(0);
  
  // Get the correct dice geometry based on type
  const getDiceGeometry = () => {
    switch (diceType) {
      case 'd4':
        return <tetrahedronGeometry args={[1.2, 0]} />;
      case 'd8':
        return <octahedronGeometry args={[1.2, 0]} />;
      case 'd10':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'd12':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'd20':
        return <icosahedronGeometry args={[1.2, 0]} />;
      case 'd6':
      default:
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  };
  
  // Create a gold material for the dice
  const diceMaterial = (
    <meshStandardMaterial
      color="#d4af37"
      metalness={0.7}
      roughness={0.3}
    />
  );
  
  // Animate the dice
  useFrame((state, delta) => {
    if (!meshRef.current || !isRolling) return;
    
    // Update position
    const newPosition = [...position];
    newPosition[0] += velocity.current.position[0];
    newPosition[1] += velocity.current.position[1];
    newPosition[2] += velocity.current.position[2];
    
    // Update rotation
    const newRotation = [...rotation];
    newRotation[0] += velocity.current.rotation[0];
    newRotation[1] += velocity.current.rotation[1];
    newRotation[2] += velocity.current.rotation[2];
    
    // Bounce on floor
    if (newPosition[1] < 0) {
      newPosition[1] = 0;
      velocity.current.position[1] *= -0.6; // Bounce with damping
      
      // Slow down on each bounce
      velocity.current.position[0] *= 0.8;
      velocity.current.position[2] *= 0.8;
      velocity.current.rotation[0] *= 0.9;
      velocity.current.rotation[1] *= 0.9;
      velocity.current.rotation[2] *= 0.9;
    } else {
      // Apply gravity
      velocity.current.position[1] -= 0.01;
    }
    
    setPosition(newPosition);
    setRotation(newRotation);
    
    // Increment timer
    timer.current += delta;
    
    // Check if dice has stopped moving
    if (timer.current > 2 && Math.abs(velocity.current.position[1]) < 0.01 && newPosition[1] < 0.1) {
      setIsRolling(false);
      
      // Determine which face is up (simplified)
      let diceResult;
      
      // Simplified for demo - would implement proper face detection in production
      switch (diceType) {
        case 'd4':
          diceResult = Math.floor(Math.random() * 4) + 1;
          break;
        case 'd6':
          diceResult = Math.floor(Math.random() * 6) + 1;
          break;
        case 'd8':
          diceResult = Math.floor(Math.random() * 8) + 1;
          break;
        case 'd10':
          diceResult = Math.floor(Math.random() * 10) + 1;
          break;
        case 'd12':
          diceResult = Math.floor(Math.random() * 12) + 1;
          break;
        case 'd20':
          diceResult = Math.floor(Math.random() * 20) + 1;
          break;
        default:
          diceResult = Math.floor(Math.random() * 6) + 1;
      }
      
      setResult(diceResult);
      onRollComplete && onRollComplete(diceResult);
      
      // Play success sound
      playSuccess();
    }
  });
  
  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={position as [number, number, number]} 
        rotation={rotation as [number, number, number]} 
        castShadow
      >
        {getDiceGeometry()}
        {diceMaterial}
      </mesh>
      
      {!isRolling && (
        <Text
          position={[position[0], position[1] + 2, position[2]]}
          color="white"
          fontSize={1}
          anchorX="center"
          anchorY="middle"
        >
          {result}
        </Text>
      )}
    </group>
  );
}

// Main DiceRoller component
export default function DiceRoller({ onRollComplete }: DiceRollerProps) {
  const [diceType, setDiceType] = useState<DiceType>('d20');
  const [showDice, setShowDice] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  
  const handleRoll = () => {
    setShowDice(true);
    setRollResult(null);
    playClick();
  };
  
  const handleRollComplete = (result: number) => {
    setRollResult(result);
    if (onRollComplete) {
      onRollComplete(result, diceType);
    }
  };
  
  return (
    <div className="dice-roller">
      <div className="controls flex flex-wrap gap-2 mb-4">
        {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as DiceType[]).map((type) => (
          <Button
            key={type}
            onClick={() => setDiceType(type)}
            variant={diceType === type ? 'primary' : 'ghost'}
            size="sm"
          >
            {type}
          </Button>
        ))}
        
        <Button
          onClick={handleRoll}
          className="ml-auto"
          size="sm"
        >
          Roll {diceType}
        </Button>
      </div>
      
      <div className="dice-container bg-gray-900 rounded-md" style={{ height: '200px', position: 'relative' }}>
        <Canvas shadows camera={{ position: [0, 5, 6], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <spotLight position={[5, 10, 7]} angle={0.3} penumbra={1} intensity={1} castShadow />
          <Floor />
          {showDice && (
            <Dice diceType={diceType} onRollComplete={handleRollComplete} />
          )}
        </Canvas>
        
        {rollResult !== null && (
          <div 
            className="result-overlay absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
          >
            <div className="result-display text-4xl font-bold text-gold">
              {rollResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import { Button } from '../UI/Fantasy/Button';
import { playClick } from '../../lib/soundEffects';

// Token interface
interface Token {
  id: string;
  position: [number, number, number];
  color: string;
  name: string;
  size: number;
  isPlayer: boolean;
}

interface GameTableProps {
  tokens?: Token[];
  onTokenMove?: (tokenId: string, newPosition: [number, number, number]) => void;
  onAddToken?: (position: [number, number, number]) => void;
  tableSize?: [number, number];
  gridSize?: number;
}

// Grid component
function Grid({ size, divisions }: { size: number; divisions: number }) {
  return (
    <gridHelper 
      args={[size, divisions]} 
      position={[0, 0.01, 0]} 
      rotation={[0, 0, 0]}
      userData={{ isFloor: true }}
    />
  );
}

// Table surface component
function TableSurface({ size, texture }: { size: [number, number], texture?: THREE.Texture }) {
  const materialProps = texture 
    ? { map: texture, roughness: 0.9 } 
    : { color: '#2d4b18', roughness: 0.9 };
    
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ isFloor: true }}>
      <planeGeometry args={[size[0], size[1]]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}

// Game token (character or monster)
function GameToken({ token, onMove, selected, onSelect }: {
  token: Token;
  onMove?: (tokenId: string, newPosition: [number, number, number]) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  return (
    <group position={token.position}>
      <mesh
        ref={mesh}
        position={[0, token.size / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          playClick();
        }}
        castShadow
      >
        <cylinderGeometry args={[token.size / 2, token.size / 2, token.size, 32]} />
        <meshStandardMaterial color={token.color} />
        
        {/* Selection indicator */}
        {selected && (
          <mesh position={[0, token.size / 2 + 0.05, 0]}>
            <ringGeometry args={[token.size / 2 + 0.1, token.size / 2 + 0.2, 32]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        )}
      </mesh>
      
      {/* Token label */}
      <Html position={[0, token.size + 0.3, 0]} center>
        <div className="token-label px-2 py-1 bg-gray-900 bg-opacity-80 text-white rounded text-xs whitespace-nowrap">
          {token.name}
        </div>
      </Html>
    </group>
  );
}

// Scene component that handles interactions
function TableScene({ 
  tokens = [], 
  onTokenMove,
  onAddToken,
  tableSize = [20, 20],
  gridSize = 1
}: GameTableProps) {
  const [rollingDice, setRollingDice] = useState(false);

  useEffect(() => {
    const handleDiceRoll = (e: CustomEvent) => {
      setRollingDice(true);
      setTimeout(() => setRollingDice(false), 1500);
    };

    window.addEventListener('diceRoll', handleDiceRoll as EventListener);
    return () => window.removeEventListener('diceRoll', handleDiceRoll as EventListener);
  }, []);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { camera, raycaster, scene, gl } = useThree();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const mouse = useRef(new THREE.Vector2());
  const intersectionPoint = useRef(new THREE.Vector3());
  
  // Handle mouse move to position the movement cursor
  useFrame((state) => {
    if (!selectedToken) return;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse.current, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
      scene.children.filter(child => 
        child.userData && child.userData.isFloor
      ), 
      true
    );
    
    if (intersects.length > 0) {
      // Get the intersection point
      const point = intersects[0].point.clone();
      
      // Snap to grid
      const snappedX = Math.round(point.x / gridSize) * gridSize;
      const snappedZ = Math.round(point.z / gridSize) * gridSize;
      
      intersectionPoint.current.set(snappedX, 0, snappedZ);
    }
  });
  
  // Handle canvas click for token movement
  const handleCanvasClick = (e: any) => {
    if (selectedToken) {
      // Get the clicked point
      raycaster.setFromCamera(mouse.current, camera);
      const intersects = raycaster.intersectObjects(
        scene.children.filter(child => 
          child.userData && child.userData.isFloor
        ), 
        true
      );
      
      if (intersects.length > 0) {
        const point = intersects[0].point.clone();
        
        // Snap to grid
        const snappedX = Math.round(point.x / gridSize) * gridSize;
        const snappedZ = Math.round(point.z / gridSize) * gridSize;
        
        // Call the movement handler
        onTokenMove && onTokenMove(selectedToken, [snappedX, 0, snappedZ]);
      }
      
      // Deselect token after moving
      setSelectedToken(null);
    } else {
      // Double click to add a new token (right click)
      if ((e.button === 2 || e.nativeEvent?.button === 2) && onAddToken) {
        raycaster.setFromCamera(mouse.current, camera);
        const intersects = raycaster.intersectObjects(
          scene.children.filter(child => 
            child.userData && child.userData.isFloor
          ), 
          true
        );
        
        if (intersects.length > 0) {
          const point = intersects[0].point.clone();
          
          // Snap to grid
          const snappedX = Math.round(point.x / gridSize) * gridSize;
          const snappedZ = Math.round(point.z / gridSize) * gridSize;
          
          onAddToken([snappedX, 0, snappedZ]);
        }
      }
    }
  };
  
  // Handle pointer move to update mouse position
  const handlePointerMove = (e: any) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.nativeEvent?.clientX || 0;
    const clientY = e.clientY || e.nativeEvent?.clientY || 0;
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Table and grid */}
      <TableSurface size={tableSize} />
      <Grid size={Math.max(...tableSize)} divisions={Math.max(...tableSize) / gridSize} />
      
      {/* Game tokens */}
      {tokens.map((token) => (
        <GameToken
          key={token.id}
          token={token}
          onMove={onTokenMove}
          selected={selectedToken === token.id}
          onSelect={() => setSelectedToken(token.id)}
        />
      ))}
      
      {/* Dice animation */}
      {rollingDice && (
        <group position={[0, 5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      )}

      {/* Movement cursor */}
      {selectedToken && (
        <mesh position={intersectionPoint.current} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Orbit controls */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* Invisible layer for mouse events */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerMove={handlePointerMove}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasClick}
        visible={false}
      >
        <planeGeometry args={[tableSize[0] * 2, tableSize[1] * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

// Main GameTable component
export default function GameTable(props: GameTableProps) {
  const [tokens, setTokens] = useState<Token[]>(props.tokens || [
    {
      id: 'player',
      position: [0, 0, 0],
      color: '#3498db',
      name: 'Player',
      size: 1,
      isPlayer: true
    },
    {
      id: 'enemy1',
      position: [3, 0, 3],
      color: '#e74c3c',
      name: 'Goblin',
      size: 0.8,
      isPlayer: false
    }
  ]);
  
  // Handle token movement
  const handleTokenMove = (tokenId: string, newPosition: [number, number, number]) => {
    setTokens(prev => 
      prev.map(token => 
        token.id === tokenId ? { ...token, position: newPosition } : token
      )
    );
    
    // Call the parent handler if provided
    if (props.onTokenMove) {
      props.onTokenMove(tokenId, newPosition);
    }
  };
  
  // Handle adding a new token
  const handleAddToken = (position: [number, number, number]) => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      position,
      color: '#e67e22',
      name: 'New Token',
      size: 0.8,
      isPlayer: false
    };
    
    setTokens(prev => [...prev, newToken]);
    
    // Call the parent handler if provided
    if (props.onAddToken) {
      props.onAddToken(position);
    }
  };
  
  return (
    <div className="game-table">
      <div className="controls flex flex-wrap gap-2 mb-4">
        <DiceRoller onRollComplete={(result, diceType) => {
          // Here you can add visual effects for the dice roll on the table
          console.log(`Rolled ${diceType}: ${result}`);
        }} />
        
        <Button
          onClick={() => alert('Controls:\n- Click on a token to select it\n- Click on the table to move the selected token\n- Right-click to add a new token')}
          className="ml-auto"
          size="sm"
          variant="ghost"
        >
          Help
        </Button>
      </div>
      
      <div className="table-container bg-gray-900 rounded-md" style={{ height: '500px', position: 'relative' }}>
        <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
          <TableScene 
            tokens={tokens} 
            onTokenMove={handleTokenMove} 
            onAddToken={handleAddToken} 
            tableSize={props.tableSize || [20, 20]}
            gridSize={props.gridSize || 1}
          />
        </Canvas>
      </div>
    </div>
  );
}
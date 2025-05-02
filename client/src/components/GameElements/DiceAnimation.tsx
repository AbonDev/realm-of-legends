
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DiceAnimationProps {
  onAnimationComplete: () => void;
}

export default function DiceAnimation({ onAnimationComplete }: DiceAnimationProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [state, setState] = useState({
    position: new THREE.Vector3(Math.random() * 4 - 2, 8, Math.random() * 4 - 2),
    velocity: new THREE.Vector3(Math.random() * 4 - 2, 0, Math.random() * 4 - 2),
    angularVelocity: new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    ),
    bounceCount: 0
  });

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    state.velocity.y -= 9.81 * delta;
    state.position.add(state.velocity.clone().multiplyScalar(delta));
    meshRef.current.position.copy(state.position);

    meshRef.current.rotation.x += state.angularVelocity.x * delta;
    meshRef.current.rotation.y += state.angularVelocity.y * delta;
    meshRef.current.rotation.z += state.angularVelocity.z * delta;

    if (state.position.y < 0.5 && state.velocity.y < 0) {
      if (state.bounceCount < 3) {
        state.velocity.y = -state.velocity.y * 0.5;
        state.velocity.x *= 0.7;
        state.velocity.z *= 0.7;
        state.angularVelocity.multiplyScalar(0.6);
        state.position.y = 0.5;
        state.bounceCount += 1;
      } else {
        state.velocity.set(0, 0, 0);
        state.angularVelocity.multiplyScalar(0.95);
        state.position.y = 0.5;

        if (state.angularVelocity.length() < 0.1) {
          onAnimationComplete();
        }
      }
    }

    setState({ ...state });
  });

  return (
    <mesh ref={meshRef} position={state.position.toArray()} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.1} />
      {[...Array(6)].map((_, i) => (
        <Html
          key={i}
          position={[
            i === 0 ? 0.51 : i === 1 ? -0.51 : 0,
            i === 2 ? 0.51 : i === 3 ? -0.51 : 0,
            i === 4 ? 0.51 : i === 5 ? -0.51 : 0
          ]}
          rotation={[
            i === 2 || i === 3 ? Math.PI / 2 : 0,
            i === 0 || i === 1 ? Math.PI / 2 : 0,
            0
          ]}
        >
          <div className="dice-face" style={{
            width: '40px',
            height: '40px',
            background: 'ivory',
            border: '3px solid #8B4513',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            padding: '2px',
            transform: 'translate(-50%, -50%)'
          }}>
            {[...Array(i + 1)].map((_, dotIndex) => (
              <div
                key={dotIndex}
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#8B4513',
                  borderRadius: '50%',
                  margin: 'auto'
                }}
              />
            ))}
          </div>
        </Html>
      ))}
    </mesh>
  );
}

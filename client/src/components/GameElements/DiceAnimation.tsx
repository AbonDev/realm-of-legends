
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
      <icosahedronGeometry args={[0.8]} />
      <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.1} />
      {[...Array(20)].map((_, i) => (
        <Html
          key={i}
          position={[
            Math.cos(i * Math.PI * 2 / 20) * 0.82,
            Math.sin(i * Math.PI * 2 / 20) * 0.82,
            (i % 2 === 0 ? 0.82 : -0.82)
          ]}
          rotation={[0, 0, i * Math.PI * 2 / 20]}
        >
          <div className="dice-face" style={{
            width: '30px',
            height: '30px',
            background: 'ivory',
            border: '2px solid #8B4513',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#8B4513',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)'
          }}>
            {i + 1}
          </div>
        </Html>
      ))}
    </mesh>
  );
}

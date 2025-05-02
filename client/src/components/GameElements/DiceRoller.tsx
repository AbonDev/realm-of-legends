
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../UI/dialog';
import { Button } from '../UI/Fantasy/Button';
import { playClick, playSuccess } from '../../lib/soundEffects';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DiceAnimation from './DiceAnimation';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface DiceRollerProps {
  onRollComplete?: (result: number, diceType: DiceType) => void;
}

export default function DiceRoller({ onRollComplete }: DiceRollerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    playClick();
    setIsRolling(true);

    setTimeout(() => {
      const results = Array(quantity).fill(0).map(() => {
        const max = parseInt(selectedDice.substring(1));
        return Math.floor(Math.random() * max) + 1;
      });

      const total = results.reduce((a, b) => a + b, 0);
      
      // Wait for animation to complete and add delay before closing
      setTimeout(() => {
        playSuccess();
        if (onRollComplete) {
          onRollComplete(total, selectedDice);
        }
        
        // Add 3 second delay before closing
        setTimeout(() => {
          setIsRolling(false);
          setIsOpen(false);
        }, 3000);
      }, 2500);
    }, 2000);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" variant="ghost">
        🎲 Dice
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-xl w-[600px] h-[600px]">
          <DialogTitle className="text-2xl font-fantasy text-center text-gold mb-4">Choose Your Dice</DialogTitle>

          <div className="flex flex-col gap-6 p-4">
            <div className="grid grid-cols-3 gap-3">
              {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as DiceType[]).map((type) => (
                <Button
                  key={type}
                  onClick={() => setSelectedDice(type)}
                  variant={selectedDice === type ? 'primary' : 'ghost'}
                  className={`h-16 text-xl ${selectedDice === type ? 'ring-2 ring-gold' : ''}`}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4 justify-center">
              <span className="text-lg">Quantity:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 bg-gray-800 text-white rounded px-3 py-2 text-center text-lg border border-gray-700"
              />
            </div>

            {/* 3D Dice Animation Canvas */}
            <div className="relative w-full h-[300px] bg-gray-800 rounded-lg">
              <Canvas shadows camera={{ position: [0, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
                {isRolling && <DiceAnimation onAnimationComplete={() => {}} />}
                <OrbitControls enabled={false} />
              </Canvas>
            </div>

            <Button 
              onClick={handleRoll}
              disabled={isRolling}
              className="mt-4 text-lg h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600"
            >
              {isRolling ? "Rolling..." : `Roll ${quantity} ${selectedDice}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

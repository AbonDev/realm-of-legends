import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../UI/dialog';
import { Button } from '../UI/Fantasy/Button';
import { playClick, playSuccess } from '../../lib/soundEffects';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface DiceRollerProps {
  onRollComplete?: (result: number, diceType: DiceType) => void;
  position?: [number, number, number];
}

export default function DiceRoller({ onRollComplete, position }: DiceRollerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);

  const handleRoll = () => {
    playClick();
    setIsOpen(false);

    // Simple dice roll calculation
    const results = Array(quantity).fill(0).map(() => {
      const max = parseInt(selectedDice.substring(1));
      return Math.floor(Math.random() * max) + 1;
    });

    const total = results.reduce((a, b) => a + b, 0);
    playSuccess();

    if (onRollComplete) {
      onRollComplete(total, selectedDice);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        Roll Dice
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogTitle>Roll Dice</DialogTitle>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as DiceType[]).map((type) => (
                <Button
                  key={type}
                  onClick={() => setSelectedDice(type)}
                  variant={selectedDice === type ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span>Quantity:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 bg-gray-800 text-white rounded px-2 py-1"
              />
            </div>

            <Button onClick={handleRoll} className="mt-2">
              Roll {quantity} {selectedDice}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
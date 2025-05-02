import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../UI/dialog';
import { Button } from '../UI/Fantasy/Button';
import { playClick, playSuccess } from '../../lib/soundEffects';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface DiceRollerProps {
  onRollComplete?: (result: number, diceType: DiceType) => void;
}

export default function DiceRoller({ onRollComplete }: DiceRollerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);

  const handleRoll = () => {
    playClick();
    setIsOpen(false);

    // Calculate dice rolls
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
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        🎲 Roll Dice
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-xl w-[400px]">
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

            <Button 
              onClick={handleRoll} 
              className="mt-4 text-lg h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600"
            >
              Roll {quantity} {selectedDice}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
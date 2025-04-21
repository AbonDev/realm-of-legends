import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Fantasy/Button';
import { Panel } from '../components/UI/Fantasy/Panel';
import { useCharacter } from '../lib/stores/useCharacter';
import { playClick, playSuccess } from '../lib/soundEffects';
import SpeechRecognition from '../components/VoiceInput/SpeechRecognition';
import TextToSpeech from '../components/VoiceInput/TextToSpeech';
import DiceRoller from '../components/GameElements/DiceRoller';
import GameTable from '../components/GameElements/GameTable';

type Message = {
  id: number;
  sender: 'dm' | 'player' | 'system';
  content: string;
  timestamp: string;
};

type GameAction = {
  id: number;
  label: string;
  description?: string;
  disabled?: boolean;
};

// Token type for the game table
type Token = {
  id: string;
  position: [number, number, number];
  color: string;
  name: string;
  size: number;
  isPlayer: boolean;
};

export default function GamePage() {
  const { character } = useCharacter();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [availableActions, setAvailableActions] = useState<GameAction[]>([]);
  const [gameState, setGameState] = useState<'intro' | 'exploring' | 'combat' | 'dialog'>('intro');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showGameTable, setShowGameTable] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState<{ result: number; type: string } | null>(null);
  const [gameTokens, setGameTokens] = useState<Token[]>([
    {
      id: 'player',
      position: [0, 0, 0],
      color: '#3498db',
      name: character.name || 'Player',
      size: 1,
      isPlayer: true
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial game setup
  useEffect(() => {
    // Load character data if it exists
    const storedGameData = localStorage.getItem('currentGameData');
    
    // Add introduction messages
    const initialMessages: Message[] = [
      {
        id: 1,
        sender: 'system',
        content: 'Welcome to Realm of Legends! Your adventure begins now...',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        sender: 'dm',
        content: `Welcome, ${character.name || 'Adventurer'}! I am your AI Dungeon Master and will guide you through this adventure. The world awaits your heroic deeds. Hold the "Speak" button to talk to me directly!`,
        timestamp: new Date(Date.now() + 1000).toISOString()
      },
      {
        id: 3,
        sender: 'dm',
        content: `You find yourself standing at the entrance of a small village called Meadowbrook. The sun is setting, casting long shadows across the dirt path. The journey has been long, and you're looking for a place to rest.`,
        timestamp: new Date(Date.now() + 2000).toISOString()
      }
    ];
    
    setMessages(initialMessages);
    
    // Set initial available actions
    setAvailableActions([
      { id: 1, label: 'Enter the village', description: 'Look for an inn or tavern to rest' },
      { id: 2, label: 'Observe surroundings', description: 'Take a moment to survey the area' },
      { id: 3, label: 'Check equipment', description: 'Review your inventory and gear' }
    ]);
    
    // Play ambient sound
    playSuccess();
  }, []);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle adding NPCs to the game table
  const addEnemyToTable = (position: [number, number, number], name = 'Enemy') => {
    const newToken: Token = {
      id: `enemy_${Date.now()}`,
      position,
      color: '#e74c3c',
      name,
      size: 0.8,
      isPlayer: false
    };
    
    setGameTokens(prev => [...prev, newToken]);
  };
  
  // Handle text or voice message
  const handleSendMessage = async (e?: React.FormEvent, spokenMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = spokenMessage || inputMessage;
    if (!messageToSend.trim() || isSendingMessage) return;
    
    setIsSendingMessage(true);
    playClick();
    
    // Add player message
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'player',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      // In a real implementation, this would call an AI service like GPT
      let aiResponse: Message;
      
      // Simple response logic based on keywords
      if (messageToSend.toLowerCase().includes('hello') || messageToSend.toLowerCase().includes('hi')) {
        aiResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: `Greetings, ${character.name || 'Adventurer'}! How may I assist you on your journey?`,
          timestamp: new Date().toISOString()
        };
      } else if (messageToSend.toLowerCase().includes('inn') || messageToSend.toLowerCase().includes('tavern')) {
        aiResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: `The village has a small inn called "The Sleeping Dragon" near the center. As you approach, you can hear laughter and music coming from inside.`,
          timestamp: new Date().toISOString()
        };
        
        // Update available actions
        setAvailableActions([
          { id: 1, label: 'Enter the inn', description: 'Step inside The Sleeping Dragon' },
          { id: 2, label: 'Look around the village', description: 'Explore more of Meadowbrook first' }
        ]);
      } else if (messageToSend.toLowerCase().includes('dice') || messageToSend.toLowerCase().includes('roll')) {
        aiResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: `You want to test your luck with a dice roll? Very well! I've opened the dice roller for you. Select the type of die you wish to roll.`,
          timestamp: new Date().toISOString()
        };
        
        // Show dice roller
        setShowDiceRoller(true);
      } else if (messageToSend.toLowerCase().includes('combat') || messageToSend.toLowerCase().includes('battle') || messageToSend.toLowerCase().includes('fight')) {
        aiResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: `As you venture into the outskirts of the village, you notice movement in the tall grass. Three goblins emerge, brandishing crude weapons! I've opened the battle map so you can see the tactical situation.`,
          timestamp: new Date().toISOString()
        };
        
        // Show game table and add enemies
        setShowGameTable(true);
        setGameState('combat');
        setTimeout(() => {
          addEnemyToTable([3, 0, 3], 'Goblin Scout');
          addEnemyToTable([2, 0, 5], 'Goblin Warrior');
          addEnemyToTable([4, 0, 4], 'Goblin Archer');
        }, 1000);
      } else {
        aiResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: `The AI Dungeon Master nods thoughtfully at your words. "Interesting approach. What would you like to do next?"`,
          timestamp: new Date().toISOString()
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsSendingMessage(false);
    }, 1500);
  };
  
  const handleVoiceResult = (transcript: string) => {
    // Process the speech recognition result
    if (transcript.trim()) {
      handleSendMessage(undefined, transcript);
    }
  };
  
  const handleAction = (actionId: number) => {
    playClick();
    
    // Find the selected action
    const action = availableActions.find(a => a.id === actionId);
    if (!action) return;
    
    // Add player action message
    const playerActionMessage: Message = {
      id: messages.length + 1,
      sender: 'player',
      content: `*${action.label}*`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, playerActionMessage]);
    
    // Simulate AI response based on the action
    setTimeout(() => {
      let aiResponse: Message;
      let newActions: GameAction[] = [];
      
      // Different responses based on selected action
      switch(actionId) {
        case 1: // Enter the village
          aiResponse = {
            id: messages.length + 2,
            sender: 'dm',
            content: `You walk down the main path of Meadowbrook. Villagers go about their evening routines, some nodding respectfully as you pass. The Sleeping Dragon inn stands prominently in the center of the village, its sign creaking gently in the breeze. A warm glow emanates from its windows, and the sound of laughter and music can be heard from within.`,
            timestamp: new Date().toISOString()
          };
          newActions = [
            { id: 4, label: 'Enter the inn', description: 'Step inside to find food and lodging' },
            { id: 5, label: 'Visit the market', description: 'Check if any shops are still open' },
            { id: 6, label: 'Speak with villagers', description: 'Ask about local news or rumors' }
          ];
          break;
          
        case 2: // Observe surroundings
          aiResponse = {
            id: messages.length + 2,
            sender: 'dm',
            content: `You take a moment to observe Meadowbrook. It's a modest village of about two dozen buildings, mostly wooden cottages with thatched roofs. A stone well sits in the village square, and a small temple can be seen on a gentle rise to the north. To the east, you notice farmlands stretching toward distant hills. The village seems peaceful, though you notice a few guards patrolling with concerned expressions.`,
            timestamp: new Date().toISOString()
          };
          newActions = [
            { id: 7, label: 'Enter the village', description: 'Proceed into Meadowbrook' },
            { id: 8, label: 'Approach a guard', description: 'Ask about their concerns' },
            { id: 9, label: 'Check the temple', description: 'Visit the temple on the hill' }
          ];
          break;
          
        case 3: // Check equipment
          aiResponse = {
            id: messages.length + 2,
            sender: 'dm',
            content: `You take inventory of your possessions. Your ${character.equipment && character.equipment[0] || 'weapon'} is in good condition, and your travel pack contains basic supplies: a waterskin, rations for three days, a tinderbox, and 15 gold pieces. Your ${character.class || 'adventurer'} training has prepared you well for the journey ahead, but you could use some rest and perhaps additional supplies.`,
            timestamp: new Date().toISOString()
          };
          newActions = availableActions; // Keep the same actions
          break;
          
        default:
          aiResponse = {
            id: messages.length + 2,
            sender: 'dm',
            content: `The AI Dungeon Master acknowledges your action and waits to see what you'll do next.`,
            timestamp: new Date().toISOString()
          };
          newActions = availableActions; // Keep the same actions
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setAvailableActions(newActions);
    }, 1500);
  };
  
  const handleDiceRollComplete = (result: number, diceType: string) => {
    setLastDiceResult({ result, type: diceType });
    
    // Add dice roll message
    const diceMessage: Message = {
      id: messages.length + 1,
      sender: 'system',
      content: `${character.name || 'You'} rolled a ${result} on a ${diceType}.`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, diceMessage]);
    
    // Simulate DM response to the dice roll
    setTimeout(() => {
      let dmResponse: Message;
      
      if (result === 20 && diceType === 'd20') {
        dmResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: 'A critical success! Your skill and luck combine for an extraordinary outcome!',
          timestamp: new Date().toISOString()
        };
      } else if (result === 1 && diceType === 'd20') {
        dmResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: 'A critical failure! Sometimes fate has other plans...',
          timestamp: new Date().toISOString()
        };
      } else if (result >= 15) {
        dmResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: 'An excellent roll! Your expertise shines through.',
          timestamp: new Date().toISOString()
        };
      } else if (result <= 5) {
        dmResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: 'A poor roll. Even the most skilled adventurers have their off moments.',
          timestamp: new Date().toISOString()
        };
      } else {
        dmResponse = {
          id: messages.length + 2,
          sender: 'dm',
          content: 'A fair roll. Your attempt is neither exceptional nor poor.',
          timestamp: new Date().toISOString()
        };
      }
      
      setMessages(prev => [...prev, dmResponse]);
    }, 1000);
  };
  
  const handleExitGame = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      // Save game state
      const gameData = {
        character,
        messages,
        gameState,
        lastPlayed: new Date().toISOString()
      };
      
      localStorage.setItem('savedGame_' + Date.now(), JSON.stringify(gameData));
      navigate('/main-menu');
    }
  };
  
  return (
    <div className="game-page" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: "url('/src/assets/backgrounds/character-bg.svg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Game Header */}
      <header style={{
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="character-info flex items-center">
          <h2 className="text-gold font-title mr-4">{character.name || 'Adventurer'}</h2>
          <span className="text-sm text-gray-300">
            Level 1 {character.race} {character.class}
          </span>
        </div>
        
        <div className="game-controls flex gap-3">
          <Button 
            size="sm" 
            variant={showDiceRoller ? "primary" : "ghost"} 
            onClick={() => setShowDiceRoller(!showDiceRoller)}
          >
            Dice
          </Button>
          <Button 
            size="sm" 
            variant={showGameTable ? "primary" : "ghost"} 
            onClick={() => setShowGameTable(!showGameTable)}
          >
            Battle Map
          </Button>
          <Button size="sm" variant="ghost" onClick={() => alert('Character sheet opens here')}>
            Character
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExitGame}>
            Save & Exit
          </Button>
        </div>
      </header>
      
      {/* Main Game View */}
      {showGameTable && (
        <div className="game-table-container" style={{ height: '60vh', padding: '10px' }}>
          <Panel className="w-full h-full flex flex-col p-4" style={{
            backdropFilter: 'blur(10px)',
          }}>
            <GameTable 
              tokens={gameTokens}
              onTokenMove={(tokenId, newPosition) => {
                setGameTokens(prev => 
                  prev.map(token => 
                    token.id === tokenId ? { ...token, position: newPosition } : token
                  )
                );
              }}
              onAddToken={(position) => {
                addEnemyToTable(position);
              }}
              tableSize={[30, 30]}
              gridSize={1}
            />
          </Panel>
        </div>
      )}
      
      {/* Game Content Area */}
      <div className={`game-content-area flex-1 flex p-4 gap-4 overflow-hidden ${showGameTable ? 'h-[40vh]' : 'h-full'}`}>
        {/* Left Panel - Game Narrative */}
        <Panel className="narrative-panel flex-1 flex flex-col" style={{
          backdropFilter: 'blur(10px)',
          minWidth: 0, // Allows the panel to shrink below its content size
        }}>
          {/* Messages Area */}
          <div className="messages-area flex-1 overflow-y-auto p-4">
            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`message mb-4 ${message.sender === 'player' ? 'pl-4' : 'pr-4'}`}
                >
                  {message.sender === 'system' ? (
                    <div className="system-message bg-primary-dark bg-opacity-40 text-center p-2 rounded-md text-white">
                      {message.content}
                    </div>
                  ) : message.sender === 'dm' ? (
                    <div className="dm-message">
                      <div className="dm-header flex justify-between text-gold text-xs mb-1 font-title">
                        <span>Dungeon Master</span>
                        <TextToSpeech text={message.content} />
                      </div>
                      <div className="dm-content bg-gray-900 bg-opacity-70 p-3 rounded-md font-body">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="player-message flex justify-end">
                      <div className="player-message-content">
                        <div className="player-header text-primary-light text-xs mb-1 text-right font-title">
                          {character.name || 'You'}
                        </div>
                        <div className="player-content bg-primary-dark bg-opacity-50 p-3 rounded-md font-body">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area with Voice Recognition */}
          <div className="input-area p-4 border-t border-gray-800">
            <div className="flex gap-2 mb-4">
              <SpeechRecognition 
                onSpeechResult={handleVoiceResult} 
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message or use voice..."
                className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light"
                disabled={isSendingMessage || isListening}
              />
              <Button 
                type="submit" 
                disabled={isSendingMessage || isListening || !inputMessage.trim()}
              >
                {isSendingMessage ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </Panel>
        
        {/* Right Panel - Game Actions and Dice */}
        <Panel className="actions-panel w-80 flex flex-col" style={{
          backdropFilter: 'blur(10px)',
        }}>
          {showDiceRoller ? (
            <div className="p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gold font-title">Dice Roller</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowDiceRoller(false)}
                >
                  Close
                </Button>
              </div>
              
              <DiceRoller onRollComplete={handleDiceRollComplete} />
              
              {lastDiceResult && (
                <div className="mt-4 text-center">
                  <p>Last Roll: <span className="text-gold font-bold">{lastDiceResult.result}</span> on a {lastDiceResult.type}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-800 overflow-y-auto">
                <h3 className="text-gold font-title mb-2">Available Actions</h3>
                <div className="actions-list flex flex-col gap-2">
                  {availableActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={action.disabled}
                      className="text-left bg-gray-900 bg-opacity-70 hover:bg-opacity-90 p-3 rounded-md transition-all text-white border border-gray-800 hover:border-primary-light"
                    >
                      <div className="font-title text-gold">{action.label}</div>
                      {action.description && (
                        <div className="text-sm text-gray-300 mt-1">{action.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="current-context p-4 border-b border-gray-800">
                <h3 className="text-gold font-title mb-2">Current Location</h3>
                <p className="text-gray-300 text-sm">Meadowbrook Village Entrance</p>
                <p className="text-gray-400 text-xs mt-1">Time: Evening</p>
              </div>
              
              <div className="party-status p-4">
                <h3 className="text-gold font-title mb-2">Party Status</h3>
                <div className="party-member bg-gray-900 bg-opacity-50 p-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-white">{character.name || 'Adventurer'}</span>
                    <span className="text-green-500 text-sm">Healthy</span>
                  </div>
                  <div className="health-bar w-full h-2 bg-gray-700 rounded-full mt-1">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
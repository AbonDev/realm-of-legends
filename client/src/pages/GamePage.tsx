
import React, { useState, useRef, useEffect } from "react";
import DiceRoller from "../components/GameElements/DiceRoller";
import SimpleGameMap, { MapToken } from "../components/GameElements/SimpleGameMap";
import { useGame } from "../lib/stores/useGame";
import { useCharacter } from "../lib/stores/useCharacter";
import { useAudio } from "../lib/stores/useAudio";
import { playClick, playSuccess, playError } from "../lib/soundEffects";
import { Button } from "../components/UI/Fantasy/Button";
import { v4 as uuidv4 } from "uuid";

const sessionId =
  localStorage.getItem("sessionId") ||
  (() => {
    const newId = uuidv4();
    localStorage.setItem("sessionId", newId);
    return newId;
  })();

type Message = {
  id: number;
  sender: 'dm' | 'player' | 'system';
  content: string;
  timestamp: string;
};

async function askDungeonMaster(playerMessage: string): Promise<string> {
  try {
    const response = await fetch("/api/ask-gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: playerMessage,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Error communicating with the Dungeon Master.");
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error asking Dungeon Master:", error);
    return "Sorry, I'm having trouble connecting to the Dungeon Master. Please try again later.";
  }
}

async function playDungeonMasterVoice(text: string) {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("Error generating voice:", await response.text());
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}

export default function GamePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'dm',
      content: 'Welcome, Adventurer! I am your AI Dungeon Master, and I will guide you through this adventure.',
      timestamp: new Date().toISOString(),
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [mapTokens, setMapTokens] = useState<MapToken[]>([
    {
      id: 'player',
      x: 5,
      y: 5,
      color: '#3498db',
      name: 'Hero',
      size: 0.8,
      isPlayer: true
    },
    {
      id: 'npc1',
      x: 8,
      y: 5,
      color: '#27ae60',
      name: 'Friendly NPC',
      size: 0.7,
      isPlayer: false
    }
  ]);
  
  const character = useCharacter();
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showBattleMap, setShowBattleMap] = useState(true);
  
  const audioState = useAudio();
  const toggleMusic = audioState.toggleMusic;
  const isMusicPlaying = audioState.isMusicPlaying;
  const toggleSoundEffects = audioState.toggleSoundEffects;
  const areSoundEffectsEnabled = audioState.areSoundEffectsEnabled;

  async function handleSend(messageToSend?: string) {
    const message = messageToSend ?? inputMessage.trim();
    if (message === "") return;

    const playerMessage: Message = {
      id: messages.length + 1,
      sender: 'player',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, playerMessage]);
    setInputMessage("");
    
    if (message.toLowerCase().includes("roll dice") || message.toLowerCase().includes("roll a die")) {
      setShowDiceRoller(true);
      return;
    }
    
    if (message.toLowerCase().includes("battle") || message.toLowerCase().includes("fight")) {
      const newToken: MapToken = {
        id: `enemy_${Date.now()}`,
        x: 3,
        y: 3,
        color: '#e74c3c',
        name: 'Goblin',
        size: 0.7,
        isPlayer: false
      };
      
      setMapTokens(prev => [...prev, newToken]);
      setShowBattleMap(true);
      
      const systemMessage: Message = {
        id: messages.length + 2,
        sender: 'system',
        content: 'A battle has started! You can move tokens by clicking on them and then clicking on a destination.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      return;
    }

    try {
      const response = await askDungeonMaster(message);
      
      const dmResponse: Message = {
        id: messages.length + 2,
        sender: 'dm',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, dmResponse]);
      
      await playDungeonMasterVoice(response);
    } catch (error) {
      console.error(error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: 'system',
        content: "There was an error communicating with the Dungeon Master. Please try again.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      playError();
    }
  }

  const handleDiceRollComplete = (result: number, diceType: string) => {
    const diceMessage: Message = {
      id: messages.length + 1,
      sender: 'system',
      content: `You rolled a ${diceType} and got ${result}.`,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, diceMessage]);
    
    setTimeout(async () => {
      try {
        const dmResponse = await askDungeonMaster(`The player rolled a ${diceType} and got ${result}. Describe what happens based on this roll.`);
        
        const dmMessage: Message = {
          id: messages.length + 2,
          sender: 'dm',
          content: dmResponse,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, dmMessage]);
        
        await playDungeonMasterVoice(dmResponse);
      } catch (error) {
        console.error(error);
        playError();
      }
    }, 1000);
  };

  const handleMouseDown = () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Your browser doesn't support speech recognition!");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      await handleSend(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Microphone permission error:", event);
    };

    recognition.start();
    setListening(true);
  };

  const handleMouseUp = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/session-history/${sessionId}`);
        const data = await res.json();
  
        if (Array.isArray(data.messages)) {
          const mappedMessages: Message[] = data.messages.map((msg: { role: string; content: string }, index: number) => ({
            id: index + 1,
            sender: msg.role === "user" ? "player" : msg.role === "assistant" ? "dm" : "system",
            content: msg.content,
            timestamp: new Date().toISOString(),
          }));
          setMessages(mappedMessages);
        }
        
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      <header className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-800">
        <div className="font-fantasy text-xl">Realm of Legends</div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => toggleMusic()} 
            variant="ghost" 
            size="sm"
          >
            {isMusicPlaying ? "🔊 Music On" : "🔇 Music Off"}
          </Button>
          
          <Button 
            onClick={() => toggleSoundEffects()} 
            variant="ghost" 
            size="sm"
          >
            {areSoundEffectsEnabled ? "🔊 Sound FX On" : "🔇 Sound FX Off"}
          </Button>

          <DiceRoller onRollComplete={handleDiceRollComplete} />
          
          <Button 
            onClick={() => setShowBattleMap(!showBattleMap)}
            variant="ghost" 
            size="sm"
          >
            🗺️ {showBattleMap ? "Hide Map" : "Show Map"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
          <div className="mb-6 flex flex-col items-center">
            <div 
              className="character-portrait w-40 h-40 rounded-full mb-3 bg-cover bg-center border-4 border-gray-600"
              style={{
                backgroundImage: `url(${character.portraitUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <h3 className="text-lg font-semibold">{character.name}</h3>
            <p className="text-gray-400 text-sm">{character.race} {character.class}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-fantasy mb-2 border-b border-gray-700 pb-1">Character Stats</h2>
            <div className="text-sm space-y-2">
              <p><span className="text-gray-400">Level:</span> {character.level}</p>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health:</span> 
                  <span className="text-green-500">{character.health.current}/{character.health.max}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-green-600 h-full"
                    style={{ width: `${(character.health.current / character.health.max) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mana:</span> 
                  <span className="text-blue-500">{character.mana.current}/{character.mana.max}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full"
                    style={{ width: `${(character.mana.current / character.mana.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-fantasy mb-2 border-b border-gray-700 pb-1">Inventory</h2>
            <ul className="text-sm space-y-1">
              {character.inventory.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-fantasy mb-2 border-b border-gray-700 pb-1">Game Tips</h2>
            <p className="text-sm text-gray-300 italic">
              Speak or type your actions to play. Try commands like "roll dice", "attack the goblin", or "check for traps".
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {showBattleMap && (
            <div className="flex-1 p-4 flex justify-center">
              <SimpleGameMap 
                tokens={mapTokens} 
                onTokenMove={(tokenId, newX, newY) => {
                  setMapTokens(prev => 
                    prev.map(token => 
                      token.id === tokenId ? { ...token, x: newX, y: newY } : token
                    )
                  );
                }}
                onAddToken={(x, y) => {
                  const newToken: MapToken = {
                    id: `token_${Date.now()}`,
                    x,
                    y,
                    color: '#e67e22',
                    name: 'New Token',
                    size: 0.7,
                    isPlayer: false
                  };
                  
                  setMapTokens(prev => [...prev, newToken]);
                }}
                mapWidth={600}
                mapHeight={400}
                gridSize={40}
                background="/textures/grass.jpg"
              />
            </div>
          )}
        </div>

        <div className="w-80 flex flex-col bg-gray-800 border-l border-gray-700">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded max-w-full ${msg.sender === 'player' ? 'bg-blue-900 ml-auto' : msg.sender === 'dm' ? 'bg-gray-700' : 'bg-yellow-900 border border-yellow-700'}`}>
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.sender === 'player' ? 'You' : msg.sender === 'dm' ? 'Dungeon Master' : 'System'}
                    <span className="ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`px-3 py-2 rounded-full ${listening ? 'bg-red-700' : 'bg-blue-700'} hover:opacity-90`}
              >
                🎤
              </button>
              
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={() => handleSend()}
                className="px-3 py-2 rounded-full bg-blue-700 hover:opacity-90"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import DiceRoller from "../components/GameElements/DiceRoller";
import SimpleGameMap, { MapToken } from "../components/GameElements/SimpleGameMap";
import { useCharacter } from "../lib/stores/useCharacter";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "../components/UI/Fantasy/Button";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: number;
  sender: "dm" | "player" | "system";
  content: string;
  timestamp: string;
};

export default function GamePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "dm",
      content: "Bem-vindo, Aventureiro! Sou seu Mestre de Jogo. Vamos começar!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const character = useCharacter();
  const audio = useAudio();
  const [mapTokens, setMapTokens] = useState<MapToken[]>([
    {
      id: "player",
      x: 5,
      y: 5,
      color: "#3498db",
      name: "Herói",
      size: 0.8,
      isPlayer: true,
    },
  ]);

  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showBattleMap, setShowBattleMap] = useState(true);

  const sessionId = "default-session";

  async function askDungeonMaster(message: string): Promise<string> {
    const response = await fetch("/api/ask-gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });

    const data = await response.json();
    return data.reply || "Erro ao obter resposta do Mestre.";
  }

  async function playDungeonMasterVoice(text: string) {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
    }
  }

  async function handleSend(messageToSend?: string) {
    const message = messageToSend ?? inputMessage.trim();
    if (!message) return;

    const userMsg: Message = {
      id: messages.length + 1,
      sender: "player",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    const dmReply = await askDungeonMaster(message);

    const dmMsg: Message = {
      id: userMsg.id + 1,
      sender: "dm",
      content: dmReply,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, dmMsg]);
    await playDungeonMasterVoice(dmReply);
  }

  function handleMouseDown() {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Seu navegador não suporta reconhecimento de voz!");
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
      console.error("Erro no reconhecimento de voz:", event.error);
    };

    recognition.start();
    setListening(true);
  }

  function handleMouseUp() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="flex justify-between items-center p-3 border-b border-gray-800">
        <div className="font-bold text-xl">Realm of Legends</div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowDiceRoller(!showDiceRoller)}>🎲 Dados</Button>
          <Button onClick={() => setShowBattleMap(!showBattleMap)}>🗺️ Mapa</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
          <div className="text-center mb-4">
            <img src={character.portraitUrl} alt="Portrait" className="rounded-full w-24 h-24 mx-auto" />
            <h3 className="mt-2">{character.name}</h3>
            <p className="text-gray-400 text-sm">{character.race} {character.class}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-400 mb-1">HP:</h4>
            <div className="w-full bg-gray-600 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${(character.health.current / character.health.max) * 100}%` }}
              />
            </div>
            <h4 className="text-sm text-gray-400 mt-2 mb-1">Mana:</h4>
            <div className="w-full bg-gray-600 h-2 rounded">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${(character.mana.current / character.mana.max) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {showDiceRoller && (
            <div className="p-4 border-b border-gray-700">
              <DiceRoller onRollComplete={(result, type) => {
                const msg: Message = {
                  id: messages.length + 1,
                  sender: "system",
                  content: `Você rolou um ${type} e tirou ${result}`,
                  timestamp: new Date().toISOString()
                };
                setMessages((prev) => [...prev, msg]);
              }} />
            </div>
          )}

          {showBattleMap && (
            <div className="p-4">
              <SimpleGameMap
                tokens={mapTokens}
                mapWidth={600}
                mapHeight={400}
                gridSize={40}
                background="/textures/grass.svg"
                onTokenMove={(id, x, y) => {
                  setMapTokens(prev =>
                    prev.map(t => t.id === id ? { ...t, x, y } : t)
                  );
                }}
                onAddToken={(x, y) => {
                  setMapTokens(prev => [...prev, {
                    id: `token_${Date.now()}`,
                    x, y, name: "NPC", size: 0.7,
                    isPlayer: false, color: "#e67e22"
                  }]);
                }}
              />
            </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-2 rounded ${msg.sender === "player" ? "bg-blue-900" : msg.sender === "dm" ? "bg-gray-700" : "bg-yellow-800"}`}>
                <div className="text-xs text-gray-400">{msg.sender} — {new Date(msg.timestamp).toLocaleTimeString()}</div>
                <div>{msg.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <footer className="flex items-center p-4 border-t border-gray-700 space-x-2">
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className={`px-3 py-2 rounded-full ${listening ? "bg-red-700" : "bg-blue-700"}`}
            >
              🎤
            </button>
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua ação..."
              className="flex-1 bg-gray-700 px-3 py-2 rounded-md focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              className="px-4 py-2 bg-blue-700 rounded-md"
            >
              Enviar
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

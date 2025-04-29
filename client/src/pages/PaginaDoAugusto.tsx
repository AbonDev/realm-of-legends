import React, { useState, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Função para perguntar ao GPT
async function askDungeonMaster(playerMessage: string): Promise<string> {
  const response = await fetch("/api/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: playerMessage }),
  });

  if (!response.ok) {
    throw new Error("Erro ao falar com o Dungeon Master.");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Função para tocar voz do Dungeon Master
async function playDungeonMasterVoice(text: string) {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("Erro ao gerar voz:", await response.text());
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("Erro ao tocar áudio:", error);
  }
}

export default function GamePage() {
  const [messages, setMessages] = useState<string[]>([
    "Dungeon Master: Bem-vindo, Aventureiro! Eu sou seu AI Dungeon Master e vou te guiar através dessa aventura.",
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  async function handleSend(messageToSend?: string) {
    const message = messageToSend ?? inputMessage.trim();
    if (message === "") return;

    setMessages(prev => [...prev, `You: ${message}`]);
    setInputMessage("");

    try {
      const response = await askDungeonMaster(message);
      setMessages(prev => [...prev, `Dungeon Master: ${response}`]);
      await playDungeonMasterVoice(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, "Dungeon Master: (Erro ao responder)"]);
    }
  }

  function handleMouseDown() {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Seu navegador não suporta reconhecimento de voz!");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = "pt-BR"; // ou "pt-BR" se quiser
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Topo */}
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="text-xl font-bold">
          Adventurer <span className="text-sm font-normal">Level 1</span>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Dice</button>
          <button className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Battle Map</button>
          <button className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Character</button>
          <button className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-600">Save & Exit</button>
        </div>
      </header>

      {/* Corpo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Área principal de diálogo */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-center text-2xl mb-6">Bem-vindo ao Realm of Legends! Sua aventura começa agora...</h1>

          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index}>
                <p className="text-sm text-yellow-500">{msg.startsWith("You:") ? "You" : "Dungeon Master"}</p>
                <div className="flex justify-between items-center bg-gray-800 p-4 rounded mt-1">
                  <p>{msg.replace("You: ", "").replace("Dungeon Master: ", "")}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar direita */}
        <aside className="w-80 bg-gray-800 p-6 border-l border-gray-700">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Available Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Enter the Village</button>
                <button className="w-full bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Observe Surroundings</button>
                <button className="w-full bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Check Equipment</button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Current Location</h2>
              <p className="text-sm">Meadowbrook Village Entrance</p>
              <p className="text-xs text-gray-400">Time: Evening</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Party Status</h2>
              <div>
                <p className="text-sm mb-1">Adventurer</p>
                <div className="bg-green-700 h-2 rounded"></div>
                <p className="text-xs text-green-400 mt-1">Healthy</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Rodapé */}
      <footer className="p-4 border-t border-gray-700 flex items-center space-x-4">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={`px-6 py-2 rounded ${listening ? "bg-red-700" : "bg-yellow-700"} hover:bg-yellow-600`}
        >
          Hold to Speak
        </button>
        <input
          type="text"
          placeholder="Type your message or use voice..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 placeholder-gray-400 text-white focus:outline-none"
        />
        <button 
          onClick={() => handleSend()}
          className="bg-blue-700 px-6 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </footer>
    </div>
  );
}

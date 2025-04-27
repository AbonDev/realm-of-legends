import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";

// SUA NOVA API KEY AQUI
const apiKey = "pegar no particular comigo";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = app.route("/api");

  // 🔥 ROTA 1: Perguntar para o GPT-4
  app.post("/api/ask-gpt", async (req, res) => {
    try {
      const { message } = req.body;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "Você é um Mestre de Masmorra narrando aventuras de fantasia medieval D&D 5, de forma imersiva, respondendo de forma realista." },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      const bodyText = await response.text();

      if (!response.ok) {
        console.error("Erro da OpenAI:", bodyText);
        return res.status(500).json({ message: "Erro ao consultar Dungeon Master", detail: bodyText });
      }

      const data = JSON.parse(bodyText);
      res.json(data);
    } catch (error) {
      console.error("Erro geral:", error);
      res.status(500).json({ message: "Erro geral no servidor", error: String(error) });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Texto ausente no pedido." });
      }

      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "ash", 
          response_format: "mp3",
        }),
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error("Erro no TTS da OpenAI:", errorText);
        return res.status(500).json({ message: "Erro ao gerar voz.", detail: errorText });
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("Erro interno no /api/tts:", error);
      res.status(500).json({ message: "Erro interno no servidor TTS", error: String(error) });
    }
  });

  // 🔵 SUAS ROTAS EXISTENTES CONTINUAM NORMALMENTE:

  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get characters", error: String(error) });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to get character", error: String(error) });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const character = req.body;

      if (!character.name || !character.race || !character.class) {
        return res.status(400).json({ message: "Missing required character fields" });
      }

      const savedCharacter = await storage.createCharacter(character);
      res.status(201).json(savedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Failed to create character", error: String(error) });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const character = req.body;
      const updatedCharacter = await storage.updateCharacter(id, character);
      if (!updatedCharacter) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update character", error: String(error) });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const success = await storage.deleteCharacter(id);
      if (!success) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

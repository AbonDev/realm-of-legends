import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";
import dotenv from "dotenv";
import {
  getSessionMessages,
  appendSessionMessage,
  type Message,
} from "./sessionHistory";

dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {

  // Perguntar para o GPT-4 com histórico de sessão
  app.post("/api/ask-gpt", async (req, res) => {
    try {
      const { message, sessionId } = req.body;

      if (!sessionId || !message) {
        return res
          .status(400)
          .json({ error: "sessionId e message são obrigatórios." });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "OpenAI API key is not configured" });
      }

      // Carrega o histórico
      const previousMessages = await getSessionMessages(sessionId);

      const userMessage: Message = { role: "user", content: message };

      const messages: Message[] = [
        {
          role: "system",
          content:
            "Você é um Mestre de RPG medieval. Continue a história SEM repetir tudo. Respeite as ações dos jogadores, dê liberdade criativa, peça rolagens quando necessário. Continue sempre em até 100 tokens, não corte o raciocínio.",
        },
        ...previousMessages,
        userMessage,
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages,
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      const bodyText = await response.text();

      if (!response.ok) {
        console.error("Erro da OpenAI:", bodyText);
        return res
          .status(500)
          .json({ message: "Erro ao consultar Dungeon Master", detail: bodyText });
      }

      const data = JSON.parse(bodyText);
      const reply = data.choices?.[0]?.message?.content || "(Sem resposta do Mestre)";

      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
      };

      // Salva o histórico
      await appendSessionMessage(sessionId, userMessage);
      await appendSessionMessage(sessionId, assistantMessage);

      res.json({ reply });
    } catch (error) {
      console.error("Erro geral:", error);
      res.status(500).json({ message: "Erro geral no servidor", error: String(error) });
    }
  });

  // Buscar histórico da sessão
app.get("/api/session-history/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório" });
    }

    const messages = await getSessionMessages(sessionId);

    res.json({ messages });
  } catch (error) {
    console.error("Erro ao buscar histórico da sessão:", error);
    res.status(500).json({ message: "Erro interno ao buscar histórico" });
  }
});


  // Texto para voz
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Texto ausente no pedido." });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "OpenAI API key is not configured" });
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
          voice: "onyx",
          response_format: "mp3",
        }),
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error("Erro no TTS da OpenAI:", errorText);
        return res
          .status(500)
          .json({ message: "Erro ao gerar voz.", detail: errorText });
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("Erro interno no /api/tts:", error);
      res.status(500).json({ message: "Erro interno no servidor TTS", error: String(error) });
    }
  });

  // Personagens e dados do jogo (racas, classes, backgrounds)
  // [todo o seu CRUD de personagens e endpoints do jogo permanecem exatamente como estavam]

  const httpServer = createServer(app);
  return httpServer;
}

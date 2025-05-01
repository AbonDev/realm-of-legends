import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_DIR = path.join(__dirname, "../sessions");

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Garante que a pasta de sessões existe
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch (err) {
    console.error("Erro ao criar pasta de sessões:", err);
  }
}

// Retorna o caminho do arquivo da sessão
function getSessionFilePath(sessionId: string): string {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

// Retorna todas as mensagens da sessão
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  await ensureDirectoryExists();
  const filePath = getSessionFilePath(sessionId);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as Message[];
  } catch {
    return [];
  }
}

// Adiciona uma nova mensagem ao histórico da sessão
export async function appendSessionMessage(sessionId: string, message: Message): Promise<void> {
  const messages = await getSessionMessages(sessionId);
  messages.push(message);

  const filePath = getSessionFilePath(sessionId);
  await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");
}

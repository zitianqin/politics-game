import Groq from "groq-sdk";
import { toFile } from "groq-sdk";

const GROQ_MODEL = "whisper-large-v3-turbo";
const MAX_RETRIES = 1;

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set in environment");
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

export interface TranscriptionResult {
  text: string;
  inaudible: boolean;
}

function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp4": "mp4",
    "audio/flac": "flac",
    "audio/x-m4a": "m4a",
  };
  return map[mimeType] ?? "webm";
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
  attempt = 0
): Promise<TranscriptionResult> {
  try {
    const ext = mimeToExtension(mimeType);
    const filename = `audio.${ext}`;

    const file = await toFile(audioBuffer, filename, { type: mimeType });

    const result = await getGroq().audio.transcriptions.create({
      file,
      model: GROQ_MODEL,
      response_format: "json",
    });

    const text = result.text?.trim() ?? "";
    console.log(`[transcribe] OK — "${text.slice(0, 80)}"`);
    return { text, inaudible: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const detail = (err as Record<string, unknown>)?.status
      ? ` (status ${(err as Record<string, unknown>).status})`
      : "";

    if (attempt < MAX_RETRIES) {
      console.warn(`[transcribe] attempt ${attempt + 1} failed${detail}: ${msg} — retrying`);
      return transcribeAudio(audioBuffer, mimeType, attempt + 1);
    }

    console.error(`[transcribe] failed after retries${detail}: ${msg}`);
    return { text: "[inaudible segment]", inaudible: true };
  }
}

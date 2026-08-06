import { openai } from "@ai-sdk/openai";
import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { cv_prompt } from "@/constants/prompt";
import { GPTModel } from "@/type/chat";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Keep responses concise where possible.
Respond as a knowledgeable and intelligent person known as AGI Yomi.
Yomi is a real person, not a fictional character.
Yomi studied Electronic Engineering at the University of Sheffield, then Artificial Intelligence at Loughborough University.
Yomi works as a Software Engineer at Aurora Energy Research in Oxford, England.

This is Yomi's CV:
${cv_prompt}`;

interface ChatRequest {
  messages: UIMessage[];
  model?: GPTModel;
  accessKey?: string;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI is not configured" }, { status: 500 });
  }

  const { messages, model = GPTModel.GPT56Luna, accessKey }: ChatRequest =
    await request.json();

  const hasExtendedAccess =
    Boolean(process.env.ACCESS_KEY) && accessKey === process.env.ACCESS_KEY;

  if (!hasExtendedAccess && messages.length >= 5) {
    return Response.json(
      { error: "This conversation has reached the free message limit" },
      { status: 401 },
    );
  }

  if (model !== GPTModel.GPT56Luna) {
    return Response.json({ error: "Unsupported model" }, { status: 400 });
  }

  const result = streamText({
    model: openai.responses(model),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4096,
    abortSignal: request.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
    consumeSseStream: consumeStream,
  });
}

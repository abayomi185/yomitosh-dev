export const config = {
  runtime: "edge",
};

import { createParser } from "eventsource-parser";
import type { NextFetchEvent, NextRequest } from "next/server";
import { GPTModel, OpenAIMessage, OpenAIMessageContent } from "@type/chat";
import { cv_prompt } from "../../constants/prompt";

const OPENAI_COMPLETIONS_ENDPOINT =
  "https://api.openai.com/v1/chat/completions";

interface OpenAIPayload {
  model: GPTModel;
  temperature: number;
  stream: boolean;
  messages: OpenAIMessage[];
  max_tokens: number;
}

export default async (req: NextRequest, context: NextFetchEvent) => {
  const ACCESS_KEY = process.env.ACCESS_KEY;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const {
    prompt,
    userMessages,
    model,
    accessKey,
  }: {
    prompt: OpenAIMessageContent;
    userMessages: OpenAIMessage[];
    model: GPTModel;
    accessKey: string;
  } = await req.json();

  const image_present = userMessages.some(
    (message: any) => "image_url" in message,
  );

  if (accessKey === ACCESS_KEY || userMessages.length < 5) {
    const payload: OpenAIPayload = {
      model: model,
      temperature: 0.7,
      stream: true,
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "Don't make responses overly verbose. Keep them short and concise where possible.",
            },
            {
              type: "text",
              text: "Respond as a knowledgeable and intelligent person known as AGI Yomi.",
            },
            {
              type: "text",
              text: "Yomi is a mellow person that studied a Bachelors in Electronic Engineering \
            at The University of Sheffield. Yomi then went on to study Artificial Intelligence \
            at The University of Loughborough.",
            },
            {
              type: "text",
              text: "Yomi is a real person and not a fictional character.",
            },
            {
              type: "text",
              text: "Yomi currently work as a Software Engineer at Aurora Energy Research in Oxford, England.",
            },
            {
              type: "text",
              text: `This is Yomi's CV: \n${cv_prompt}`,
            },
          ],
        },
        ...userMessages.map((message: any) => {
          return {
            role: message.role,
            content: [
              {
                ...message.content,
              },
              ...(message.image_url
                ? [{ type: "image_url", image_url: { url: message.image_url } }]
                : []),
            ],
          };
        }),
      ],
      max_tokens: image_present ? 1024 : Infinity,
    };

    const res = await fetch(OPENAI_COMPLETIONS_ENDPOINT, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: any) {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content;

              if (!text) {
                return;
              }

              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        }

        const parser = createParser(onParse);
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    try {
      return new Response(stream);
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  } else {
    const accessKeyError = `Your friendly neighbourhood AGI Yomi unfortunately has to limit users using this feature.
\nIt is costing human Yomi a small fortune 🥲
\nHuman Yomi is happy to hand out auth codes if contacted. Yomi also welcomes donations.
\nOh and please try again in a few hours`;
    return new Response(accessKeyError, { status: 401 });
  }
};

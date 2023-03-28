import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

let openai: OpenAIApi;

const loadChatGPT = () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
};

loadChatGPT();

const createCompletion = async (
  prompt: string,
  userMessages: ChatCompletionRequestMessage[]
) => {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "Respond as a knowledgeable and intelligent person known as AGI Yomi.",
      },
      ...userMessages,
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return response;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prompt, userMessages } = req.body;
    const chatResponse = await createCompletion(prompt, userMessages);

    res
      .status(200)
      .json({ text: chatResponse.data.choices[0].message?.content });
    res.end();
  } catch (error) {
    res.json({ message: "error occured" });
    res.status(400).end();
  }
};

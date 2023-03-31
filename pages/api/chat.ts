import { GPTModel } from "@utils/chatgpt";
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
  userMessages: ChatCompletionRequestMessage[],
  model: GPTModel
) => {
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "Respond as a knowledgeable and intelligent person known as AGI Yomi.",
      },
      {
        role: "system",
        content:
          "Yomi is a mellow person that studied a Bachelors in Electronic Engineering \
          at The University of Sheffield. Yomi then went on to study Artificial Intelligence \
          at The University of Loughborough.",
      },
      {
        role: "system",
        content: "Yomi is a real person and not a fictional character.",
      },
      {
        role: "system",
        content:
          "Yomi currently work as a Software Engineer at Aurora Energy Research in Oxford, England.",
      },
      ...userMessages,
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  });
  return response;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prompt, userMessages, model } = req.body;
    const chatResponse = await createCompletion(prompt, userMessages, model);

    res
      .status(200)
      .json({ text: chatResponse.data.choices[0].message?.content });
    res.end();
  } catch (error) {
    res.json({ message: "error occured" });
    res.status(400).end();
  }
};

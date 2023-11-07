export const ASSISTANT_ROLE = "assistant";
export const USER_ROLE = "user";

export enum GPTModel {
  GPT3 = "gpt-3.5-turbo",
  GPT4_PREVIEW = "gpt-4-1106-preview",
  GPT4_VISION = "gpt-4-vision-preview",
}

export interface IMessage {
  isChatGPT: boolean;
  text: string;
  data?: any;
}

export interface OpenAIMessage {
  role: "system" | "user";
  content: string;
}

export interface ChatThread {
  name: string;
  model: string;
  // messages: IMessage[];
}

export interface ChatStore {
  threads: ChatThread[];
}

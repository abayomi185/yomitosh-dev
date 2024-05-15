export const ASSISTANT_ROLE = "assistant";
export const USER_ROLE = "user";

export enum GPTModel {
  GPT3_5 = "gpt-3.5-turbo",
  GPT4O = "gpt-4o",
  GPT4_PREVIEW = "gpt-4-1106-preview",
}

export interface IMessage {
  isChatGPT: boolean;
  text: string;
  data?: any;
  image?: string;
}

export interface OpenAIMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: string;
}

export interface OpenAIMessage {
  role: "system" | "user";
  content: OpenAIMessageContent[];
}

export interface ChatThread {
  name: string;
  model: string;
  // messages: IMessage[];
}

export interface ChatStore {
  threads: ChatThread[];
}

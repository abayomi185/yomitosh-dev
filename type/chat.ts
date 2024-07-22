export const ASSISTANT_ROLE = "assistant";
export const USER_ROLE = "user";

export enum GPTModel {
  GPT4o_mini = "gpt-4o-mini",
  GPT4o = "gpt-4o",
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

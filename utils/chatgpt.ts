export const ASSISTANT_ROLE = "assistant";
export const USER_ROLE = "user";

export interface IMessage {
  isChatGPT: boolean;
  text: string;
  data?: any;
}

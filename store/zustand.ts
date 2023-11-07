import { ChatStore } from "@type/chat";
import { create } from "zustand";

export const chatStore = create<ChatStore>((_set, _get) => ({
  // Initial state
  threads: [],
}));

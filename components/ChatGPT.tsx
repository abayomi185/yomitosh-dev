import { useEffect, useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type FileUIPart,
  type UIMessage,
} from "ai";
import { useRouter } from "next/router";
import { FaRegClipboard, FaCheck } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { GPTModel } from "@type/chat";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });
const CHAT_STORAGE_KEY = "chatThreads:v2";


const ChatGPT = () => {
  const router = useRouter();

  const [accessKey, setAccessKey] = useState("");
  const [storedMessages, setStoredMessages] = useState<UIMessage[][]>([[]]);
  const [storedMessageIndex, setStoredMessageIndex] = useState(0);
  const [storedMessagesLoaded, setStoredMessagesLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [gptModel, setGptModel] = useState(GPTModel.GPT56Luna);
  const [textAreaRows, setTextAreaRows] = useState(1);
  const [image, setImage] = useState<string | null>(null);

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    error,
    clearError,
  } = useChat({ transport: chatTransport });

  const loadingResponse = status === "submitted" || status === "streaming";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageBoxRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, imageDrop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files?: File[] }) => {
      // handle the drop
      if (item.files && item.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            setImage(event.target.result);
          }
        };
        reader.readAsDataURL(item.files[0]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));


  const sendPrompt = (text: string) => {
    const files: FileUIPart[] = image
      ? [
          {
            type: "file",
            mediaType:
              image.slice(5, image.indexOf(";")) || "application/octet-stream",
            url: image,
          },
        ]
      : [];

    void sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text }, ...files],
      },
      {
        body: {
          model: gptModel,
          accessKey,
        },
      },
    );

    setPrompt("");
    setImage(null);
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageBoxRef.current;
      if (scrollTop + clientHeight - scrollHeight > -75) {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  };

  const moveStoredMessage = (offset: -1 | 1) => {
    setStoredMessageIndex((current) =>
      Math.min(Math.max(current + offset, 0), storedMessages.length - 1),
    );
  };

  const createNewChat = () => {
    stop();
    clearError();
    const nextIndex = storedMessages.length;
    setStoredMessages((current) => [...current, []]);
    setStoredMessageIndex(nextIndex);
    setMessages([]);
    setPrompt("");
    setImage(null);
  };

  const deleteStoredChat = () => {
    stop();
    clearError();

    if (storedMessages.length <= 1) {
      setStoredMessages([[]]);
      setStoredMessageIndex(0);
      setMessages([]);
      return;
    }

    const nextThreads = storedMessages.filter(
      (_, index) => index !== storedMessageIndex,
    );
    const nextIndex = Math.max(0, storedMessageIndex - 1);
    setStoredMessages(nextThreads);
    setStoredMessageIndex(nextIndex);
    setMessages(nextThreads[nextIndex] ?? []);
  };

  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    event.preventDefault();
    const text = prompt.trim();
    if (text && !loadingResponse) {
      sendPrompt(text);
    }
  };

  useEffect(() => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(CHAT_STORAGE_KEY) ?? "[]",
      );
      const stored: UIMessage[][] =
        Array.isArray(parsed) && parsed.length > 0 ? parsed : [[]];
      const latestIndex = stored.length - 1;
      setStoredMessages(stored);
      setStoredMessageIndex(latestIndex);
      setMessages(stored[latestIndex] ?? []);
    } catch {
      setStoredMessages([[]]);
      setStoredMessageIndex(0);
      setMessages([]);
    } finally {
      setStoredMessagesLoaded(true);
    }
  }, [setMessages]);

  useEffect(() => {
    const { chat } = router.query;
    if (chat === "true") setShowModal(true);
  }, [router.isReady]);

  useEffect(() => {
    const textRows = prompt.split("\n").length;
    const rows =
      textRows >= 2 && textRows <= 3 ? textRows : textRows > 3 ? 3 : 1;
    setTextAreaRows(rows);
  }, [prompt]);


  useEffect(() => {
    scrollToBottom();

    if (!storedMessagesLoaded) {
      return;
    }

    setStoredMessages((current) => {
      const next = [...current];
      next[storedMessageIndex] = messages;
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [messages, storedMessageIndex, storedMessagesLoaded]);

  useEffect(() => {
    if (storedMessagesLoaded) {
      setMessages(storedMessages[storedMessageIndex] ?? []);
    }
  }, [storedMessageIndex, storedMessagesLoaded, setMessages]);



  const firstMessageText = messages[0]?.parts.find(
    (part) => part.type === "text",
  )?.text;

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <section className="flex px-3 pb-12 sm:px-0">
        <span className="mx-auto flex w-full justify-center md:w-4/5 lg:w-3/6">
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="relative mx-auto h-auto w-3/4 rounded-xl px-12 py-4 text-base font-bold shadow-md transition-transform hover:-translate-y-0.5 md:w-2/4"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {openaiSVG}
              </span>
              <span>
                Chat with my
                <br />
                consciousness
              </span>
            </Button>
          </DialogTrigger>
        </span>
      </section>

      <DialogContent
        ref={(node) => {
          imageDrop(node);
        }}
        className="flex h-[95dvh] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0 md:h-[78vh]"
      >
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            A.G.I. Yomi
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chat with Yomi&apos;s AI consciousness.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/35 px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={deleteStoredChat}
              aria-label="Delete current chat"
            >
              <Trash2 />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => moveStoredMessage(-1)}
              disabled={storedMessageIndex === 0 || loadingResponse}
              aria-label="Previous chat"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="cursor-default tabular-nums"
              disabled
            >
              History {storedMessageIndex ?? 0}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => moveStoredMessage(1)}
              disabled={
                storedMessageIndex >= storedMessages.length - 1 ||
                loadingResponse
              }
              aria-label="Next chat"
            >
              <ChevronRight />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={createNewChat}
              disabled={messages.length <= 0 || loadingResponse}
              aria-label="New chat"
            >
              <Plus />
            </Button>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Label htmlFor="chat-model" className="text-xs text-muted-foreground">
              Model
            </Label>
            <Select
              value={gptModel}
              onValueChange={(value) => setGptModel(value as GPTModel)}
            >
              <SelectTrigger id="chat-model" className="h-9 w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GPTModel).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="access-key" className="sr-only">
              Extended access key
            </Label>
            <Input
              id="access-key"
              type="password"
              placeholder="Access key"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
              className="h-9 w-32 bg-background"
            />
          </div>
        </div>

        {firstMessageText ? (
          <p className="truncate border-b px-6 py-2 text-sm text-muted-foreground">
            {firstMessageText}
          </p>
        ) : null}

        <div
          className={`flex min-h-0 grow flex-col px-2 pb-4 pt-3 md:px-6 ${
            isOver ? "bg-muted" : ""
          }`}
        >
          <div
            ref={messageBoxRef}
            className="mx-2 mb-3 flex grow flex-col overflow-x-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/40 md:mx-6"
          >
            {messages.map((message) => (
              <ChatDialog key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {image ? (
            <div className="px-2 pb-2 md:px-6">
              <div className="relative inline-block">
                <img
                  src={image}
                  alt="Image attached to the next message"
                  className="h-24 w-24 rounded-lg border object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                  onClick={() => setImage(null)}
                  aria-label="Remove attached image"
                >
                  <X />
                </Button>
              </div>
            </div>
          ) : null}

          <div className="min-h-6 px-2 text-sm md:px-6">
            {loadingResponse ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Thinking
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={stop}>
                  Cancel
                </Button>
              </div>
            ) : null}
            {error ? (
              <p className="text-destructive">{error.message}</p>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full items-end gap-2 px-2 pt-2 md:px-6"
          >
            <Textarea
              className="max-h-28 min-h-10 resize-none"
              onChange={(event) => {
                setPrompt(event.target.value);
                clearError();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              value={prompt}
              rows={textAreaRows}
              placeholder="Ask something"
              aria-label="Message"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={loadingResponse || prompt.trim() === ""}
              aria-label="Send message"
            >
              <Send />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ChatGPT;

const openaiSVG = (
  <svg
    height="2rem"
    width="2rem"
    fill="#fff"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <title>OpenAI icon</title>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path>
    </g>
  </svg>
);

const CodeCopyBtn = ({ children }) => {
  const [copy, setCopy] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children[0].props.children[0]);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 500);
  };
  return (
    <div
      className="cursor-pointer h-6 w-16 mb-1 ml-auto hover:opacity-80 bg-green-600 rounded-lg flex items-center justify-center"
      onClick={copyCode}
    >
      {!copy ? <FaRegClipboard size="1rem" /> : <FaCheck size="1.25rem" />}
    </div>
  );
};

const ChatDialog = ({ message }: { message: UIMessage }) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`mb-2 max-w-full break-words rounded-2xl px-3 py-3 ${
        isAssistant
          ? "mr-auto bg-secondary text-secondary-foreground"
          : "ml-auto bg-primary text-primary-foreground"
      }`}
    >
      {isAssistant ? (
        <p className="mb-2 border-b border-current/20 pb-1 text-sm font-semibold">
          A.G.I Yomi
        </p>
      ) : null}
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <ReactMarkdown
              key={`${message.id}-text-${index}`}
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => (
                  <pre className="relative my-2 mb-4 w-full rounded-lg bg-gray-800 p-2 text-gray-100">
                    <CodeCopyBtn>{children}</CodeCopyBtn>
                    <div className="overflow-auto pb-4">{children}</div>
                  </pre>
                ),
                code({
                  className = "overflow-auto",
                  children,
                  ...props
                }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={a11yDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {part.text}
            </ReactMarkdown>
          );
        }

        if (part.type === "file" && part.mediaType.startsWith("image/")) {
          return (
            <img
              key={`${message.id}-image-${index}`}
              src={part.url}
              alt={part.filename ?? "Chat attachment"}
              className="h-48 w-48 rounded-lg object-contain"
            />
          );
        }

        return null;
      })}
    </div>
  );
};

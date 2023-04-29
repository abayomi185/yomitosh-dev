import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  FaPaperPlane,
  FaTimesCircle,
  FaRegClipboard,
  FaCheck,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

import { ASSISTANT_ROLE, GPTModel, IMessage, USER_ROLE } from "@utils/chatgpt";
import { Action } from "@utils/util";

const ChatGPT = () => {
  const router = useRouter();

  const [accessKey, setAccessKey] = useState("");

  const [isChatHistoryEnabled, setChatHistory] = useState(true);
  // const [storedMessages, setStoredMessages] = useState<{
  //   [key: string]: IMessage[];
  // }>({});
  const [storedMessages, setStoredMessages] = useState<IMessage[][]>([[]]);
  const [storedMessageIndex, setStoredMessageIndex] = useState<number>(0);
  const [storedMessagesLoaded, setStoredMessagesLoaded] =
    useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [promptCounter, setPromptCounter] = useState(0);

  const [textAreaRows, setTextAreaRows] = useState(1);

  const [loadingResponse, setLoadingResponse] = useState(false);
  const [errorResponse, setErrorResponse] = useState(false);

  const [checkedGPT4, setCheckedGPT4] = useState(false);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);

  const abortController = useRef(null);

  function updateStreamedMessage(message: string) {
    setMessages((prevItems) => {
      const lastMessageIndex = prevItems.length - 1;
      const newMessages = [...prevItems];
      newMessages[lastMessageIndex] = {
        isChatGPT: true,
        text: message,
      };
      return newMessages;
    });
  }

  const resetMessages = () => {
    setMessages([]);
    setPrompt("");
    setPromptCounter(0);
    setLoadingResponse(false);
    abortController.current && abortController.current.abort();
  };

  const getCompletion = async (prompt: string) => {
    abortController.current = new AbortController();

    const response = await fetch("api/chat", {
      signal: abortController.current.signal,
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        userMessages: [
          ...messages.map((message) => {
            if (message.isChatGPT) {
              return { role: ASSISTANT_ROLE, content: message.text };
            } else {
              return { role: USER_ROLE, content: message.text };
            }
          }),
        ],
        model: checkedGPT4 ? GPTModel.GPT4 : GPTModel.GPT3,
        accessKey: accessKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 400) {
      setLoadingResponse(false);
      setErrorResponse(true);
    }

    try {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let message = ""; // Message built from parsed chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedValue = decoder.decode(value);

        message = message + decodedValue;
        setMessages([...messages, { isChatGPT: true, text: "" }]);
        updateStreamedMessage(message);
      }

      setLoadingResponse(false);
    } catch (error) {
      console.log(error);
      setLoadingResponse(false);
      setErrorResponse(true);
    }
  };

  const sendPrompt = (prompt: string) => {
    setMessages([...messages, { isChatGPT: false, text: prompt }]);
    setPromptCounter(promptCounter + 1);
    setPrompt("");

    setLoadingResponse(true);
  };

  const scrollToBottom = (immediately: boolean = false) => {
    if (messageBoxRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const retrieveStoredMessage = (direction: Action) => {
    if (direction === Action.BACK) {
      storedMessageIndex - 1 >= 0 &&
        setStoredMessageIndex(storedMessageIndex - 1);
      // storeMessages();
    }
    if (direction === Action.FORWARD) {
      storedMessageIndex + 1 <= storedMessages.length &&
        setStoredMessageIndex(storedMessageIndex + 1);
      // storeMessages();
    }
  };

  const getAllStoredMessages = () => {
    const messagesFromStorage = JSON.parse(
      localStorage.getItem("storedMessages")
    ) || [[]];
    setStoredMessages(messagesFromStorage);
    setStoredMessageIndex(messagesFromStorage?.length - 1);
    setStoredMessagesLoaded(true);
  };

  const createNewChat = () => {
    resetMessages();
    setStoredMessageIndex(storedMessageIndex + 1);
  };

  // const deleteStoredChat = () => {
  //   const messagesToStore = storedMessages;
  //   messagesToStore.splice(storedMessageIndex, 1);
  //   setStoredMessages(messagesToStore);
  //   createNewChat();
  // };

  const deleteAllStoredChat = () => {
    resetMessages();
    setStoredMessageIndex(0);
    setStoredMessages([]);
    localStorage.clear();
  };

  const storeMessages = () => {
    if (isChatHistoryEnabled) {
      if (storedMessagesLoaded) {
        const messagesToStore = storedMessages;
        if (messages?.length !== 0) {
          messagesToStore[storedMessageIndex] = messages;
        }
        setStoredMessages(messagesToStore);
      }
    }
  };

  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    if (prompt !== "") sendPrompt(prompt);
  };

  useEffect(() => {
    getAllStoredMessages();
  }, []);

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
    promptCounter > 0 && getCompletion(messages.at(-1)?.text);
  }, [promptCounter]);

  useEffect(() => {
    scrollToBottom();
    storeMessages();
  }, [messages]);

  useEffect(() => {
    setMessages(storedMessages[storedMessageIndex]);
  }, [storedMessageIndex]);

  useEffect(() => {
    localStorage.setItem("storedMessages", JSON.stringify(storedMessages));
  }, [storedMessages.map((message) => message?.length)]);

  useEffect(() => {
    showModal && (document.body.style.overflow = "hidden");
    !showModal && (document.body.style.overflow = "unset");
  }, [showModal]);

  return (
    <>
      <section className="flex px-3 sm:px-0 pb-12">
        <span className="w-full md:w-4/5 lg:w-3/6 mx-auto">
          <button
            className="relative transition mx-auto w-3/4 md:w-2/4 duration-200 font-bold bg-gray-700 border-gray-700 border-2 hover:bg-custom-7 py-4 block text-center text-gray-200 hover:text-gray-800 rounded-lg px-12 md:px-12"
            onClick={() => {
              setShowModal(!showModal);
            }}
          >
            <span className="absolute left-0 top-0 bottom-0 pl-3 flex items-center">
              {openaiSVG}
            </span>
            <span>
              Chat with my
              <br />
              consciousness
            </span>
          </button>
        </span>
      </section>
      {showModal && (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-full max-w-4xl h-[95%] md:h-3/4 flex">
              {/*content*/}
              <div className="border-0 rounded-2xl shadow-lg relative flex flex-col w-full h-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between px-4 py-2 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl">A.G.I. Yomi</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-75 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-red-800 h-6 w-6 mt-1 text-2xl block outline-none focus:outline-none">
                      <FaTimesCircle size="1.5rem" />
                    </span>
                  </button>
                </div>
                <div className="px-5 py-2 border-b border-solid border-slate-200 flex justify-between">
                  <div className="flex mr-auto relative">
                    <button
                      className="px-3 rounded bg-red-300 hover:bg-gray-300"
                      onClick={() => {
                        deleteAllStoredChat();
                        // deleteStoredChat();
                      }}
                    >
                      {"x"}
                    </button>
                    <button
                      className="px-3 rounded ml-1 bg-custom-7 hover:bg-gray-300 disabled:bg-gray-300"
                      onClick={() => {
                        retrieveStoredMessage(Action.BACK);
                      }}
                      disabled={storedMessageIndex === 0 || loadingResponse}
                    >
                      {"<"}
                    </button>
                    <button
                      className={`px-2 ml-1 rounded
                          ${
                            isChatHistoryEnabled ? "bg-custom-7" : "bg-gray-300"
                          }`}
                      onClick={() => {
                        setChatHistory(!isChatHistoryEnabled);
                      }}
                    >
                      {`Chat History: ${storedMessageIndex}`}
                    </button>
                    <button
                      className="px-3 rounded ml-1 bg-custom-7 hover:bg-gray-300 disabled:bg-gray-300"
                      onClick={() => {
                        retrieveStoredMessage(Action.FORWARD);
                      }}
                      disabled={
                        storedMessageIndex >= storedMessages?.length - 1 ||
                        loadingResponse
                      }
                    >
                      {">"}
                    </button>
                    <button
                      className="px-3 rounded ml-1 bg-slate-400 hover:bg-gray-300 disabled:bg-gray-300"
                      onClick={() => {
                        createNewChat();
                      }}
                      disabled={messages?.length <= 0 || loadingResponse}
                    >
                      {"+"}
                    </button>
                  </div>
                  <label className="cursor-pointer flex items-center">
                    Use GPT-4:
                    <input
                      type="checkbox"
                      checked={checkedGPT4}
                      onChange={() => {
                        // set checkedGPT4 to opposite of current value
                        setCheckedGPT4(!checkedGPT4);
                      }}
                      className="w-4 h-4 ml-2 accent-green-600 mr-2 align-middle cursor-pointer"
                    />
                  </label>
                  <label className="ml-8">
                    Access Key:{" "}
                    <input
                      type="password"
                      value={accessKey}
                      onChange={(event) => {
                        setAccessKey(event.target.value);
                      }}
                      className="border-gray-300 border-2 rounded px-1 py-0.5 w-28"
                    />
                  </label>
                </div>
                {/*body*/}
                <div className="px-2 md:px-6 pb-5 my-auto flex h-[0%] grow flex-col">
                  <div
                    ref={messageBoxRef}
                    className="overflow-x-auto grow mb-3 mx-6 flex flex-col scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                  >
                    {messages.map((message, index) => (
                      <ChatDialog
                        key={index}
                        content={message.text}
                        chatgpt={message.isChatGPT}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <p className="px-6">
                    {loadingResponse ? "Loading..." : null}
                    {errorResponse
                      ? "Oops, error occured, please try again."
                      : null}
                  </p>
                  <form
                    onSubmit={handleSubmit}
                    className="min-h-8 max-h-24 bottom-0 left-0 flex w-full px-6"
                  >
                    <div className="inline h-full relative flex-1 w-full mr-2">
                      <textarea
                        className="h-full border-solid border-2 border-gray-700 rounded-lg resize-none relative left-0 top-0 px-3 pt-3 pb-1 w-full"
                        onChange={(e) => {
                          setPrompt(e.target.value);
                          setErrorResponse(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        value={prompt || ""}
                        rows={textAreaRows}
                        placeholder={"Ask something"}
                      />
                    </div>
                    <div className="inline h-full">
                      <input
                        type="button"
                        className={`relative h-full transition duration-200 font-bold bg-gray-700 border-gray-700 border-2 ${
                          loadingResponse
                            ? "text-gray-700"
                            : "hover:bg-custom-7 hover:text-gray-800 text-gray-200"
                        } text-center rounded-lg px-5`}
                        value={"Send"}
                        onClick={() => {
                          if (prompt !== "") sendPrompt(prompt);
                        }}
                        disabled={loadingResponse}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div
            className="opacity-25 fixed inset-0 z-40 bg-black"
            onClick={() => {
              setShowModal(false);
            }}
          ></div>
        </>
      )}
    </>
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

const ChatDialog = ({ content, chatgpt }) => {
  return (
    <div
      className={`rounded-2xl px-3 py-3 text-gray-200 mb-2 break-words max-w-full ${
        !chatgpt ? "ml-auto bg-green-600" : "bg-gray-700 mr-auto"
      }`}
    >
      {chatgpt && (
        <p className="border-b border-solid border-gray-500 mb-2">A.G.I Yomi</p>
      )}
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <pre className="relative my-2 p-2 mb-4 bg-gray-600 rounded-lg w-full">
              <CodeCopyBtn>{children}</CodeCopyBtn>
              <div className="overflow-auto pb-4">{children}</div>
            </pre>
          ),
          code({
            node,
            inline,
            className = "overflow-auto",
            children,
            ...props
          }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
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
      />
    </div>
  );
};

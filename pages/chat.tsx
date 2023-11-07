import React from "react";
import ChatGPT from "@components/ChatGPT";
import Textarea from "react-textarea-autosize";

const sendPrompt = (prompt: string) => {};

const Chat: React.FC<{}> = () => {
  const [prompt, setPrompt] = React.useState("");
  const [textAreaRows, setTextAreaRows] = React.useState(1);

  const [loadingResponse, setLoadingResponse] = React.useState(false);

  React.useEffect(() => {
    const textRows = prompt.split("\n").length;
    const rows =
      textRows >= 2 && textRows <= 3 ? textRows : textRows > 3 ? 3 : 1;
    setTextAreaRows(rows);
  }, [prompt]);

  return (
    <div className="dark h-full w-full flex flex-col">
      <header>
        <div className="h-12 bg-gray-800 flex">
          <div className="px-3 py-3 text-gray-300">
            <h1>Chat with AGI Yomi [WIP]</h1>
          </div>
          <div className="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </div>
        </div>
      </header>
      <div className="flex-1 flex-grow bg-gray-900"></div>
      <div className="min-h-8 max-h-24 flex w-full px-6 py-2 pb-8 bg-gray-900">
        <div className="w-full mr-2">
          <Textarea
            className="max-h-60 min-h-full border-solid border-2 border-gray-700 bg-gray-700 rounded-lg resize-none px-3 py-3 w-full"
            onChange={(e) => {
              setPrompt(e.target.value);
              // setErrorResponse(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // handleSubmit(e);
              }
            }}
            value={prompt || ""}
            rows={1}
            placeholder={"Ask something"}
          />
        </div>
        <div className="inline h-full">
          <input
            type="button"
            className={`h-full transition duration-200 font-bold bg-gray-700 border-gray-700 border-2 ${
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
      </div>
    </div>
  );
};

export default Chat;

// You can use the CSS property height: auto; and overflow-y: auto;. But since you have resize-none and h-full classes, removing those should make your textarea automatically adjust its height based on input.

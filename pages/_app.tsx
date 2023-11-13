import "../css/index.css";
import { Analytics } from "@vercel/analytics/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <title>Yomi | Hub</title>
        <Component {...pageProps} />
        <Analytics />
      </DndProvider>
    </>
  );
}

export default MyApp;

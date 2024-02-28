import "../css/index.css";
import { Analytics } from "@vercel/analytics/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const { library, config } = require("@fortawesome/fontawesome-svg-core");
import "@fortawesome/fontawesome-svg-core/styles.css";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

config.autoAddCss = false;

library.add(fab);
library.add(fas);

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

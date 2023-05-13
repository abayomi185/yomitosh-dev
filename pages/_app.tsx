import "../css/index.css";
import { Analytics } from "@vercel/analytics/react";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <title>Yomi | Hub</title>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;

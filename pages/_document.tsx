// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="description"
          content="Link Hub for sites and projects by Abayomi Ikuru"
        />
        <meta
          name="keywords"
          content="Yomitosh, Yomi, PiServer, PiDeck, Photo, YouTube, Hub, CV"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:url" content="https://yomitosh.dev" />
        <meta property="og:title" content="Yomi's Hub" />
        <meta
          property="og:description"
          content="Link Hub for sites and projects by Abayomi O-Ikuru"
        />
        <meta property="og:image" content="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

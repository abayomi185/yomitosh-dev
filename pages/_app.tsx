import Head from "next/head";
import "../css/index.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Yomi | Hub</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

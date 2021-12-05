import Header from "../components/Header";
import LinkList from "../components/LinkList";
import ProjectLinkList from "../components/ProjectLinkList"
import SectionBreak from "../components/SectionBreak"
import Footer from "../components/Footer";
import Head from 'next/head'
import { initGA, logPageView } from '../utils/analytics'
import { useEffect } from 'react';

function IndexPage() {
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA()
      window.GA_INITIALIZED = true
    }
    logPageView()
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* FontAwesome CDN style tag */}
      {/* This is a comment */}
      <Head>
        <title>Yomi | Hub</title>
        <meta
          name="description"
          content="Link Hub for sites and projects by Abayomi Ikuru"
        />
        <meta name="keywords" content="Yomitosh, Yomi, PiServer, PiDeck, Photo, YouTube, Hub, CV"/>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossOrigin="anonymous"></link>
      </Head>

      {/* Profile Pic and Title Header*/}
      <Header />

      {/* List of Links generated from links.json */}
      <LinkList />
      <SectionBreak sectionName="- Project Highlights -" />
      <ProjectLinkList />

      {/* Social Links and Footer Disclaimer/Credits */}
      <Footer />
    </div>
  );
}

export default IndexPage;

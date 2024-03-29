import Header from "@components/Header";
import LinkList from "@components/LinkList";
import ProjectLinkList from "@components/ProjectLinkList";
import SectionBreak from "@components/SectionBreak";
// import Footer from "../components/Footer";
import { initGA, logPageView } from "@utils/analytics";
import { useEffect, useState } from "react";
import SocialBar from "@components/SocialBar";
import ChatGPT from "@components/ChatGPT";

function IndexPage() {
  const [gaInitialised, setGAInitialised] = useState(false);

  useEffect(() => {
    initGA();
    setGAInitialised(true);
  }, []);

  useEffect(() => {
    gaInitialised && logPageView();
  }, [gaInitialised]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Profile Pic and Title Header*/}
      <Header />

      <SocialBar />

      <ChatGPT />

      {/* List of Links generated from links.json */}
      <LinkList />

      <SectionBreak sectionName={"- Project Highlights -"} />

      <ProjectLinkList />

      {/* Social Links and Footer Disclaimer/Credits */}
      {/* <Footer /> */}
    </div>
  );
}

export default IndexPage;

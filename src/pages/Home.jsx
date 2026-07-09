import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BusinessValue from "../components/BusinessValue";
import Dashboard from "../components/Dashboard";
import EnterpriseOps from "../components/EnterpriseOps";
import Features from "../components/Features";
import KnowledgeBase from "../components/KnowledgeBase";
import TechnicianMemory from "../components/TechnicianMemory";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

function Home() {
  return (
    <main className="app">
      <section className="hero" id="home">
        <Navbar />
        <Hero />
      </section>
      <BusinessValue />
      <Dashboard />
      <EnterpriseOps />
      <Features />
      <KnowledgeBase />
      <TechnicianMemory />
      <Pricing />
      <Footer />
    </main>
  );
}

export default Home;

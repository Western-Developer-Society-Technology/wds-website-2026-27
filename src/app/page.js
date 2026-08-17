import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import Events from "@/components/sections/Events/Events";
import Portfolios from "@/components/sections/Portfolios/Portfolios";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Events />
      <Portfolios />
    </main>
  );
}

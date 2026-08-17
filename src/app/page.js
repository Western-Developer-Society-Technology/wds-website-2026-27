import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import Events from "@/components/sections/Events/Events";
import Portfolios from "@/components/sections/Portfolios/Portfolios";
import Partner from "@/components/sections/Partner/Partner";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Events />
      <Portfolios />
      <Partner />
    </main>
  );
}

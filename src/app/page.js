import Hero from "@/components/sections/Hero/Hero";
import WhatWeDo from "@/components/sections/WhatWeDo/WhatWeDo";
import Events from "@/components/sections/Events/Events";
import Portfolios from "@/components/sections/Portfolios/Portfolios";
import Team from "@/components/sections/Team/Team";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <Events />
      <Portfolios />
      <Team />
    </main>
  );
}

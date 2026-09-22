import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import styles from "./projects.module.css";

export const metadata = createPageMetadata({
  title: "Projects",
  description: "Western Developers Society projects. Coming soon.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main>
      <Nav />
      <section className={styles.placeholder} aria-label="Projects">
        <h1 className={styles.heading}>Coming soon</h1>
      </section>
      <Footer theme="dark" />
    </main>
  );
}

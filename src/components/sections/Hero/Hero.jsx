import Image from "next/image";
import Barcode from "@/components/ui/Barcode";
import HeroGrid from "./HeroGrid";
import HeroWordmark from "./HeroWordmark";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.inner}>
        <HeroGrid />

        <div className={styles.sideBarcode}>
          <Barcode orientation="horizontal" color="var(--ink)" />
        </div>
        <span className={styles.sideLine} aria-hidden="true" />

        <div className={styles.spacerTop} />

        <h1 className={styles.tagline}>
          building western’s tech community, line by line
        </h1>

        <div className={styles.spacerMid} />

        <p className={styles.subtitle}>
          western
          <br />
          developers
          <br />
          society
        </p>

        <div className={styles.stage}>
          <HeroWordmark />
          <div className={styles.imageClip} style={{ position: "absolute" }}>
            <Image
              src="/images/heroimage.png"
              alt="Western Developers Society members throwing up the W"
              fill
              priority
              sizes="(max-width: 768px) calc(100vw - 40px), min(1600px, calc(100vw - 80px))"
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.bars}>
          <div className={styles.yellows}>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
          </div>
          <div className={styles.blue} />
        </div>

        <div className={styles.bottomPad} />
      </div>
    </section>
  );
}

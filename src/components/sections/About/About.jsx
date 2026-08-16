import Image from "next/image";
import Barcode from "@/components/ui/Barcode";
import AboutCollage from "./AboutCollage";
import AboutGrid from "./AboutGrid";
import AboutHeading from "./AboutHeading";
import styles from "./About.module.css";

export default function About() {
  return (
    <section className={styles.about} aria-label="About">
      <div className={styles.inner}>
        <div className={styles.canvas}>
          <p className={styles.eyebrow}>what we do</p>

          <AboutHeading />

          <p className={styles.body}>
            Founded in 2022, we’ve grown to be one of western’s largest
            communities.
            <br />
            <br />
            From hands-on workshops and mentorship to collaborative projects and
            hackathons, WDS helps students gain real experience, build meaningful
            connections, and create technology that makes an impact.
          </p>

          <AboutCollage />

          <button type="button" className={styles.cta}>
            learn more
            <Image
              src="/icons/uprightarrow.svg"
              alt=""
              width={23}
              height={24}
              className={styles.ctaArrow}
            />
          </button>

          <div className={styles.barcodes} aria-hidden="true">
            <div className={styles.barcodeCol}>
              <Barcode orientation="vertical" color="var(--ink)" />
            </div>
            <div className={styles.barcodeCol}>
              <Barcode orientation="vertical" color="var(--ink)" />
            </div>
            <div className={styles.barcodeCol}>
              <Barcode orientation="vertical" color="var(--ink)" />
            </div>
            <div className={styles.barcodeCol}>
              <Barcode orientation="vertical" color="var(--ink)" />
            </div>
          </div>

          <AboutGrid />
        </div>
      </div>
    </section>
  );
}

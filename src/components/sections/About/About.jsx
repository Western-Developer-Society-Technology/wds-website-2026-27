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
            <span className={`${styles.ctaTick} ${styles.ctaTickTl}`} aria-hidden="true" />
            <span className={`${styles.ctaTick} ${styles.ctaTickTr}`} aria-hidden="true" />
            <span className={`${styles.ctaTick} ${styles.ctaTickBl}`} aria-hidden="true" />
            <span className={`${styles.ctaTick} ${styles.ctaTickBr}`} aria-hidden="true" />
            learn more
            <svg
              className={styles.ctaArrow}
              viewBox="0 0 23 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0.956243 22.5928L20.7556 1.30777M20.7558 22.5918L20.7556 1.30777L0.957322 1.30786"
                stroke="currentColor"
                strokeWidth="2.61566"
                strokeLinejoin="bevel"
              />
            </svg>
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

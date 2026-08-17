import CornerButton from "@/components/ui/CornerButton";
import PortfolioGrid from "./PortfolioGrid";
import styles from "./Portfolios.module.css";

export default function Portfolios() {
  return (
    <section className={styles.portfolios} aria-label="Portfolios">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headingGroup}>
            <h2 className={styles.heading}>portfolios</h2>
            <p className={styles.count}>7</p>
          </div>
          <CornerButton className={styles.cta} variant="dark">
            view all
          </CornerButton>
          <p className={styles.blurb}>
            WDS operates on 7 portfolios.<br />Learn more about what we do.
          </p>
        </div>
      </div>
      <PortfolioGrid />
    </section>
  );
}

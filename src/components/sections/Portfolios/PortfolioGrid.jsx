import Image from "next/image";
import Asterisk from "@/components/ui/Asterisk";
import { CELLS, PORTFOLIO_BY_ID } from "./portfolioData";
import styles from "./Portfolios.module.css";

export default function PortfolioGrid() {
  return (
    <div className={styles.band}>
      <div className={styles.grid}>
        {CELLS.map((id, index) => {
          if (id === null) {
            return (
              <div key={`filler-${index}`} className={styles.filler} aria-hidden="true" />
            );
          }

          if (id === "asterisk") {
            return (
              <div key="asterisk" className={styles.asterisk} aria-hidden="true">
                <Asterisk className={styles.asteriskIcon} />
              </div>
            );
          }

          const portfolio = PORTFOLIO_BY_ID[id];

          return (
            <div
              key={id}
              className={styles.tile}
              style={{ "--iw": String(portfolio.w), "--ih": String(portfolio.h) }}
            >
              <div className={styles.tileInner}>
                <div className={styles.iconSlot}>
                  <Image
                    src={portfolio.src}
                    alt=""
                    width={Math.round(portfolio.w)}
                    height={Math.round(portfolio.h)}
                    className={styles.icon}
                  />
                </div>
                <p className={styles.label}>{portfolio.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <span className={`${styles.fade} ${styles.fadeTop}`} aria-hidden="true" />
      <span className={`${styles.fade} ${styles.fadeBottom}`} aria-hidden="true" />
      <span className={`${styles.fade} ${styles.fadeLeft}`} aria-hidden="true" />
      <span className={`${styles.fade} ${styles.fadeRight}`} aria-hidden="true" />
    </div>
  );
}

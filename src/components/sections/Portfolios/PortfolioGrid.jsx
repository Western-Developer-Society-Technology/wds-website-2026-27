"use client";

import Image from "next/image";
import Asterisk from "@/components/ui/Asterisk";
import useReveal from "@/lib/useReveal";
import { CELLS, GRID, PORTFOLIO_BY_ID } from "./portfolioData";
import styles from "./Portfolios.module.css";

const COLS = GRID[0].length;

export default function PortfolioGrid() {
  const [gridRef, revealed] = useReveal({
    threshold: 0.15,
    rootMargin: "0px 0px -18% 0px",
  });

  let mobileStagger = 0;

  return (
    <div className={styles.band}>
      <div
        ref={gridRef}
        className={`${styles.grid} ${revealed ? styles.gridIn : ""}`}
      >
        {CELLS.map((id, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);
          const staggerM = id === null ? 0 : mobileStagger++;
          const mobileCol = staggerM % 2;
          const mobileRow = Math.floor(staggerM / 2);
          const delayVars = {
            "--stagger": String(col + row * 3),
            "--stagger-m": String(mobileCol + mobileRow),
          };

          if (id === null) {
            return (
              <div
                key={`filler-${index}`}
                className={`${styles.cell} ${styles.filler}`}
                style={delayVars}
                aria-hidden="true"
              />
            );
          }

          if (id === "asterisk") {
            return (
              <div
                key="asterisk"
                className={`${styles.cell} ${styles.asterisk}`}
                style={delayVars}
                aria-hidden="true"
              >
                <Asterisk className={styles.asteriskIcon} />
              </div>
            );
          }

          const portfolio = PORTFOLIO_BY_ID[id];

          return (
            <div
              key={id}
              className={`${styles.cell} ${styles.tile}`}
              style={{
                ...delayVars,
                "--iw": String(portfolio.w),
                "--ih": String(portfolio.h),
              }}
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

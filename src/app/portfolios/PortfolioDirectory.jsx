"use client";

import Image from "next/image";
import { useState } from "react";
import { PORTFOLIO_APPLICATIONS, TEAM_PREVIEW } from "./portfolioData";
import PortfolioCarousel from "./PortfolioCarousel";
import styles from "./portfolios.module.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 14 14 2M6 2h8v8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function PortfolioDirectory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePortfolio = PORTFOLIO_APPLICATIONS[activeIndex];

  return (
    <section className={styles.page} aria-labelledby="portfolio-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>director hiring now open</p>
        <div className={styles.headingRow}>
          <h1 id="portfolio-heading">portfolios</h1>
        </div>
      </header>

      <PortfolioCarousel
        portfolios={PORTFOLIO_APPLICATIONS}
        onActiveChange={setActiveIndex}
      />

      <article
        className={styles.details}
        id="portfolio-details"
        aria-labelledby={`portfolio-tab-${activePortfolio.id}`}
        aria-live="polite"
      >
        <div className={styles.summary}>
          <p className={styles.date}>Sep 2026 - Apr 2027</p>
          <h2>{activePortfolio.label}</h2>

          <div className={styles.tags} aria-label="Role details">
            {activePortfolio.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <p className={styles.description}>{activePortfolio.description}</p>

          <ul className={styles.teamPreview} aria-label="WDS leadership preview">
            {(TEAM_PREVIEW[activePortfolio.id] ?? []).map((member) => (
              <li key={member.id}>
                <figure className={styles.person}>
                  <span className={styles.personPhoto}>
                    <Image
                      src={member.src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 25vw, 172px"
                    />
                  </span>
                  <figcaption>{member.name}</figcaption>
                  <span>{member.role}</span>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.roleDetails}>
          <div className={styles.actions}>
            {activePortfolio.id === "finance" ? (
              <button type="button" disabled>
                apply now
                <ArrowIcon />
              </button>
            ) : (
              <a href={`/apply/${activePortfolio.id}`}>
                apply now
                <ArrowIcon />
              </a>
            )}
          </div>

          <h3>Description</h3>
          <p className={styles.portfolioDescription}>
            {activePortfolio.portfolioDescription}
          </p>
        </div>
      </article>
    </section>
  );
}

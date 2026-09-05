"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ArrowButton from "@/components/ui/ArrowButton";
import { PORTFOLIO_APPLICATIONS, TEAM_PREVIEW } from "./portfolioData";
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
  const tabViewportRef = useRef(null);
  const tabRefs = useRef([]);
  const activePortfolio = PORTFOLIO_APPLICATIONS[activeIndex];

  const selectRelative = (offset) => {
    const count = PORTFOLIO_APPLICATIONS.length;
    const nextIndex = (activeIndex + offset + count) % count;
    setActiveIndex(nextIndex);
    return nextIndex;
  };

  useEffect(() => {
    const viewport = tabViewportRef.current;
    const activeTab = tabRefs.current[activeIndex];
    if (!viewport || !activeTab) return;

    const left = activeTab.offsetLeft - (viewport.clientWidth - activeTab.offsetWidth) / 2;
    viewport.scrollTo({ left });
  }, [activeIndex]);

  const handleTabKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      tabRefs.current[selectRelative(-1)]?.focus();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      tabRefs.current[selectRelative(1)]?.focus();
    }
  };

  return (
    <section className={styles.page} aria-labelledby="portfolio-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>director hiring starts in september</p>
        <div className={styles.headingRow}>
          <h1 id="portfolio-heading">portfolios</h1>
          <span aria-label={`${PORTFOLIO_APPLICATIONS.length} portfolios`}>
            {PORTFOLIO_APPLICATIONS.length}
          </span>
        </div>
      </header>

      <div className={styles.portfolioNav}>
        <div className={styles.tabViewport} ref={tabViewportRef}>
          <div className={styles.tabList} role="tablist" aria-label="Portfolios">
            {PORTFOLIO_APPLICATIONS.map((portfolio, index) => {
              const selected = index === activeIndex;

              return (
                <button
                  key={portfolio.id}
                  id={`portfolio-tab-${portfolio.id}`}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  className={styles.portfolioTab}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="portfolio-details"
                  tabIndex={selected ? 0 : -1}
                  data-selected={selected ? "true" : "false"}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={handleTabKeyDown}
                >
                  <Image
                    src={portfolio.src}
                    width={portfolio.w}
                    height={portfolio.h}
                    alt=""
                  />
                  <span>{portfolio.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.navControls} aria-label="Browse portfolios">
          <ArrowButton
            direction="prev"
            className={styles.navControlButton}
            onClick={() => selectRelative(-1)}
            ariaLabel="Previous portfolio"
          />
          <ArrowButton
            direction="next"
            className={styles.navControlButton}
            onClick={() => selectRelative(1)}
            ariaLabel="Next portfolio"
          />
        </div>
      </div>

      <article
        className={styles.details}
        id="portfolio-details"
        role="tabpanel"
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
            {TEAM_PREVIEW.map((member) => (
              <li key={member.id}>
                <figure className={styles.person}>
                  <Image
                    src="/images/team/stephanieli.png"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 25vw, 172px"
                  />
                  <figcaption>{member.name}</figcaption>
                  <span>{member.role}</span>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.roleDetails}>
          <h3>Responsibilities</h3>
          <ol className={styles.responsibilities} type="a">
            {activePortfolio.responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ol>

          <h3>Are you fit for this role?</h3>
          <ol className={styles.requirements}>
            {activePortfolio.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ol>

          <div className={styles.actions}>
            <span>
              {activePortfolio.spots} {activePortfolio.spots === 1 ? "spot" : "spots"}
            </span>
            <a href="/apply">
              apply now
              <ArrowIcon />
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}

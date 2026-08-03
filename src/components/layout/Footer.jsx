import Image from "next/image";
import Barcode from "@/components/ui/Barcode";
import Marquee from "@/components/ui/Marquee";
import styles from "./Footer.module.css";

/**
 * Footer — design frame y 6228 → 6848.
 *
 * The pixel checkers in the two top corners are a single pattern mirrored, on
 * a 50px grid: four rows, each a list of [offset-from-that-edge, width].
 */
const CHECKER_ROWS = [
  [[0, 50]],
  [[50, 100]],
  [
    [0, 50],
    [150, 100],
  ],
  [
    [0, 150],
    [250, 100],
  ],
];

const SOCIALS = [
  { name: "Instagram", icon: "/icons/social/instagram.png", size: [33, 33], href: "#" },
  { name: "Discord", icon: "/icons/social/discord.png", size: [34, 33], href: "#" },
  { name: "LinkedIn", icon: "/icons/social/linkedin.png", size: [30, 33], href: "#" },
];

const pct = (n) => `${(n / 1920) * 100}%`;

function Checker({ side }) {
  return (
    <div className={styles.checker} data-side={side} aria-hidden="true">
      {CHECKER_ROWS.map((row, i) =>
        row.map(([offset, width], j) => (
          <span
            key={`${i}-${j}`}
            className={styles.cell}
            style={{
              [side]: pct(offset),
              width: pct(width),
              top: `${i * 25}%`,
            }}
          />
        )),
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Checker side="left" />
      <Checker side="right" />

      <div className={styles.meta}>
        <p className={styles.wordmark}>western developers society</p>
        <ul className={styles.socials}>
          {SOCIALS.map((s) => (
            <li key={s.name}>
              <a href={s.href} aria-label={s.name}>
                <Image
                  src={s.icon}
                  alt=""
                  width={s.size[0]}
                  height={s.size[1]}
                  style={{
                    width: `calc(${s.size[0]} * var(--u))`,
                    height: `calc(${s.size[1]} * var(--u))`,
                  }}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.strip}>
        <Barcode
          orientation="vertical"
          bars={66}
          seed={57}
          gap={11}
          minBar={8}
          maxBar={15}
        />
      </div>

      {/* Runs off the bottom of the frame by design — the section clips it. */}
      <Marquee
        className={styles.bigMark}
        text="wds"
        repeat={4}
        duration="30s"
      />
    </footer>
  );
}

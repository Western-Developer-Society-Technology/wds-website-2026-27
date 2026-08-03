import Asterisk from "@/components/ui/Asterisk";
import Button from "@/components/ui/Button";
import IconChip from "@/components/ui/IconChip";
import Marquee from "@/components/ui/Marquee";
import SectionHeading from "@/components/ui/SectionHeading";
import { portfolioRows, portfolioCount } from "@/data/portfolios";
import styles from "./Portfolios.module.css";

/**
 * Portfolios — design frame y 3597 → 4912.
 *
 * The "JOIN US" ticker runs full-bleed across the section, breaking out of the
 * gutter that everything else respects.
 *
 * The stepped yellow divider that ends this section belongs to The Team (it
 * overlaps downward, the same way the hero → what we do divider does), so it
 * is built there. Its measured band data is exported from ui/StepDivider.
 */
export default function Portfolios() {
  return (
    <section id="portfolios" className={styles.section}>
      <SectionHeading
        className={styles.heading}
        title="portfolios"
        superscript={portfolioCount}
        size="var(--fs-h2-lg)"
        actionOffset="calc(58 * var(--u))"
        action={
          <Button href="#portfolios" variant="white" size="sm">
            view all
          </Button>
        }
      />

      <Marquee
        className={styles.marquee}
        text="JOIN US "
        repeat={9}
        duration="22s"
      />

      <p className={styles.blurb}>
        WDS operates on {portfolioCount} portfolios. Learn more about what we
        do.
      </p>

      <div className={styles.rows}>
        {portfolioRows.map((row, i) => (
          <div className={styles.row} key={i}>
            {row.map((item, j) =>
              item.asterisk ? (
                <Asterisk key={j} className={styles.asterisk} />
              ) : (
                <IconChip
                  key={item.slug}
                  icon={item.icon}
                  iconSize={item.iconSize}
                  label={item.label}
                  href={item.href}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

import Asterisk from "@/components/ui/Asterisk";
import Barcode from "@/components/ui/Barcode";
import Button from "@/components/ui/Button";
import StepDivider from "@/components/ui/StepDivider";
import WhatWeDoArt from "./WhatWeDoArt";
import styles from "./WhatWeDo.module.css";

/**
 * What We Do — design frame y 1115 → 2411.
 *
 * Two things here are not stacked in normal flow:
 *  - the step divider starts at design y 899, i.e. 216px *above* this section,
 *    so it is pulled up over the hero's bottom edge;
 *  - the barcode strip at the bottom is white-backed and runs flush into the
 *    Events section, so the two read as one continuous white edge.
 */
export default function WhatWeDo() {
  return (
    <section id="what-we-do" className={styles.section}>
      <StepDivider className={styles.stepDivider} />

      <WhatWeDoArt />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>what we do</p>

        <h2 className={styles.heading}>
          <span className={styles.headingLine}>more than just</span>
          <span className={styles.headingLine}>
            a{" "}
            <span className={styles.highlight}>
              tech <Asterisk className={styles.inlineAsterisk} /> club.
            </span>
          </span>
        </h2>

        <div className={styles.body}>
          <p>
            Founded in 2022, we&rsquo;ve grown to be one of western&rsquo;s
            largest communities.
          </p>
          <p>
            From hands-on workshops and mentorship to collaborative projects and
            hackathons, WDS helps students gain real experience, build
            meaningful connections, and create technology that makes an impact.
          </p>
        </div>

        <Button href="#portfolios" variant="blue" className={styles.cta}>
          learn more
        </Button>
      </div>

      {/* Ink bars left of design x 910, blue bars right of it, on white. */}
      <div className={styles.strip}>
        <Barcode
          className={styles.stripInk}
          orientation="vertical"
          bars={32}
          seed={91}
          gap={5}
          minBar={7}
          maxBar={38}
        />
        <Barcode
          className={styles.stripBlue}
          orientation="vertical"
          bars={35}
          seed={44}
          gap={11}
          minBar={8}
          maxBar={15}
        />
      </div>
    </section>
  );
}

import Image from "next/image";
import Barcode from "@/components/ui/Barcode";
import HeroChevron from "./HeroChevron";
import HeroRail from "./HeroRail";
import styles from "./Hero.module.css";

/**
 * Hero — design frame y 0 → 1115.
 *
 * A stage of absolutely-positioned layers, every offset taken straight off the
 * 1920px design. Stacking order matters and is not the source order alone:
 * the crowd photo deliberately sits *over* the "wds" headline (the raised
 * hands crop into the letterforms), while the small type sits over the photo.
 *
 * NOTE for prompt 2: the white stepped divider between this section and What
 * We Do begins at design y ≈ 880 — i.e. it overlaps the bottom ~235px of this
 * section. It will need to be pulled up over the hero rather than stacked
 * after it.
 */
export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      {/* Stripe block, bottom-left. Sits under the chevron, which crops it. */}
      <Barcode
        className={styles.leftBarcode}
        bars={7}
        seed={17}
        gap={6}
        minBar={3.5}
        maxBar={18}
      />

      <HeroChevron className={styles.chevron} />

      <h1 className={styles.headline}>wds</h1>

      <div className={styles.photo}>
        <Image
          src="/images/heroimage.png"
          alt="Members of the Western Developers Society at a club event"
          width={2189}
          height={666}
          priority
          className={styles.photoImg}
        />
      </div>

      <p className={styles.tagline}>
        building western&rsquo;s tech
        <br />
        community, line by line
      </p>

      <p className={styles.society}>
        western
        <br />
        developers
        <br />
        society
      </p>

      {/* Thin rule + small stripe block, both right-aligned to design x 1673. */}
      <span className={styles.rule} />
      <Barcode
        className={styles.smallBarcode}
        bars={6}
        seed={3}
        gap={4}
        minBar={3.5}
        maxBar={18}
      />

      <HeroRail />
    </section>
  );
}

import Image from "next/image";
import styles from "./IconChip.module.css";

/**
 * A white portfolio chip: icon + label, hard rectangle, shrink-to-fit.
 *
 * Icons keep their natural width rather than sitting in a uniform box — the
 * design places each one individually (ink widths run 37 to 64), so a fixed
 * box would push every label off its measured position.
 */
export default function IconChip({ icon, iconSize, label, href = "#" }) {
  const [w, h] = iconSize ?? [48, 48];

  return (
    <a className={styles.chip} href={href}>
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={w}
          height={h}
          className={styles.icon}
          style={{
            width: `calc(${w} * var(--u))`,
            height: `calc(${h} * var(--u))`,
          }}
        />
      ) : null}
      <span className={styles.label}>{label}</span>
    </a>
  );
}

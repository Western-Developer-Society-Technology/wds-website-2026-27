import Image from "next/image";
import styles from "./TeamCard.module.css";

/**
 * A headshot with two solid ink tags notched over its corners: the name
 * overhanging the top-left, the role overhanging the bottom-right.
 *
 * That overhang is the signature detail — both tags sit outside the photo's
 * bounds, so the card must not clip. Adding `overflow: hidden` here would
 * quietly flatten the whole effect.
 */
export default function TeamCard({ member }) {
  return (
    <figure className={styles.card}>
      <Image
        src={member.photo}
        alt={`${member.name}, ${member.role}`}
        width={215}
        height={216}
        className={styles.photo}
      />
      <figcaption>
        <span className={styles.name}>{member.name}</span>
        <span className={styles.role}>{member.role}</span>
      </figcaption>
    </figure>
  );
}

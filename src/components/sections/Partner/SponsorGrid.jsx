import Image from "next/image";
import { CELLS, SPONSOR_BY_ID } from "./sponsorData";
import styles from "./Partner.module.css";

export default function SponsorGrid() {
  return (
    <div className={styles.sponsors}>
      {CELLS.map((id, index) => {
        if (id === null) {
          return (
            <div key={`empty-${index}`} className={styles.empty} aria-hidden="true" />
          );
        }

        const sponsor = SPONSOR_BY_ID[id];

        return (
          <div
            key={id}
            className={styles.block}
            style={{ "--iw": String(sponsor.w), "--ih": String(sponsor.h) }}
          >
            <Image
              src={sponsor.src}
              alt={sponsor.alt}
              width={Math.round(sponsor.w)}
              height={Math.round(sponsor.h)}
              className={styles.logo}
            />
          </div>
        );
      })}
    </div>
  );
}

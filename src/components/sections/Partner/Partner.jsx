import PartnerForm from "./PartnerForm";
import PartnerGrid from "./PartnerGrid";
import SponsorGrid from "./SponsorGrid";
import styles from "./Partner.module.css";

export default function Partner() {
  return (
    <section className={styles.partner} aria-label="Partner">
      <div className={styles.inner}>
        <div className={styles.canvas}>
          <h2 className={styles.heading}>partner with us</h2>
          <PartnerForm />
          <SponsorGrid />
          <PartnerGrid />
        </div>
      </div>
    </section>
  );
}

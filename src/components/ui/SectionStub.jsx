import styles from "./SectionStub.module.css";

/**
 * TEMPORARY scaffolding placeholder.
 *
 * Renders a correctly-toned, correctly-sized band so the page reads
 * top-to-bottom from day one and the design tokens can be eyeballed before
 * any section exists. Each section prompt replaces its own stub outright.
 *
 * Delete this component (and its stylesheet) once all six sections are built.
 */
export default function SectionStub({ id, label, tone = "dark", height = 800 }) {
  return (
    <section
      id={id}
      className={styles.stub}
      data-tone={tone}
      style={{ "--h": height }}
    >
      <p className={styles.label}>{label}</p>
      <p className={styles.note}>Not built yet — placeholder.</p>
    </section>
  );
}

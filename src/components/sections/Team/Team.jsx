import StepDivider, { TEAM_DIVIDER_BANDS } from "@/components/ui/StepDivider";
import { team } from "@/data/team";
import TeamCard from "./TeamCard";
import styles from "./Team.module.css";

/**
 * The Team — design frame y 4912 → 6228.
 *
 * The stepped divider at the top belongs to this section rather than to
 * Portfolios: it paints ink (and a yellow edge) down over this section's white
 * background, so it has to be drawn by whichever section is underneath.
 */
export default function Team() {
  return (
    <section id="team" className={styles.section}>
      <StepDivider
        className={styles.divider}
        variant="stepped"
        bands={TEAM_DIVIDER_BANDS}
      />

      <h2 className={styles.heading}>the team</h2>
      <p className={styles.subtitle}>
        bringing western&rsquo;s tech community to life
      </p>

      <div className={styles.grid}>
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

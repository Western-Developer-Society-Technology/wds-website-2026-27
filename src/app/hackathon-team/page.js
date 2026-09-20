import Image from "next/image";
import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import HackathonDirectory from "./HackathonDirectory";
import styles from "./hackathon-team.module.css";

export const metadata = {
  title: "Hackathon Team – Western Developers Society",
  description:
    "Represent Western Developers Society at top hackathons. Explore upcoming events and learn about the WDS Hackathon Team.",
};

export default function HackathonTeamPage() {
  return (
    <main>
      <Nav />
      <div className={styles.page}>
        <div className={styles.canvas}>
          <header className={styles.header}>
            <p>hackathon team</p>
            <h1 id="hackathon-heading">upcoming</h1>
          </header>

          <HackathonDirectory />

          <section className={styles.about} aria-labelledby="about-team-heading">
            <div>
              <h2 id="about-team-heading">
                what is wds<br />hackathon<br />team?
              </h2>
              <div className={styles.aboutCopy}>
                <p>
                  The WDS Hackathon Team is a program that brings Western students
                  together to compete at top hackathons while representing Western
                  Developers Society. We work to secure sponsorships and funding
                  to help cover hackathon-related costs, then open applications to
                  students who have already been accepted to eligible hackathons.
                </p>
                <p>
                  Selected applicants are matched with other WDS members and attend
                  the hackathon together as a team, representing WDS throughout the
                  event. When sponsorship funding is available, team members can
                  receive benefits such as financial support for travel,
                  registration, and other hackathon expenses.
                </p>
              </div>
            </div>
            <figure className={styles.teamVisual}>
              <Image
                src="/images/hackathon-team/team.webp"
                alt="WDS members celebrating together with gold SPARK balloons"
                width={410}
                height={274}
                sizes="(max-width: 600px) 70vw, (max-width: 900px) 410px, 30vw"
                className={styles.teamPhoto}
              />
              {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((corner) => (
                <Image
                  key={corner}
                  src="/images/hackathon-team/corner.svg"
                  alt=""
                  width={30}
                  height={30}
                  className={`${styles.corner} ${styles[corner]}`}
                  aria-hidden="true"
                />
              ))}
            </figure>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

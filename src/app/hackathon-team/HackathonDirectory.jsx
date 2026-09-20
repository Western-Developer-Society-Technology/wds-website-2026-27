"use client";

import { useState } from "react";
import Image from "next/image";
import UpcomingCarousel from "@/components/ui/UpcomingCarousel/UpcomingCarousel";
import EventDetailCard from "@/components/ui/DetailCard/EventDetailCard";
import { socials } from "@/components/sections/Footer/socialData";
import { HACKATHONS } from "./hackathonData";
import styles from "./hackathon-team.module.css";

export default function HackathonDirectory() {
  const [active, setActive] = useState(0);
  const hackathon = HACKATHONS[active];
  const discord = socials.find((link) => link.id === "discord");

  const actions = [
    {
      label: hackathon.ctaLabel,
      href: discord.href,
      external: true,
      tone: "ink",
    },
    ...(hackathon.applicationsClosed
      ? [{ label: "applications closed", disabled: true }]
      : []),
  ];

  return (
    <>
      <section className={styles.upcoming} aria-labelledby="hackathon-heading">
        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.label}>hackathon team</p>
            <div className={styles.headingGroup}>
              <h1 id="hackathon-heading" className={styles.heading}>
                upcoming
              </h1>
            </div>
          </div>
        </div>

        <UpcomingCarousel
          events={HACKATHONS}
          onActiveChange={setActive}
          ariaLabel="Upcoming hackathon posters"
          size="compact"
        />

        <div className={styles.inner}>
          <EventDetailCard event={hackathon} actions={actions} />
        </div>
      </section>

      <section className={styles.about} aria-labelledby="about-team-heading">
        <div className={styles.inner}>
          <div className={styles.aboutGrid}>
            <div>
              <h2 id="about-team-heading" className={styles.aboutHeading}>
                what is wds<br />
                hackathon<br />
                team?
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
          </div>
        </div>
      </section>
    </>
  );
}

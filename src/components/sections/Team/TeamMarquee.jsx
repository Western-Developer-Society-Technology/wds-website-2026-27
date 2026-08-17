"use client";

import { useCallback, useState, useRef } from "react";
import Image from "next/image";
import { teamMembers } from "./teamData";
import styles from "./Team.module.css";

function MemberCard({ member, hidden }) {
  return (
    <a
      className={styles.item}
      href={member.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${member.name} on LinkedIn`}
      tabIndex={hidden ? -1 : undefined}
      data-team-photo=""
    >
      <span className={styles.photo}>
        <Image
          src={member.src}
          alt=""
          fill
          sizes="(max-width: 768px) 40vw, 15vw"
          className={styles.photoImg}
        />
      </span>
      <span className={styles.name}>{member.name}</span>
      <span className={styles.role}>{member.role}</span>
    </a>
  );
}

export default function TeamMarquee() {
  const [overPhoto, setOverPhoto] = useState(false);
  const chipRef = useRef(null);

  const onPointerMove = useCallback((event) => {
    if (event.pointerType !== "mouse") {
      setOverPhoto(false);
      return;
    }

    const over = Boolean(event.target.closest("[data-team-photo]"));
    setOverPhoto(over);

    if (over && chipRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      chipRef.current.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0) translate(-50%, -50%)`;
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    setOverPhoto(false);
  }, []);

  return (
    <div
      className={styles.bleed}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <div className={styles.group}>
            {teamMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          <div className={styles.group} aria-hidden="true">
            {teamMembers.map((member) => (
              <MemberCard key={`${member.id}-dup`} member={member} hidden />
            ))}
          </div>
        </div>
      </div>
      <div ref={chipRef} className={styles.chip} aria-hidden="true">
        <div className={`${styles.chipInner} ${overPhoto ? styles.chipVisible : ""}`}>
          linkedin
          <svg
            className={styles.chipArrow}
            viewBox="0 0 23 24"
            fill="none"
          >
            <path
              d="M0.956243 22.5928L20.7556 1.30777M20.7558 22.5918L20.7556 1.30777L0.957322 1.30786"
              stroke="currentColor"
              strokeWidth="2.61566"
              strokeLinejoin="bevel"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

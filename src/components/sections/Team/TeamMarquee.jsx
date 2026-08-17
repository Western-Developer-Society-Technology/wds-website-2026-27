"use client";

import { useCallback, useState, useRef } from "react";
import Image from "next/image";
import HoverChip from "@/components/ui/HoverChip";
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
      <HoverChip ref={chipRef} label="linkedin" visible={overPhoto} />
    </div>
  );
}

"use client";

import EventImage from "@/components/ui/EventImage";
import { useCallback, useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import styles from "./TiltPoster.module.css";

// Measure the stationary scene so the moving face cannot feed back into its tilt.
const TILT_SPRING = { stiffness: 170, damping: 22, mass: 0.8 };

export default function TiltPoster({ event, priority, active = true }) {
  const reducedMotion = useReducedMotion();
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const scale = useSpring(1, TILT_SPRING);
  const shadow = useTransform(() => `${-rotateY.get() * 0.4}px ${7 + rotateX.get() * 0.2}px 18px -9px rgb(24 39 66 / 24%)`);

  function tilt(pointer) {
    if (!active || reducedMotion || (pointer.pointerType !== "mouse" && pointer.pointerType !== "pen")) return;

    const bounds = pointer.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (pointer.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (pointer.clientY - bounds.top) / bounds.height));

    rotateX.set((0.5 - y) * 16);
    rotateY.set((x - 0.5) * 18);
    scale.set(1.018);
  }

  const resetTilt = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  useEffect(() => {
    if (!active || reducedMotion) resetTilt();
  }, [active, reducedMotion, resetTilt]);

  return (
    <div
      className={styles.scene}
      onPointerEnter={tilt}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <motion.div
        className={styles.card}
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          scale: reducedMotion ? 1 : scale,
          boxShadow: reducedMotion ? undefined : shadow,
        }}
      >
        <div className={styles.surface}>
          <EventImage
            src={event.src}
            alt={event.alt}
            fill
            preload={priority}
            sizes="(max-width: 380px) 80px, (max-width: 430px) 96px, (max-width: 680px) 112px, (max-width: 900px) 210px, (max-width: 1100px) 260px, 320px"
            draggable={false}
            className={styles.image}
          />
        </div>
      </motion.div>
    </div>
  );
}

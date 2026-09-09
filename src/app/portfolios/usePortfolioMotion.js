"use client";

import { animate } from "motion";
import { useLayoutEffect, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];
const CSS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Animate geometry only; selection colors switch immediately.
const PROPERTIES = [
  "width", "height", "flexBasis", "paddingBottom", "gap", "fontSize",
];

function readFrame(element) {
  const style = getComputedStyle(element);
  return Object.fromEntries(PROPERTIES.map((property) => [property, style[property]]));
}

export default function usePortfolioMotion({ activeIndex, viewportRef, tabRefs, detailsRef }) {
  const previous = useRef(null);
  const running = useRef([]);

  // Capture the visible state, including any unfinished animation, before React
  // changes selection. Rapid clicks can then continue without jumping or queuing.
  const prepareTransition = () => {
    const elements = tabRefs.current.flatMap((tab) => [tab, ...tab.children]);
    previous.current = {
      frames: elements.map((element) => ({ element, from: readFrame(element) })),
      scrollLeft: viewportRef.current.scrollLeft,
    };
  };

  useLayoutEffect(() => {
    const snapshot = previous.current;
    previous.current = null;
    if (!snapshot) return;

    running.current.forEach((animation) => animation.cancel());
    running.current = [];

    const viewport = viewportRef.current;
    const tab = tabRefs.current[activeIndex];
    // Measure the final layout before starting any size animations.
    const left = Math.max(0, Math.min(
      tab.offsetLeft - (viewport.clientWidth - tab.offsetWidth) / 2,
      viewport.scrollWidth - viewport.clientWidth,
    ));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      viewport.scrollLeft = left;
      return;
    }

    const duration = 680;
    const timing = { duration, easing: CSS_EASE };
    const frames = snapshot.frames.map(({ element, from }) => ({ element, from, to: readFrame(element) }));
    for (const { element, from, to } of frames) {
      running.current.push(element.animate([from, to], timing));
    }

    running.current.push(animate(snapshot.scrollLeft, left, {
      duration: duration / 1000,
      ease: EASE,
      onUpdate: (value) => { viewport.scrollLeft = value; },
    }));

    for (const [index, element] of [...detailsRef.current.children].entries()) {
      running.current.push(element.animate([
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { ...timing, delay: index * 55, fill: "backwards" }));
    }
  }, [activeIndex, viewportRef, tabRefs, detailsRef]);

  useLayoutEffect(() => () => {
    running.current.forEach((animation) => animation.cancel());
  }, []);

  return prepareTransition;
}

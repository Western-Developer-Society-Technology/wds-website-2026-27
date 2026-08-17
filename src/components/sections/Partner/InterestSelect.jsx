"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Partner.module.css";

export const INTEREST_OPTIONS = [
  "sponsoring an event",
  "hosting a workshop",
  "being a guest speaker",
  "judging a hackathon",
];

export default function InterestSelect({ value, onChange, invalid = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, INTEREST_OPTIONS.indexOf(value)),
  );
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const swallowRef = useRef(null);
  const listId = useId();
  const optionId = (index) => `${listId}-opt-${index}`;

  useEffect(() => {
    return () => {
      swallowRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, INTEREST_OPTIONS.indexOf(value)));
    }
  }, [open, value]);

  const closeAfterSelect = () => {
    swallowRef.current?.cleanup();

    const swallow = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("pointerup", swallow, true);
    document.addEventListener("click", swallow, true);

    const timeout = window.setTimeout(() => {
      document.removeEventListener("pointerup", swallow, true);
      document.removeEventListener("click", swallow, true);
      swallowRef.current = null;
    }, 400);

    swallowRef.current = {
      cleanup: () => {
        window.clearTimeout(timeout);
        document.removeEventListener("pointerup", swallow, true);
        document.removeEventListener("click", swallow, true);
        swallowRef.current = null;
      },
    };

    setOpen(false);
    triggerRef.current?.focus();
  };

  const commit = (index) => {
    onChange(INTEREST_OPTIONS[index]);
    closeAfterSelect();
  };

  const onKeyDown = (event) => {
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(INTEREST_OPTIONS.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(INTEREST_OPTIONS.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={styles.select} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.selectTrigger} ${invalid ? styles.fieldInvalid : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Partnership interest"
        aria-invalid={invalid}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) {
            setOpen(false);
          }
        }}
      >
        <span className={styles.selectLabel}>{value}</span>
        <Image
          src="/icons/chevrondown.svg"
          alt=""
          width={14}
          height={7}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={styles.selectList}
          aria-label="Partnership interest"
        >
          {INTEREST_OPTIONS.map((option, index) => (
            <li
              key={option}
              id={optionId(index)}
              role="option"
              aria-selected={option === value}
              className={`${styles.selectOption} ${
                index === activeIndex ? styles.selectOptionActive : ""
              }`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                commit(index);
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
      <input type="hidden" name="interest" value={value} />
    </div>
  );
}

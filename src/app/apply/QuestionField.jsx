"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import DateTimeField from "./DateTimeField";
import ResumeUploadField from "./ResumeUploadField";
import { countWords, getCharacterLimit } from "./formModel";
import styles from "./apply.module.css";

gsap.registerPlugin(useGSAP);

export function ChoiceFilters() {
  return (
    <svg className={styles.choiceFilters} width="0" height="0" aria-hidden="true">
      <defs>
        <filter
          id="choice-goo-light"
          x="-50%"
          width="200%"
          y="-50%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.25" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
            result="cm"
          />
        </filter>
      </defs>
    </svg>
  );
}

function ChoiceIcon({ multiple }) {
  return (
    <svg
      className={styles.choiceIcon}
      viewBox="0 0 24 24"
      filter="url(#choice-goo-light)"
      aria-hidden="true"
    >
      {multiple ? (
        <>
          <path className={styles.checkboxTick} d="M4.5 10L10.5 16L24.5 1" />
          <circle className={styles.checkboxDot} cx="10.5" cy="15.5" r="1.5" />
          <circle className={styles.checkboxDrop} cx="25" cy="-1" r="2" />
        </>
      ) : (
        <>
          <circle className={styles.radioTop} cx="12" cy="-12" r="8" />
          <circle className={styles.radioDot} cx="12" cy="12" r="5" />
          <circle className={styles.radioDrop} cx="12" cy="12" r="2" />
        </>
      )}
    </svg>
  );
}

function TextField({ question: q, value, onChange, attributes }) {
  const shared = {
    ...attributes,
    className: styles.field,
    value: value || "",
    onChange: (event) => onChange(event.target.value),
    placeholder: q.id === "name" ? "Your Name" : ["short", "paragraph"].includes(q.type) ? "Type something..." : q.placeholder,
    maxLength: getCharacterLimit(q),
    autoComplete: q.autoComplete,
  };
  if (q.type === "paragraph") {
    return (
      <>
        <textarea {...shared} rows={5} />
        {q.maxWords && (
          <span className={styles.counter}>{countWords(value)} / {q.maxWords} words</span>
        )}
      </>
    );
  }
  return <input {...shared} type={q.type === "short" ? "text" : q.type} />;
}

function toggleOption(selected, option) {
  return selected.includes(option)
    ? selected.filter((item) => item !== option)
    : [...selected, option];
}

export function ChoiceControl({ multiple, children, ...inputProps }) {
  return (
    <label className={styles.choice}>
      <span className={`${styles.choiceVisual} ${multiple ? styles.checkboxControl : styles.radioControl}`}>
        <input {...inputProps} type={multiple ? "checkbox" : "radio"} />
        <ChoiceIcon multiple={multiple} />
      </span>
      <span>{children}</span>
    </label>
  );
}

function ChoiceField({ question: q, value, onChange, attributes }) {
  const multiple = q.type === "checkboxes";
  return (
    <div className={styles.choices}>
      {q.options.map((option, index) => (
        <ChoiceControl
          {...attributes}
          key={option}
          id={`${q.id}-${index}`}
          multiple={multiple}
          checked={multiple ? (value || []).includes(option) : value === option}
          value={option}
          onChange={() => onChange(multiple ? toggleOption(value || [], option) : option)}
        >
          {option}
        </ChoiceControl>
      ))}
    </div>
  );
}

function ScaleField({ question: q, value, onChange, attributes }) {
  const root = useRef(null);
  const highlight = useRef(null);
  const rating = q.type === "rating";
  const options = q.options ?? Array.from({ length: q.max - (q.min ?? 1) + 1 }, (_, i) => i + (q.min ?? 1));
  const selectedIndex = options.findIndex((number) => value === String(number));

  useGSAP(() => {
    gsap.to(highlight.current, {
      "--selected-index": Math.max(0, selectedIndex),
      opacity: selectedIndex < 0 ? 0 : 1,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.55,
      ease: "power3.out",
      overwrite: true,
    });
  }, { scope: root, dependencies: [selectedIndex] });

  return (
    <div>
      <div ref={root} className={styles.scale} style={{ "--option-count": options.length }}>
        <div ref={highlight} className={styles.scaleHighlight} aria-hidden="true" />
        {options.map((number) => (
          <label
            className={`${styles.scaleOption} ${rating && Number(value) >= number ? styles.starFilled : ""}`}
            key={number}
          >
            <input
              {...attributes}
              id={`${q.id}-${number}`}
              type="radio"
              value={number}
              checked={value === String(number)}
              onChange={(event) => onChange(event.target.value)}
              aria-label={rating ? `${number} of ${q.max} stars` : String(number)}
            />
            <span aria-hidden="true">{rating ? "★" : number}</span>
          </label>
        ))}
      </div>
      {!rating && (
        <div className={styles.scaleLabels}>
          <span>{q.lowLabel}</span><span>{q.highLabel}</span>
        </div>
      )}
    </div>
  );
}

function GridField({ question: q, value, onChange, attributes }) {
  const multiple = q.type === "checkboxGrid";
  return (
    <div className={styles.gridRows}>
      {q.rows.map((row, index) => {
        const selected = value?.[row] || (multiple ? [] : "");
        return (
          <fieldset className={styles.gridRow} key={row}>
            <legend>{row}</legend>
            <div className={styles.gridOptions}>
              {q.columns.map((column, columnIndex) => (
                <ChoiceControl
                  {...attributes}
                  key={column}
                  id={`${q.id}-${index}-${columnIndex}`}
                  name={`${q.id}-${index}`}
                  multiple={multiple}
                  checked={multiple ? selected.includes(column) : selected === column}
                  value={column}
                  onChange={() => onChange({
                    ...value,
                    [row]: multiple ? toggleOption(selected, column) : column,
                  })}
                >
                  {column}
                </ChoiceControl>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

function DropdownField({ question: q, value, onChange, attributes }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const listId = `${q.id}-options`;

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  function show() {
    setActive(Math.max(0, q.options.indexOf(value)));
    setOpen(true);
  }

  function commit(index) {
    onChange(q.options[index]);
    setOpen(false);
    trigger.current?.focus();
  }

  function keyDown(event) {
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!open) {
        show();
        return;
      }
      if (event.key === "ArrowDown") setActive((index) => Math.min(q.options.length - 1, index + 1));
      if (event.key === "ArrowUp") setActive((index) => Math.max(0, index - 1));
      if (event.key === "Home") setActive(0);
      if (event.key === "End") setActive(q.options.length - 1);
      if (event.key === "Enter" || event.key === " ") commit(active);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      const index = q.options.findIndex((option) => option.toLowerCase().startsWith(event.key.toLowerCase()));
      if (index >= 0) {
        setOpen(true);
        setActive(index);
      }
    }
  }
  return (
    <div
      ref={root}
      className={styles.select}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        {...attributes}
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className={styles.selectTrigger}
        onClick={() => open ? setOpen(false) : show()}
        onKeyDown={keyDown}
      >
        <span className={styles.selectLabel}>{value || q.placeholder || "select an option"}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="14"
          height="7"
          viewBox="0 0 14 7"
          fill="none"
          aria-hidden="true"
        >
          <path d="m1 1 6 5 6-5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-label={q.label} className={styles.selectList}>
          {q.options.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={value === option}
              className={`${styles.selectOption} ${index === active ? styles.selectOptionActive : ""}`}
              onMouseEnter={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => commit(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name={q.id} value={value || ""} />
    </div>
  );
}

const CONTROLS = {
  file: ResumeUploadField,
  short: TextField,
  email: TextField,
  url: TextField,
  paragraph: TextField,
  date: DateTimeField,
  time: DateTimeField,
  dropdown: DropdownField,
  radio: ChoiceField,
  checkboxes: ChoiceField,
  scale: ScaleField,
  rating: ScaleField,
  radioGrid: GridField,
  checkboxGrid: GridField,
};

export default function QuestionField({ question, value, onChange, error }) {
  const Control = CONTROLS[question.type];
  const grouped = ["radio", "checkboxes", "scale", "rating", "radioGrid", "checkboxGrid"].includes(question.type);
  const descriptionIds = [
    question.description && `${question.id}-hint`,
    error && `${question.id}-error`,
  ].filter(Boolean).join(" ") || undefined;
  const attributes = {
    id: question.id,
    name: question.id,
    "aria-invalid": Boolean(error),
    "aria-describedby": descriptionIds,
    "aria-required": !grouped ? Boolean(question.required) : undefined,
  };
  const label = (
    <>
      {question.label}
      {question.required && <span className={styles.required} aria-label="required"> *</span>}
    </>
  );
  return (
    <fieldset className={styles.question} data-question={question.id} data-invalid={Boolean(error)}>
      {grouped ? (
        <legend className={styles.questionLabel}>{label}</legend>
      ) : (
        <label className={styles.questionLabel} htmlFor={question.id}>{label}</label>
      )}
      {question.description && (
        <p className={styles.hint} id={`${question.id}-hint`}>{question.description}</p>
      )}
      <Control question={question} value={value} onChange={onChange} attributes={attributes} />
      {error && <p className={styles.error} id={`${question.id}-error`}>{error}</p>}
    </fieldset>
  );
}

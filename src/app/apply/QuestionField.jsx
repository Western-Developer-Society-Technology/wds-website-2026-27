"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./apply.module.css";

function TextField({ question: q, value, onChange, attributes }) {
  const shared = { ...attributes, className: styles.field, value: value || "", onChange: (e) => onChange(e.target.value), placeholder: q.placeholder, maxLength: q.maxLength, autoComplete: q.autoComplete };
  return q.type === "paragraph" ? <><textarea {...shared} rows={5} />{q.maxLength && <span className={styles.counter}>{(value || "").length} / {q.maxLength}</span>}</> : <input {...shared} type={q.type === "short" ? "text" : q.type} />;
}

function ChoiceField({ question: q, value, onChange, attributes }) {
  const multiple = q.type === "checkboxes";
  return <div className={styles.choices}>{q.options.map((option, i) => <label className={styles.choice} key={option}>
    <input {...attributes} id={`${q.id}-${i}`} type={multiple ? "checkbox" : "radio"} checked={multiple ? (value || []).includes(option) : value === option} value={option} onChange={() => onChange(multiple ? ((value || []).includes(option) ? value.filter((item) => item !== option) : [...(value || []), option]) : option)} />
    <span>{option}</span>
  </label>)}</div>;
}

function ScaleField({ question: q, value, onChange, attributes }) {
  const rating = q.type === "rating";
  const options = Array.from({ length: q.max - (q.min ?? 1) + 1 }, (_, i) => i + (q.min ?? 1));
  return <div className={styles.scaleWrap}><div className={styles.scale}>{options.map((number) => <label className={`${styles.scaleOption} ${rating && Number(value) >= number ? styles.starFilled : ""}`} key={number}>
    <input {...attributes} id={`${q.id}-${number}`} type="radio" value={number} checked={value === String(number)} onChange={(e) => onChange(e.target.value)} aria-label={rating ? `${number} of ${q.max} stars` : String(number)} />
    <span aria-hidden="true">{rating ? "★" : number}</span>
  </label>)}</div>{!rating && <div className={styles.scaleLabels}><span>{q.lowLabel}</span><span>{q.highLabel}</span></div>}</div>;
}

function GridField({ question: q, value, onChange, attributes }) {
  const multiple = q.type === "checkboxGrid";
  return <div className={styles.gridRows}>{q.rows.map((row, index) => <fieldset className={styles.gridRow} key={row}>
    <legend>{row}</legend><div className={styles.gridOptions}>{q.columns.map((column, columnIndex) => {
      const selected = value?.[row] || (multiple ? [] : "");
      return <label className={styles.choice} key={column}><input {...attributes} id={`${q.id}-${index}-${columnIndex}`} name={`${q.id}-${index}`} type={multiple ? "checkbox" : "radio"} checked={multiple ? selected.includes(column) : selected === column} value={column} onChange={() => onChange({ ...value, [row]: multiple ? (selected.includes(column) ? selected.filter((item) => item !== column) : [...selected, column]) : column })} /><span>{column}</span></label>;
    })}</div>
  </fieldset>)}</div>;
}

function FileField({ question: q, value, onChange, attributes }) {
  const input = useRef(null);
  return <div className={styles.upload}><input ref={input} {...attributes} className={styles.fileInput} type="file" accept={q.accept} onChange={(e) => onChange(e.target.files?.[0] || null)} />{value && <button type="button" className={styles.textButton} onClick={() => { input.current.value = ""; onChange(null); input.current.focus(); }}>remove file</button>}</div>;
}

function DropdownField({ question: q, value, onChange, attributes }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const listId = `${q.id}-options`;

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
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
      if (event.key === "Escape") { setOpen(false); return; }
      if (!open) { show(); return; }
      if (event.key === "ArrowDown") setActive((index) => Math.min(q.options.length - 1, index + 1));
      if (event.key === "ArrowUp") setActive((index) => Math.max(0, index - 1));
      if (event.key === "Home") setActive(0);
      if (event.key === "End") setActive(q.options.length - 1);
      if (event.key === "Enter" || event.key === " ") commit(active);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      const index = q.options.findIndex((option) => option.toLowerCase().startsWith(event.key.toLowerCase()));
      if (index >= 0) { setOpen(true); setActive(index); }
    }
  }
  return <div ref={root} className={styles.select} onBlur={(event) => { if (!root.current?.contains(event.relatedTarget)) setOpen(false); }}>
    <button {...attributes} ref={trigger} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open ? `${listId}-${active}` : undefined} className={styles.selectTrigger} onClick={() => open ? setOpen(false) : show()} onKeyDown={keyDown}>
      <span className={styles.selectLabel}>{value || q.placeholder || "select an option"}</span>
      <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden="true"><path d="m1 1 6 5 6-5" stroke="currentColor" strokeWidth="1.5" /></svg>
    </button>
    {open && <ul id={listId} role="listbox" aria-label={q.label} className={styles.selectList}>{q.options.map((option, index) => <li key={option} id={`${listId}-${index}`} role="option" aria-selected={value === option} className={`${styles.selectOption} ${index === active ? styles.selectOptionActive : ""}`} onMouseEnter={() => setActive(index)} onPointerDown={(event) => event.preventDefault()} onClick={() => commit(index)}>{option}</li>)}</ul>}
    <input type="hidden" name={q.id} value={value || ""} />
  </div>;
}

const CONTROLS = { short: TextField, paragraph: TextField, date: TextField, time: TextField, dropdown: DropdownField, radio: ChoiceField, checkboxes: ChoiceField, scale: ScaleField, rating: ScaleField, file: FileField, radioGrid: GridField, checkboxGrid: GridField };

export default function QuestionField({ question, value, onChange, error }) {
  const Control = CONTROLS[question.type];
  const grouped = ["radio", "checkboxes", "scale", "rating", "radioGrid", "checkboxGrid"].includes(question.type);
  const descriptionIds = [question.description && `${question.id}-hint`, error && `${question.id}-error`].filter(Boolean).join(" ") || undefined;
  const attributes = { id: question.id, name: question.id, "aria-invalid": Boolean(error), "aria-describedby": descriptionIds, "aria-required": !grouped ? Boolean(question.required) : undefined };
  const label = <>{question.label}{question.required && <span className={styles.required} aria-label="required"> *</span>}</>;
  return <fieldset className={styles.question} data-question={question.id} data-invalid={Boolean(error)}>
    {grouped ? <legend className={styles.questionLabel}>{label}</legend> : <label className={styles.questionLabel} htmlFor={question.id}>{label}</label>}
    {question.description && <p className={styles.hint} id={`${question.id}-hint`}>{question.description}</p>}
    <Control question={question} value={value} onChange={onChange} attributes={attributes} />
    {error && <p className={styles.error} id={`${question.id}-error`}>{error}</p>}
  </fieldset>;
}

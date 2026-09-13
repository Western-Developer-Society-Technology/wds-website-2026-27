"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./apply.module.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

function dateValue(date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftMonth(date, amount) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  if (next.getFullYear() < 1 || next.getFullYear() > 9999) return date;
  const last = new Date(next);
  last.setMonth(last.getMonth() + 1, 0);
  next.setDate(Math.min(date.getDate(), last.getDate()));
  return next;
}

function timeParts(value = "12:00") {
  const [hour, minute] = (value || "12:00").split(":");
  return [String(Number(hour) % 12 || 12).padStart(2, "0"), minute, Number(hour) < 12 ? "AM" : "PM"];
}

function PickerIcon({ time }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {time ? (
        <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>
      ) : (
        <><rect x="3" y="5" width="18" height="16" /><path d="M7 2v6M17 2v6M3 10h18" /></>
      )}
    </svg>
  );
}

function Calendar({ value, onChange }) {
  const [cursor, setCursor] = useState(() => value ? new Date(`${value}T12:00:00`) : new Date());
  const [monthView, setMonthView] = useState(false);
  const root = useRef(null);
  const focusCalendar = useRef(true);
  const today = dateValue(new Date());
  const first = new Date(cursor);
  first.setDate(1);
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(first);
    day.setDate(index - first.getDay() + 1);
    return day;
  });

  useEffect(() => {
    if (focusCalendar.current) {
      root.current?.querySelector('[data-current="true"]')?.focus({ preventScroll: true });
      focusCalendar.current = false;
    }
  }, [cursor, monthView]);

  function navigate(event) {
    let next = new Date(cursor);
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: monthView ? -3 : -7, ArrowDown: monthView ? 3 : 7 };
    if (event.key in offset) {
      if (monthView) next = shiftMonth(cursor, offset[event.key]);
      else next.setDate(next.getDate() + offset[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      if (monthView) next = shiftMonth(cursor, (event.key === "Home" ? 0 : 11) - cursor.getMonth());
      else next.setDate(next.getDate() - next.getDay() + (event.key === "Home" ? 0 : 6));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      next = shiftMonth(cursor, (event.key === "PageUp" ? -1 : 1) * (event.shiftKey || monthView ? 12 : 1));
    } else return;
    event.preventDefault();
    if (next.getFullYear() < 1 || next.getFullYear() > 9999) return;
    focusCalendar.current = true;
    setCursor(next);
  }

  return (
    <div ref={root}>
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.pickerNav}
          aria-label={monthView ? "Previous year" : "Previous month"}
          onClick={() => setCursor(shiftMonth(cursor, monthView ? -12 : -1))}
        >←</button>
        <button
          type="button"
          className={styles.calendarHeading}
          aria-label={monthView ? "Choose a day" : "Choose month and year"}
          onClick={() => {
            focusCalendar.current = true;
            setMonthView(!monthView);
          }}
        >
          <span aria-live="polite">{monthView ? cursor.getFullYear() : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}</span>
        </button>
        <button
          type="button"
          className={styles.pickerNav}
          aria-label={monthView ? "Next year" : "Next month"}
          onClick={() => setCursor(shiftMonth(cursor, monthView ? 12 : 1))}
        >→</button>
      </div>
      {monthView ? (
        <div className={styles.monthGrid} onKeyDown={navigate}>
          {MONTHS.map((month, index) => (
            <button
              key={month}
              type="button"
              className={styles.pickerOption}
              data-current={index === cursor.getMonth()}
              aria-pressed={index === cursor.getMonth()}
              tabIndex={index === cursor.getMonth() ? 0 : -1}
              onClick={() => {
                focusCalendar.current = true;
                setCursor(shiftMonth(cursor, index - cursor.getMonth()));
                setMonthView(false);
              }}
            >{month.slice(0, 3)}</button>
          ))}
        </div>
      ) : (
        <div role="grid" aria-label={`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`} onKeyDown={navigate}>
          <div className={styles.calendarWeek} role="row">
            {WEEKDAYS.map((day) => <span key={day} role="columnheader" aria-label={day} className={styles.weekday}>{day.slice(0, 2)}</span>)}
          </div>
          {Array.from({ length: 6 }, (_, week) => (
            <div className={styles.calendarWeek} role="row" key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const date = dateValue(day);
                const current = date === dateValue(cursor);
                return (
                  <div role="gridcell" aria-selected={date === value} key={date}>
                    <button
                      type="button"
                      className={styles.pickerOption}
                      data-current={current}
                      data-outside={day.getMonth() !== cursor.getMonth()}
                      aria-current={date === today ? "date" : undefined}
                      aria-label={day.toLocaleDateString("en-CA", { dateStyle: "full" })}
                      tabIndex={current ? 0 : -1}
                      disabled={day.getFullYear() < 1 || day.getFullYear() > 9999}
                      onClick={() => onChange(date)}
                    >{day.getDate()}</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <div className={styles.pickerFooter}>
        <button type="button" onClick={() => onChange("")}>clear</button>
        <button type="button" onClick={() => onChange(today)}>today</button>
      </div>
    </div>
  );
}

function TimeColumn({ label, options, value, onChange }) {
  const root = useRef(null);

  useEffect(() => {
    const selected = root.current?.querySelector('[aria-selected="true"]');
    if (selected) root.current.scrollTop = selected.offsetTop - (root.current.clientHeight - selected.offsetHeight) / 2;
  }, [value]);

  function navigate(event) {
    let index = options.indexOf(value);
    if (event.key === "ArrowDown") index = (index + 1) % options.length;
    else if (event.key === "ArrowUp") index = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = options.length - 1;
    else return;
    event.preventDefault();
    onChange(options[index]);
    root.current.children[index]?.focus({ preventScroll: true });
  }

  return (
    <div>
      <div className={styles.timeLabel}>{label}</div>
      <div ref={root} className={styles.timeColumn} role="listbox" aria-label={label} onKeyDown={navigate}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            className={styles.pickerOption}
            aria-selected={option === value}
            tabIndex={option === value ? 0 : -1}
            onClick={() => onChange(option)}
          >{option}</button>
        ))}
      </div>
    </div>
  );
}

function TimePicker({ value, onChange, onClose }) {
  const root = useRef(null);
  const parts = timeParts(value);

  useEffect(() => {
    root.current?.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  }, []);

  function update(index, option) {
    const next = [...parts];
    next[index] = option;
    const hour = Number(next[0]) % 12 + (next[2] === "PM" ? 12 : 0);
    onChange(`${String(hour).padStart(2, "0")}:${next[1]}`);
  }

  return (
    <div ref={root}>
      <div className={styles.timeColumns}>
        {[HOURS, MINUTES, PERIODS].map((options, index) => (
          <TimeColumn key={index} label={["hour", "minute", "period"][index]} options={options} value={parts[index]} onChange={(option) => update(index, option)} />
        ))}
      </div>
      <div className={styles.pickerFooter}>
        <button type="button" onClick={() => { onChange(""); onClose(); }}>clear</button>
        <button type="button" onClick={() => { onChange(value || "12:00"); onClose(); }}>done</button>
      </div>
    </div>
  );
}

export default function DateTimeField({ question: q, value, onChange, attributes }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const popup = useRef(null);
  const time = q.type === "time";
  const popupId = `${q.id}-picker`;
  const [hour, minute, period] = timeParts(time ? value : undefined);
  const displayValue = value && time ? `${hour}:${minute} ${period}` : value;

  useLayoutEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    function position() {
      const bounds = trigger.current.getBoundingClientRect();
      const below = window.innerHeight - bounds.bottom - 20;
      const above = bounds.top - 100;
      const showAbove = below < popup.current.scrollHeight && above > below;
      popup.current.dataset.above = showAbove;
      popup.current.style.maxHeight = `${Math.max(120, showAbove ? above : below)}px`;
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, { passive: true });
    document.addEventListener("pointerdown", dismiss);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <div
      ref={root}
      className={styles.select}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        {...attributes}
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        className={`${styles.selectTrigger} ${styles.dateTimeTrigger}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{displayValue || (time ? "--:-- --" : "yyyy-mm-dd")}</span>
        <PickerIcon time={time} />
      </button>
      {open && (
        <div ref={popup} id={popupId} className={styles.dateTimePopup} role="dialog" aria-label={q.label}>
          {time ? (
            <TimePicker value={value} onChange={onChange} onClose={close} />
          ) : (
            <Calendar value={value} onChange={(date) => { onChange(date); close(); }} />
          )}
        </div>
      )}
      <input type="hidden" name={q.id} value={value || ""} />
    </div>
  );
}

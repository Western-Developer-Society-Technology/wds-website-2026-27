"use client";

import { useState } from "react";
import InterestSelect from "./InterestSelect";
import styles from "./Partner.module.css";

export default function PartnerForm() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [interest, setInterest] = useState("sponsoring an event");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [missing, setMissing] = useState([]);

  const filled = (value) => value.trim().length > 0;

  const edit = (field, setter) => (event) => {
    setter(event.target.value);
    setSent(false);
    setMissing((current) => current.filter((name) => name !== field));
  };

  const onInterestChange = (value) => {
    setInterest(value);
    setSent(false);
    setMissing((current) => current.filter((name) => name !== "interest"));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    const empty = [
      !filled(first) && "first",
      !filled(last) && "last",
      !filled(interest) && "interest",
      !filled(email) && "email",
    ].filter(Boolean);

    if (empty.length > 0) {
      setSent(false);
      setMissing(empty);

      const firstEmpty = event.currentTarget.elements.namedItem(empty[0]);
      if (firstEmpty && "focus" in firstEmpty) {
        firstEmpty.focus();
      }
      return;
    }

    setMissing([]);
    setSent(true);
  };

  const invalid = (field) => missing.includes(field);

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <p className={`${styles.copy} ${styles.nameLabel}`}>My name is </p>
        <input
          className={`${styles.field} ${styles.firstInput} ${
            invalid("first") ? styles.fieldInvalid : ""
          }`}
          type="text"
          name="first"
          autoComplete="given-name"
          placeholder="first"
          value={first}
          onChange={edit("first", setFirst)}
          aria-label="First name"
          aria-invalid={invalid("first")}
        />
      </div>

      <div className={styles.row}>
        <input
          className={`${styles.field} ${styles.lastInput} ${
            invalid("last") ? styles.fieldInvalid : ""
          }`}
          type="text"
          name="last"
          autoComplete="family-name"
          placeholder="last"
          value={last}
          onChange={edit("last", setLast)}
          aria-label="Last name"
          aria-invalid={invalid("last")}
        />
        <p className={`${styles.copy} ${styles.andLabel}`}>and</p>
      </div>

      <div className={styles.row}>
        <p className={`${styles.copy} ${styles.interestLabel}`}>I’m interested in </p>
        <InterestSelect
          value={interest}
          onChange={onInterestChange}
          invalid={invalid("interest")}
        />
      </div>

      <div className={`${styles.row} ${styles.cityContactRow}`}>
        <p className={`${styles.copy} ${styles.cityLabel}`}>in London, ON.</p>
        <p className={`${styles.copy} ${styles.contactLabel}`}>Contact me @ </p>
      </div>

      <div className={styles.row}>
        <input
          className={`${styles.field} ${styles.emailInput} ${
            invalid("email") ? styles.fieldInvalid : ""
          }`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={edit("email", setEmail)}
          aria-label="Email"
          aria-invalid={invalid("email")}
        />
      </div>

      <div className={styles.row}>
        <button className={styles.send} type="submit">
          send
        </button>
      </div>

      {sent ? (
        <p className={styles.thanks} role="status">
          thanks — we’ll be in touch.
        </p>
      ) : null}

      {missing.length > 0 ? (
        <p className={styles.error} role="alert">
          please fill in every field.
        </p>
      ) : null}
    </form>
  );
}

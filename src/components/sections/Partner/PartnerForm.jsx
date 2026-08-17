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

  const edit = (setter) => (event) => {
    setter(event.target.value);
    setSent(false);
  };

  const onInterestChange = (value) => {
    setInterest(value);
    setSent(false);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <p className={`${styles.copy} ${styles.nameLabel}`}>My name is </p>
        <input
          className={`${styles.field} ${styles.firstInput}`}
          type="text"
          name="first"
          autoComplete="given-name"
          placeholder="first"
          value={first}
          onChange={edit(setFirst)}
          aria-label="First name"
        />
        <input
          className={`${styles.field} ${styles.lastInput}`}
          type="text"
          name="last"
          autoComplete="family-name"
          placeholder="last"
          value={last}
          onChange={edit(setLast)}
          aria-label="Last name"
        />
        <p className={`${styles.copy} ${styles.andLabel}`}>and</p>
      </div>

      <div className={styles.row}>
        <p className={`${styles.copy} ${styles.interestLabel}`}>I’m interested in </p>
        <InterestSelect value={interest} onChange={onInterestChange} />
        <p className={`${styles.copy} ${styles.cityLabel}`}>in London, ON.</p>
      </div>

      <div className={styles.row}>
        <p className={`${styles.copy} ${styles.contactLabel}`}>Contact me @ </p>
        <input
          className={`${styles.field} ${styles.emailInput}`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={edit(setEmail)}
          aria-label="Email"
        />
        <button className={styles.send} type="submit">
          send
        </button>
      </div>

      {sent ? (
        <p className={styles.thanks} role="status">
          thanks — we’ll be in touch.
        </p>
      ) : null}
    </form>
  );
}

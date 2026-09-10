"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import QuestionField from "./QuestionField";
import { buildApplicationPayload, hasAnswer, validateQuestion } from "./formModel";
import styles from "./apply.module.css";

gsap.registerPlugin(useGSAP);

export default function ApplyForm({ application }) {
  const root = useRef(null);
  const progress = useRef(null);
  const feedback = useRef(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const questions = application.sections.flatMap((section) => section.questions);
  const completed = questions.filter((q) => hasAnswer(q, answers[q.id]) && !validateQuestion(q, answers[q.id])).length;

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-intro]", { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" });
    });
    return () => media.revert();
  }, { scope: root });

  useGSAP(() => {
    // Keep the current transform between updates; overwrite the active tween
    // instead of reverting it to zero whenever an answer changes.
    gsap.to(progress.current, {
      scaleY: completed / questions.length,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.8,
      ease: "expo.out", overwrite: true,
    });
  }, { scope: root, dependencies: [completed] });

  useGSAP(() => {
    if (checked) gsap.fromTo(feedback.current, { opacity: 0, y: 8 }, {
      opacity: 1, y: 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.3,
    });
  }, { scope: root, dependencies: [checked], revertOnUpdate: true });

  function update(question, value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setChecked(false);
    setErrors((current) => ({ ...current, [question.id]: current[question.id] ? validateQuestion(question, value) : "" }));
  }

  function checkApplication(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(questions.map((q) => [q.id, validateQuestion(q, answers[q.id])]).filter(([, error]) => error));
    setErrors(nextErrors);
    setChecked(false);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      root.current.querySelector(`[data-question="${firstInvalid}"] input:not([type="hidden"]), [data-question="${firstInvalid}"] textarea, [data-question="${firstInvalid}"] [role="combobox"]`)?.focus();
      return;
    }
    const payload = buildApplicationPayload(application, answers);
    // Frontend preview only. Future Formspree integration receives this payload.
    if (payload.portfolio) setChecked(true);
  }

  return <div ref={root} className={styles.page} data-application-page="true">
    <header className={styles.header}>
      <a href="/portfolios" className={styles.back} data-intro>← all portfolios</a>
      <h1 data-intro>{application.label.toLowerCase()} application</h1>
      <div className={styles.intro} data-intro><span>preview form / {application.cycle}</span></div>
      <p className={styles.previewNote} data-intro>Sample questions. Answers are not sent or saved.</p>
    </header>
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={checkApplication} noValidate>
        <p className={styles.requiredNote}>Fields marked <span>*</span> are required.</p>
        {application.sections.map((section, index) => <section className={styles.section} id={`section-${section.id}`} key={section.id} aria-labelledby={`heading-${section.id}`}>
          <h2 id={`heading-${section.id}`}><span>0{index + 1}</span>{section.title}</h2>
          {section.questions.map((question) => <QuestionField key={question.id} question={question} value={answers[question.id]} onChange={(value) => update(question, value)} error={errors[question.id]} />)}
        </section>)}
        <div className={styles.finish}><p>Preview of submission<span>Validates locally. No application is sent.</span></p><button className={styles.submit} type="submit">submit application <span aria-hidden="true">↗</span></button></div>
        {Object.values(errors).some(Boolean) && <p className={styles.error} role="alert">A few answers need your attention. Please check the highlighted questions.</p>}
        <div ref={feedback} role="status">{checked && <p className={styles.feedback}>Preview complete. Answers are valid. This application has not been submitted or saved.</p>}</div>
      </form>
    </div>
    <div className={styles.progressDock} role="progressbar" aria-label="Application progress" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={questions.length}>
      <div className={styles.progressTrack}><div ref={progress} className={styles.progressFill} /></div>
      <span className={styles.progressCount}>{completed} / {questions.length}</span>
    </div>
  </div>;
}

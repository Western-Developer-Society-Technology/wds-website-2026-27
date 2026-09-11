"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Turnstile } from "@marsidev/react-turnstile";
import CornerButton from "@/components/ui/CornerButton";
import QuestionField from "./QuestionField";
import { buildApplicationPayload, hasAnswer, isObject, validateQuestion } from "./formModel";
import styles from "./apply.module.css";

gsap.registerPlugin(useGSAP);

const UNCONFIRMED_MESSAGE = "We could not confirm your submission. Your answers are still here. Please retry; the same request will not be saved twice.";

export default function ApplyForm({ application, accepting, siteKey }) {
  const root = useRef(null);
  const progress = useRef(null);
  const feedback = useRef(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("");
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const turnstile = useRef(null);
  const attempt = useRef(null);
  const submitting = useRef(false);
  const questions = application.sections.flatMap((section) => section.questions);
  // Optional answers are not needed to reach 100%.
  const required = questions.filter((question) => question.required);
  const completed = required.filter((question) =>
    hasAnswer(question, answers[question.id]) && !validateQuestion(question, answers[question.id]),
  ).length;

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-intro]", {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
      });
    });
    return () => media.revert();
  }, { scope: root });

  useGSAP(() => {
    // Continue from the current progress instead of restarting at zero.
    gsap.to(progress.current, {
      scaleY: completed / required.length,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.8,
      ease: "expo.out",
      overwrite: true,
    });
  }, { scope: root, dependencies: [completed] });

  useGSAP(() => {
    if (receipt) {
      gsap.fromTo(feedback.current, { opacity: 0, y: 8 }, {
        opacity: 1,
        y: 0,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.3,
      });
    }
  }, { scope: root, dependencies: [receipt], revertOnUpdate: true });

  function update(question, value) {
    if (submitting.current || receipt) return;
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setErrors((current) => ({
      ...current,
      [question.id]: current[question.id] ? validateQuestion(question, value) : "",
    }));
  }

  function focusFirstError(nextErrors) {
    const question = questions.find((question) => nextErrors[question.id]);
    if (!question) return;
    root.current.querySelector(`[data-question="${question.id}"]`)
      ?.querySelector('input:not([type="hidden"]), textarea, [role="combobox"]')
      ?.focus();
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (submitting.current || receipt || !accepting) return;
    setMessage("");
    const nextErrors = Object.fromEntries(
      questions.map((question) => [question.id, validateQuestion(question, answers[question.id])])
        .filter(([, error]) => error),
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }

    const payload = buildApplicationPayload(application, answers);
    const serialized = JSON.stringify(payload);
    const retry = attempt.current?.payload === serialized;
    if (!token && !retry) {
      setMessage("Please complete the verification first.");
      return;
    }
    // Reuse the request ID when retrying after a lost response.
    if (!retry) attempt.current = { payload: serialized, key: crypto.randomUUID() };
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: attempt.current.key,
          turnstileToken: token,
          website: new FormData(event.currentTarget).get("website"),
        }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!isObject(result)) throw new Error(UNCONFIRMED_MESSAGE);
      if (!response.ok) {
        if (isObject(result.errors)) setErrors(result.errors);
        throw new Error(result.errors?.form || result.error || "Your application could not be saved. Please try again.");
      }
      if (typeof result.id !== "string" || !result.id) {
        throw new Error(UNCONFIRMED_MESSAGE);
      }
      setReceipt(result.id);
    } catch (error) {
      const unconfirmed = error.name === "TimeoutError" ||
        error instanceof TypeError || error instanceof SyntaxError;
      setMessage(unconfirmed ? UNCONFIRMED_MESSAGE : error.message);
      turnstile.current?.reset();
      setToken("");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <div ref={root} className={styles.page} data-application-page="true">
      <header className={styles.header}>
        <a href="/portfolios" className={styles.back} data-intro>← all portfolios</a>
        <h1 data-intro>{application.label.toLowerCase()} application</h1>
        <div className={styles.intro} data-intro>
          <span>director hiring {application.cycle}</span>
        </div>
      </header>
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={submitApplication} noValidate>
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Leave this field empty
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className={styles.requiredNote}>Fields marked <span>*</span> are required.</p>
          <fieldset className={styles.answerFields} disabled={pending || Boolean(receipt)}>
            {application.sections.map((section, index) => (
              <section
                className={styles.section}
                id={`section-${section.id}`}
                key={section.id}
                aria-labelledby={`heading-${section.id}`}
              >
                <h2 id={`heading-${section.id}`}>
                  <span>0{index + 1}</span>{section.title}
                </h2>
                {section.questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => update(question, value)}
                    error={errors[question.id]}
                  />
                ))}
              </section>
            ))}
          </fieldset>
          {accepting && !receipt && (siteKey ? (
            <div className={styles.verification}>
              <Turnstile
                ref={turnstile}
                siteKey={siteKey}
                options={{ action: "director_application", theme: "dark" }}
                onSuccess={(value) => {
                  setToken(value);
                  setVerificationError("");
                }}
                onExpire={() => setToken("")}
                onError={() => {
                  setToken("");
                  setVerificationError("Verification could not load. Check your connection and retry.");
                }}
              />
              {verificationError && (
                <>
                  <p className={styles.error} role="alert">{verificationError}</p>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={pending}
                    onClick={() => turnstile.current?.reset()}
                  >
                    retry verification
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className={styles.error} role="alert">Submissions are temporarily unavailable. Please try again later.</p>
          ))}
          <div className={styles.finish}>
            <p>
              {receipt ? "Application received" : "Ready to apply?"}
              <span>
                {receipt
                  ? "Keep your submission ID for reference."
                  : accepting ? "Review your answers before submitting." : "Submissions are closed."}
              </span>
            </p>
            <CornerButton
              type="submit"
              variant="pink"
              className={styles.submit}
              disabled={!accepting || !siteKey || pending || Boolean(receipt)}
            >
              {pending ? "submitting…" : receipt ? "submitted" : "submit form"}
            </CornerButton>
          </div>
          {questions.some((question) => errors[question.id]) && (
            <p className={styles.error} role="alert">
              A few answers need your attention. Please check the highlighted questions.
            </p>
          )}
          {message && <p className={styles.error} role="alert">{message}</p>}
          <div ref={feedback} role="status">
            {receipt && (
              <p className={styles.feedback}>
                Your application has been saved. Thank you!<br />
                Submission ID: {receipt}
              </p>
            )}
          </div>
        </form>
      </div>
      <div
        className={styles.progressDock}
        role="progressbar"
        aria-label="Application progress"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={required.length}
      >
        <div className={styles.progressTrack}>
          <div ref={progress} className={styles.progressFill} />
        </div>
        <span className={styles.progressCount}>{completed} / {required.length}</span>
      </div>
    </div>
  );
}

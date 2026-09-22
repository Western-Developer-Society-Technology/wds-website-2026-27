"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Turnstile } from "@marsidev/react-turnstile";
import CornerButton from "@/components/ui/CornerButton";
import QuestionField, { ChoiceControl, ChoiceFilters } from "./QuestionField";
import ApplicationProgress from "./ApplicationProgress";
import { buildApplicationPayload, hasAnswer, isObject, isQuestionVisible, validateQuestion } from "./formModel";
import styles from "./apply.module.css";

gsap.registerPlugin(useGSAP);

const UNCONFIRMED_MESSAGE = "We could not confirm your submission. Your answers are still here. Please retry; the same request will not be saved twice.";

// Keep unfinished and hidden answers, but never files or malformed cached values.
function draftAnswers(application, answers) {
  const strings = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
  return Object.fromEntries(application.sections.flatMap((section) => section.questions)
    .filter((question) => {
      const value = answers[question.id];
      if (question.type === "file") return false;
      if (question.type === "checkboxes") return strings(value);
      if (question.rows) {
        return isObject(value) && Object.values(value).every((item) =>
          question.type === "checkboxGrid" ? strings(item) : typeof item === "string");
      }
      return typeof value === "string";
    })
    .map((question) => [question.id, answers[question.id]]));
}

export default function ApplyForm({ application, accepting, siteKey }) {
  const root = useRef(null);
  const feedback = useRef(null);
  const [answers, setAnswers] = useState({});
  const [membershipAcknowledged, setMembershipAcknowledged] = useState(false);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("");
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const turnstile = useRef(null);
  const attempt = useRef(null);
  const submitting = useRef(false);
  const draftKey = `wds:application-draft:${application.cycle}:${application.id}:v${application.version}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey));
      // Restore browser-only state after hydration; saving happens only on edits.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isObject(saved)) setAnswers(draftAnswers(application, saved));
    } catch {
      // An unreadable draft must not prevent filling out the form.
    }
  }, [application, draftKey]);

  const questions = application.sections.flatMap((section) => section.questions)
    .filter((question) => isQuestionVisible(question, answers));
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
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(draftAnswers(application, next)));
    } catch {
      // Continue normally when browser storage is unavailable or full.
    }
    setErrors((current) => ({
      ...current,
      [question.id]: (question.type === "file" || current[question.id]) ? validateQuestion(question, value) : "",
    }));
  }

  function focusFirstError(nextErrors) {
    const question = questions.find((question) => nextErrors[question.id]);
    const id = question?.id ?? (nextErrors.membershipAcknowledgment ? "membershipAcknowledgment" : null);
    if (!id) return;
    root.current?.querySelector(`[data-question="${id}"]`)
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
    if (!membershipAcknowledged) {
      nextErrors.membershipAcknowledgment = "Please acknowledge the WDS membership requirement before submitting.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }

    const website = new FormData(event.currentTarget).get("website");
    submitting.current = true;
    setPending(true);
    try {
      const payload = buildApplicationPayload(application, answers);
      const digest = await crypto.subtle.digest("SHA-256", await answers.resume.arrayBuffer());
      const resumeHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const serialized = JSON.stringify({ ...payload, resumeHash });
      const retry = attempt.current?.payload === serialized;
      if (!token && !retry) {
        setMessage("Please complete the verification first.");
        return;
      }
      // File bytes, not just the filename, determine whether this is a retry.
      if (!retry) attempt.current = { payload: serialized, key: crypto.randomUUID() };
      const data = new FormData();
      data.append("payload", JSON.stringify({
        ...payload,
        idempotencyKey: attempt.current.key,
        turnstileToken: token,
        website,
      }));
      data.append("resume", answers.resume);
      const response = await fetch("/api/applications", {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(60000),
      });
      const result = await response.json();
      if (!isObject(result)) throw new Error(UNCONFIRMED_MESSAGE);
      if (!response.ok) {
        if (isObject(result.errors)) {
          setErrors(result.errors);
          // Wait for finally to re-enable the fieldset before focusing a field.
          requestAnimationFrame(() => focusFirstError(result.errors));
        }
        throw new Error(result.errors?.form || result.error || "Your application could not be saved. Please try again.");
      }
      if (typeof result.id !== "string" || !result.id) {
        throw new Error(UNCONFIRMED_MESSAGE);
      }
      setReceipt(result.id);
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        // Storage cleanup must not turn a confirmed submission into an error.
      }
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
      <ChoiceFilters />
      <header className={styles.header}>
        <a href="/portfolios" className={styles.back} data-intro>← all portfolios</a>
        <h1 data-intro>{application.label.toLowerCase()} application</h1>
        <div className={styles.intro} data-intro>
          <span>director hiring {application.cycle}</span>
        </div>
      </header>
      <ApplicationProgress completed={completed + Number(membershipAcknowledged)} total={required.length + 1} />
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
            {application.sections.map((section) => (
              <section
                className={styles.section}
                id={`section-${section.id}`}
                key={section.id}
                aria-label={section.title}
              >
                 {section.questions.filter((question) => isQuestionVisible(question, answers)).map((question) => (
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
            <fieldset
              className={styles.question}
              data-question="membershipAcknowledgment"
              data-invalid={Boolean(errors.membershipAcknowledgment)}
            >
              <legend className={styles.questionLabel}>
                WDS membership <span className={styles.required} aria-label="required">*</span>
              </legend>
              <div className={styles.choices}>
                <ChoiceControl
                  id="membershipAcknowledgment"
                  multiple
                  required
                  checked={membershipAcknowledged}
                  onChange={(event) => {
                    setMembershipAcknowledged(event.target.checked);
                    setErrors((current) => ({ ...current, membershipAcknowledgment: "" }));
                  }}
                  aria-invalid={Boolean(errors.membershipAcknowledgment)}
                  aria-describedby={errors.membershipAcknowledgment ? "membershipAcknowledgment-error" : undefined}
                >
                  I acknowledge that I must be a WDS member to be accepted for a director position.
                   If you are not a member, you may still submit this application.
                </ChoiceControl>
              </div>
              <a
                className={`${styles.textButton} ${styles.membershipLink}`}
                href="https://buy.stripe.com/cNibJ04YJ8s78uIc0t7wA02"
                target="_blank"
                rel="noopener noreferrer"
              >
                Become a WDS member ↗
              </a>
              {errors.membershipAcknowledgment && (
                <p className={styles.error} id="membershipAcknowledgment-error">
                  {errors.membershipAcknowledgment}
                </p>
              )}
            </fieldset>
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
          {(questions.some((question) => errors[question.id]) || errors.membershipAcknowledgment) && (
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
    </div>
  );
}

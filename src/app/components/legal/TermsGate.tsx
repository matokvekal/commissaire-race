import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TERMS_SECTIONS } from "../../legal/terms";
import { hasAcceptedCurrentTerms, acceptCurrentTerms } from "../../legal/termsAcceptance";
import styles from "./termsGate.module.css";

/**
 * Startup acceptance gate (BUGS.md #16). Blocks the app on first launch (and
 * after the terms version changes) until the user ticks "I have read and agree".
 * Acceptance is persisted, so it's asked once. Content comes from @/legal/terms.
 */
const TermsGate = () => {
  const [accepted, setAccepted] = useState(() => hasAcceptedCurrentTerms());
  const [checked, setChecked] = useState(false);
  const location = useLocation();

  // Don't cover the full Terms page itself — the gate links there to be read.
  if (accepted || location.pathname === "/terms") return null;

  const handleAgree = () => {
    if (!checked) return;
    acceptCurrentTerms();
    setAccepted(true);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Terms and Conditions">
      <div className={styles.card}>
        <h2 className={styles.title}>Terms &amp; Conditions</h2>
        <p className={styles.intro}>
          Before you start, please read and accept how Commissaire may be used.
        </p>

        <div className={styles.scroll}>
          {TERMS_SECTIONS.map((section) => (
            <div key={section.heading} className={styles.section}>
              <h3 className={styles.heading}>{section.heading}</h3>
              {section.body.map((para, i) => (
                <p key={i} className={styles.para}>{para}</p>
              ))}
            </div>
          ))}
        </div>

        <label className={styles.agreeRow}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>
            I have read and agree to the{" "}
            <Link className={styles.link} to="/terms" target="_blank" rel="noopener noreferrer">
              Terms &amp; Conditions
            </Link>
            .
          </span>
        </label>

        <button className={styles.agreeBtn} disabled={!checked} onClick={handleAgree}>
          Agree &amp; Continue
        </button>
      </div>
    </div>
  );
};

export default TermsGate;

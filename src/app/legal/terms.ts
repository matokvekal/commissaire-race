/**
 * Terms & Conditions content (BUGS.md #16).
 *
 * ⚠️ DRAFT / PLACEHOLDER — standard wording, NOT reviewed by a lawyer. Replace
 * the section bodies below with your own or your lawyer's text before relying on
 * this legally. Everything the app renders (the /terms page and the startup
 * acceptance gate) reads from here, so this is the only file you need to edit.
 *
 * Bump TERMS_VERSION whenever the wording changes materially — the startup gate
 * re-asks users to accept when the accepted version is older than this.
 */

// draft-2: added the supported-devices section (Android tested, iOS untested).
export const TERMS_VERSION = "2026-07-draft-2";

export const TERMS_EFFECTIVE_DATE = "21 July 2026";

export interface TermsSection {
  heading: string;
  body: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    heading: "1. Free to use",
    body: [
      "Commissaire is provided free of charge for organising and timing cycling races, for personal and club use.",
      "You may use the app for your own events without payment. No account purchase or licence fee is required.",
    ],
  },
  {
    heading: "2. No copying or redistribution",
    body: [
      "The app, its design, code, and content are the property of the app owner.",
      "You may not copy, reproduce, resell, redistribute, rebrand, reverse-engineer, or create derivative versions of the app or any part of it without the owner's prior written permission.",
      "Race data that you enter remains yours; these terms concern the application itself, not the start lists or results you create with it.",
    ],
  },
  {
    heading: "3. Provided “as is” — no warranty",
    body: [
      "The app is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose or uninterrupted, error-free operation.",
      "Race timing and results depend on correct use, device performance, and network conditions. Always keep an independent backup of critical results.",
    ],
  },
  {
    heading: "4. No owner liability",
    body: [
      "To the maximum extent permitted by law, the app owner is not responsible or liable for any loss, damage, incorrect result, missed timing, data loss, or other consequence arising from use of the app.",
      "You are responsible for verifying results before they are published or used for any official ranking or award.",
    ],
  },
  {
    heading: "5. Your data",
    body: [
      "Race data you create is stored locally on your device. Clearing your browser storage or uninstalling the app may delete it.",
      "You are responsible for handling any personal data of riders in line with the laws that apply to your event.",
    ],
  },
  {
    heading: "6. Supported devices",
    body: [
      "Commissaire is developed and tested on Android phones and tablets. That is the platform it is verified on.",
      "The app is a web app and is expected to work on iPhone and iPad through the browser, but it has not been tested in depth on iOS. Some behaviour — particularly around background timing, audio input, and offline storage — may differ or not work as intended there.",
      "If you are timing a race on iOS, test your full workflow beforehand and keep an independent backup of results.",
    ],
  },
  {
    heading: "7. Changes to these terms",
    body: [
      "These terms may be updated from time to time. When they change materially, you will be asked to review and accept the updated version the next time you open the app.",
    ],
  },
];

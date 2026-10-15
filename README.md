# Dengue Shield — Outbreak Tracker & Prevention (UX Concept)

Every October–November, dengue peaks in Lahore, Rawalpindi, Peshawar and Karachi — hospitals fill, platelet donors run dry, and families get no straight answers to three questions: *is my mohalla a hotspot right now, which symptoms mean rush to hospital today, and what actually stops mosquitoes breeding at home?*

**Dengue Shield** is a mobile-first web app concept that answers all three: a city-wise outbreak risk dashboard with hotspot alerts, a symptom checker with automatic warning-sign triage, a home prevention planner with a saved checklist, breeding-site reporting, a repellent price guide in PKR, and a platelet donor directory.

## Features
- City selector (Lahore, Rawalpindi, Peshawar, Karachi, Islamabad) with per-city risk index, band and fogging schedule
- Outbreak risk hero card — big risk number, LOW / MODERATE / HIGH band, and a 7-day case trend drawn as hand-built SVG
- Hotspot alert cards per city ("Walled City area — 58 new cases this week") with fogging-drive notes
- Symptom checker with real triage logic: any warning sign (bleeding, severe abdominal pain, persistent vomiting, drowsiness) → red "See a doctor TODAY" verdict; 3+ days of fever → "get a dengue test"; otherwise home monitoring guidance
- Always-visible red-flag list of symptoms that mean rush to hospital
- Prevention planner: 8-item weekly breeding-site checklist persisted in `localStorage` with progress bar, weekly-reminder toggle, repellent guide with PKR prices (Mortein coil Rs 180, mosquito net Rs 650…), fogging-request CTA
- Breeding-site report form with validation and a confirmation + reference number
- Platelet donor directory (sample listings, masked numbers) with blood groups and areas

## Tech
Pure HTML, CSS and JavaScript — no frameworks, single `index.html`. The symptom triage and risk-band logic live in plain functions with zero DOM dependencies, so they run unchanged in Node for testing.

## How it works
- All outbreak data lives in one JavaScript object (`CITIES`) — each city carries its risk index, 7-day case trend, hotspot list and fogging note. Switching cities just re-renders from that object; there is no backend and no page reload.
- `riskBand(index)` maps a 0–100 index to LOW / MODERATE / HIGH with a color and plain-language advice. The same function drives the hero card, the trend chart color and the hotspot styling.
- The 7-day trend is a hand-drawn SVG area chart: the script converts each data point to x/y coordinates, builds the path string, and colors it from the city's risk band.
- `triage(answers)` is a small rule engine. It checks the four WHO-style warning signs first — any single one wins and returns the red "emergency" verdict with the matched flags listed. Otherwise fever duration decides between "see a doctor today" (3+ days → NS1 test) and "monitor at home". Because the logic never touches the DOM, `smoke-test.js` can import it straight from `index.html` and assert every branch.
- The prevention checklist serializes a boolean array to `localStorage` (`ds_checklist`), so progress survives reloads; the reminder toggle and last-used city persist the same way. A memory fallback keeps it working where storage is blocked.
- The report form is validated by `validateReport()` (area + type required); on success it renders a confirmation card with a generated reference (`DS-2026-####`).

## What you can learn from this project
- **Design for a real, seasonal problem:** timed to Pakistan's October–November dengue peak and built around the three questions families actually ask — features follow the problem, not the other way round.
- **Rule-based triage without a backend:** how to turn medical guidance (warning signs × fever duration) into a small, explainable, testable decision function.
- **Testable front-end logic:** keeping pure logic DOM-free so the same code that runs in the browser can be unit-tested in Node — run `node smoke-test.js` (52 assertions, all passing).
- **Hand-drawn SVG charts:** converting a data series into path coordinates, and coloring a whole UI from one computed value (the risk band).
- **localStorage patterns:** persisting checklist state, toggles and preferences with a graceful in-memory fallback.
- **Honest sample data:** every number on the page is labeled illustrative — a public-health concept must never present mock figures as real data.

Fork it, read the single `index.html`, and adapt the pattern to your own local problem — flood alerts, heatwave guidance, vaccination drives, anything seasonal where three clear answers beat a thousand forwards.

## Links
- Live demo: https://abbasmomand98-jpg.github.io/dengue-shield-tracker/
- Repo: https://github.com/abbasmomand98-jpg/dengue-shield-tracker

## Disclaimer
Concept demo — case counts, risk scores and donor listings are illustrative sample data for design purposes, not live health data and not medical advice.

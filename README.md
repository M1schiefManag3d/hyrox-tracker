Hyrox Tracker

A lightweight, offline-first web app for running a 12-week Hyrox training block: today's prescribed session, workout and nutrition logging, simulation split times, and a Costco-friendly recipe and grocery reference — all in one installable page with no backend, no account and no build step.

Built as a personal tool around one specific 12-week plan, but the plan, recipes and targets live in plain JavaScript data files, so it's easy to adapt.

<!-- Add a screenshot here once you have one, e.g. --> <!-- <img src="docs/dashboard.png" width="320" alt="Dashboard"> -->
Features

Dashboard

Stat cards for sessions completed and average protein over the last 7 days
Countdown to race day and current training week (1–12), worked out backwards from the race date
Today's session with the full exercise prescription (sets, reps, RPE, duration, coaching notes)
The current phase's weekly schedule, with today highlighted
Your five most recent simulation totals

Workouts — Log a session (type, completed/skipped, RPE, duration, notes). Picking a session type shows "What to do" so the prescription is right there while you log.

Nutrition

Protein and calorie targets derived from your settings (1 g protein per lb bodyweight; calories = maintenance − 350)
A "Today's Meals" plan that rotates breakfast, bowl base, protein and sauce by day of the year, with calorie and protein subtotals
Remaining snack budget and protein gap, with snacks flagged when they'd go over
Daily log for calories, macros and bodyweight

Sims — Log full or partial Hyrox simulations by station (running, SkiErg, sled push, sled pull, burpee broad jumps, row, farmers carry, lunges, wall balls) with an automatic total.

Recipes — Sauces (ingredients, method and dietary tags), batch-cook proteins with the matching Costco product, breakfasts, and a grouped grocery list with a weekly prep rhythm.

Settings — Bodyweight, maintenance calories, race date, plus sync and backup.

The training plan

Three four-week phases. Thursdays are left for your existing bike work (Wahoo Kickr), and Sunday is rest.

Phase	Weeks	Focus	Saturday
1 — Foundation	1–4	Movement quality, grip/carry capacity, strength base. Moderate loads, no compromised running.	Grip & Carry Test (wk 1), Easy Long Carry (wk 2–4)
2 — Build	5–8	Heavier loads, compromised running, stations under mild fatigue.	Engine Intervals (wk 5, 7), Partial Simulation (wk 6, 8)
3 — Race Prep	9–12	Race-specific intensity, full simulations, then taper.	Full Simulation (wk 9, 11), Engine Intervals (wk 10, 12)

Weekday pattern: Mon Strength A · Tue Tempo Run · Wed Engine + Mobility (Phase 1) or Compromised Running (Phases 2–3) · Thu Bike · Fri Strength B.

Week 1 starts exactly 12 weeks before the race date you set. With no race date, the app shows the Phase 1 / Week 1 plan as a reference.

Getting started

There's nothing to install or build — it's static HTML, CSS and JavaScript.

Run it locally

The service worker needs to be served over HTTP, so use a local server rather than opening index.html directly:

bash
git clone https://github.com/M1schiefManag3d/hyrox-tracker.git
cd hyrox-tracker
python3 -m http.server 8000

Then open http://localhost:8000.

Host it on GitHub Pages
In the repo, go to Settings → Pages.
Under Build and deployment, choose Deploy from a branch, then select main and / (root).
After a minute or so the app is live at https://m1schiefmanag3d.github.io/hyrox-tracker/.
Install it on your iPhone
Open the Pages URL in Safari.
Tap Share → Add to Home Screen.
Launch it from the home screen. It runs full-screen and keeps working offline once loaded.

On a Mac, Chrome and Edge can install it from the address bar. In Safari, use File → Add to Dock.

Your data

Everything is stored in your browser's localStorage under the key hyroxData. Nothing is sent anywhere. The trade-off is that each device and browser keeps its own copy, so syncing is manual:

Method	Where it works	How
Save / Load iCloud file	Desktop Chrome and Edge (File System Access API)	Pick a hyrox-data.json in iCloud Drive once. After that, Save writes to the same file for the rest of the session.
Export / Import JSON	Everywhere, including iOS	Export downloads hyrox-data.json, which you can save to Files or iCloud. Import loads it on another device.

A typical routine: log on your phone, Export to iCloud Drive, then Load on the Mac (or the other way round). Importing replaces the data on that device rather than merging it, so always import the newest file.

Clearing your browser's site data deletes everything. Export a backup now and then.

Data shape
json
{
  "setup":     { "bodyweight": 175, "maintenance": 2550, "raceDate": "2027-03-14" },
  "workouts":  [{ "id": "...", "date": "YYYY-MM-DD", "session": "Strength A", "completed": true, "rpe": "7", "duration": "45", "notes": "" }],
  "nutrition": [{ "id": "...", "date": "YYYY-MM-DD", "calories": "", "protein": "", "carbs": "", "fat": "", "bodyweight": "", "notes": "" }],
  "sims":      [{ "id": "...", "date": "YYYY-MM-DD", "run": "", "skierg": "", "sledPush": "", "sledPull": "", "burpee": "", "row": "", "farmers": "", "lunges": "", "wallball": "", "notes": "" }]
}
Project structure
hyrox-tracker/
├── index.html          # App shell: six views, tab bar, shared modal
├── style.css           # iOS-style UI with automatic light/dark mode
├── app.js              # Rendering, logging, targets, meal rotation, sync
├── training-data.js    # Phases, weekly schedule, session library (sets/reps/RPE)
├── recipes-data.js     # Sauces, proteins, breakfasts, bowl macros, snacks, grocery list
├── service-worker.js   # Offline caching
├── manifest.json       # PWA metadata and icons
└── icon-192.png / icon-512.png / apple-touch-icon.png
Customizing
Change the plan: edit phases, sessionTypes and resolveSessionKey() in training-data.js, and the exercise prescriptions in WORKOUT_LIBRARY. Every resolveSessionKey() return value needs a matching WORKOUT_LIBRARY key.
Change the targets: proteinTarget() and calorieTarget() sit near the top of app.js. The same −350 kcal deficit is also hard-coded in updateSetupCalc().
Change food: edit recipes-data.js. The meal rotation reads from breakfasts, bowlBases, bowlProteins, bowlVeg, sauceMacros and snacks.
Ship an update: bump CACHE_NAME in service-worker.js (e.g. hyrox-tracker-v2) whenever you change files. The worker serves the cache first, so an installed app shows the old version until it reloads once more after the update.
Known issues
Default log date can be off by a day. todayISO() uses UTC, so in the evening in Pacific time new entries default to tomorrow's date. A fix is to build the date from local time (getFullYear(), getMonth(), getDate()).
Training Week card subtitle. The phase-name replace() concatenates indexOf(...) + 1 as a string ("Phase 01 — "), so the full phase name shows instead of the shortened one.
User-entered notes are rendered with innerHTML. That's fine for a single-user local app, but escape them if you ever add shared data.

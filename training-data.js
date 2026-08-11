// Training plan reference, sourced from Hyrox - Training Plan.md
const TRAINING_DATA = {
  sessionTypes: [
    "Foundation Strength A", "Foundation Strength B", "Strength A", "Strength B",
    "Engine + Mobility", "Compromised Running", "Engine Intervals",
    "Partial Simulation", "Full Simulation", "Grip & Carry Test", "Easy Long Carry",
    "Existing Run/Spin", "Existing Bike (Kickr)", "Rest/Mobility", "Other"
  ],
  phases: [
    {
      name: "Phase 1 — Foundation",
      weeks: [1, 2, 3, 4],
      goal: "Movement quality, grip/carry capacity, strength base. Moderate loads, no compromised running, nothing near failure.",
      week: {
        Mon: "Foundation Strength A", Tue: "Existing run or easy spin", Wed: "Engine + Mobility",
        Thu: "Existing bike (Kickr)", Fri: "Foundation Strength B",
        Sat: "Grip & Carry Test (Wk1) / Easy long carry (Wk2-4)", Sun: "Rest or light mobility"
      }
    },
    {
      name: "Phase 2 — Build",
      weeks: [5, 6, 7, 8],
      goal: "Add load, add compromised running, start blending stations under mild fatigue.",
      week: {
        Mon: "Strength A (loaded)", Tue: "Existing run or easy spin", Wed: "Compromised Running",
        Thu: "Existing bike (Kickr)", Fri: "Strength B (loaded)",
        Sat: "Engine Intervals (Wk5,7) / Partial Simulation (Wk6,8)", Sun: "Rest or mobility"
      }
    },
    {
      name: "Phase 3 — Race Prep",
      weeks: [9, 10, 11, 12],
      goal: "Race-specific intensity, full simulations, then taper.",
      week: {
        Mon: "Strength A (maintain, lower volume)", Tue: "Existing run or easy spin", Wed: "Compromised Running (race pace)",
        Thu: "Existing bike (Kickr)", Fri: "Strength B (maintain, lower volume)",
        Sat: "Full Simulation (Wk9,11) / Engine Intervals (Wk10,12 taper)", Sun: "Rest"
      }
    }
  ],
  simStations: [
    "Run Total (min)", "SkiErg Sub (min)", "Sled Push Sub (min)", "Sled Pull Sub (min)",
    "Burpee Broad Jump (min)", "Row Sub (min)", "Farmers Carry (min)", "Lunges (min)", "Wall Ball Sub / Thruster (min)"
  ],

  // Resolve which WORKOUT_LIBRARY key applies for a given day + training week (1-12).
  // Returns null for days with no fixed prescription (existing run/bike, rest).
  resolveSessionKey(day, week) {
    if (!week || week < 1) week = 1;
    if (week <= 4) {
      if (day === "Mon") return "Foundation Strength A";
      if (day === "Wed") return "Engine + Mobility";
      if (day === "Fri") return "Foundation Strength B";
      if (day === "Sat") return week === 1 ? "Grip & Carry Test" : "Easy Long Carry";
      return null;
    } else if (week <= 8) {
      if (day === "Mon") return "Strength A";
      if (day === "Wed") return "Compromised Running";
      if (day === "Fri") return "Strength B";
      if (day === "Sat") return [5, 7].includes(week) ? "Engine Intervals" : "Partial Simulation";
      return null;
    } else {
      if (day === "Mon") return "Strength A";
      if (day === "Wed") return "Compromised Running";
      if (day === "Fri") return "Strength B";
      if (day === "Sat") return [9, 11].includes(week) ? "Full Simulation" : "Engine Intervals";
      return null;
    }
  }
};

// Exercise-level prescriptions per session type. "phaseNote" flags how the
// session changes in Phase 3 (Race Prep) versus how it's written below (Phase 2 numbers).
const WORKOUT_LIBRARY = {
  "Foundation Strength A": {
    duration: "~35 min", rpe: "6–7",
    exercises: [
      { name: "DB Goblet Squat", sets: "3 x 12" },
      { name: "DB Romanian Deadlift", sets: "3 x 12" },
      { name: "Banded Standing Pulldown", sets: "3 x 15/arm", note: "SkiErg pattern groove-in" },
      { name: "DB Walking Lunge", sets: "3 x 10/leg", note: "bodyweight or light DBs" },
      { name: "Farmers Carry", sets: "3 x 30 m", note: "light-moderate, focus on grip and posture" },
      { name: "Plank", sets: "3 x 30 sec" },
      { name: "Bird Dog", sets: "3 x 10/side" }
    ]
  },
  "Foundation Strength B": {
    duration: "~35 min", rpe: "6–7",
    exercises: [
      { name: "DB Floor or Bench Press", sets: "3 x 12" },
      { name: "Bent-Over DB Row", sets: "3 x 12" },
      { name: "DB Thruster", sets: "3 x 12", note: "light-moderate — technique block" },
      { name: "Banded Seated Row", sets: "3 x 15" },
      { name: "Renegade Row", sets: "3 x 8/side" },
      { name: "Side Plank", sets: "3 x 30 sec/side" }
    ]
  },
  "Engine + Mobility": {
    duration: "~30 min",
    exercises: [
      { name: "Easy Zone 2 treadmill or bike", sets: "20 min" },
      { name: "Mobility: hip flexor stretch, thoracic rotation, ankle mobility, banded shoulder dislocates", sets: "10 min" }
    ]
  },
  "Grip & Carry Test": {
    duration: "Week 1 & Week 4",
    note: "Log these — they're your benchmark for Phase 2 load progression.",
    exercises: [
      { name: "Max unbroken Farmers Carry", sets: "distance/time at a weight you can hold with good posture" },
      { name: "Max Plank Hold", sets: "time" },
      { name: "10-rep DB Goblet Squat", sets: "find the weight at RPE 8" }
    ]
  },
  "Easy Long Carry": {
    duration: "20–25 min",
    exercises: [
      { name: "Circuit: Farmers Carry → Walking Lunges → Banded Pulldown → repeat", sets: "continuous, low-moderate effort, build time under tension" }
    ]
  },
  "Strength A": {
    duration: "~40 min", rpe: "7–8",
    phaseNote: "Phase 3 (weeks 9–12): drop to 3 sets, maintain load, lower volume to manage fatigue.",
    exercises: [
      { name: "DB Goblet Squat", sets: "4 x 10", note: "heavier than Phase 1" },
      { name: "DB Romanian Deadlift", sets: "4 x 10" },
      { name: "Banded Sled-Push March", sets: "3 x 30 sec", note: "continuous drive, front rack DBs" },
      { name: "DB Reverse Walking Lunge", sets: "3 x 12/leg" },
      { name: "Farmers Carry", sets: "3 x 40 m", note: "heavier than Phase 1 baseline" },
      { name: "Plank", sets: "3 x 45 sec" }
    ]
  },
  "Strength B": {
    duration: "~40 min", rpe: "7–8",
    phaseNote: "Phase 3 (weeks 9–12): drop to 3 sets, maintain load, lower volume to manage fatigue.",
    exercises: [
      { name: "DB Bench Press or Floor Press", sets: "4 x 10" },
      { name: "Bent-Over DB Row", sets: "4 x 10" },
      { name: "DB Thruster", sets: "4 x 10" },
      { name: "Banded Seated Row", sets: "3 x 15" },
      { name: "DB Front-Rack Walking Lunge", sets: "3 x 12/leg" },
      { name: "Renegade Row", sets: "3 x 10/side" }
    ]
  },
  "Compromised Running": {
    duration: "~35 min",
    phaseNote: "Phase 3 (weeks 9–12): same structure, race-pace effort throughout.",
    exercises: [
      { name: "Run", sets: "5 min" },
      { name: "Burpee Broad Jumps", sets: "90 sec" },
      { name: "Run", sets: "5 min" },
      { name: "Banded Pulldowns", sets: "90 sec" },
      { name: "Run", sets: "5 min" },
      { name: "DB Thrusters", sets: "90 sec" },
      { name: "Run", sets: "5 min" },
      { name: "Farmers Carry", sets: "90 sec" },
      { name: "Run", sets: "5 min, cool down" }
    ]
  },
  "Engine Intervals": {
    duration: "varies",
    note: "Week 10 (Phase 3 taper): shorter version of the same structure.",
    exercises: [
      { name: "Hard Interval", sets: "6–8 x 3 min hard" },
      { name: "Easy Recovery", sets: "2 min easy between rounds", note: "Kickr or treadmill" }
    ]
  },
  "Partial Simulation": {
    duration: "varies",
    note: "A controlled first look at chaining stations together.",
    exercises: [
      { name: "4–5 race stations", sets: "~60% of race load/reps" },
      { name: "Treadmill", sets: "1 km between each station" }
    ]
  },
  "Full Simulation": {
    duration: "race effort",
    note: "Weeks 9 & 11. Log the full station breakdown in the Sims tab afterward.",
    exercises: [
      { name: "All 8 Hyrox stations", sets: "race-pace effort, full prescribed reps/loads" },
      { name: "Treadmill", sets: "1 km between each station" }
    ]
  }
};

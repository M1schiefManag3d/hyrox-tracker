// Training plan reference, sourced from Hyrox - Training Plan.md
const TRAINING_DATA = {
  sessionTypes: [
    "Foundation Strength A", "Foundation Strength B", "Strength A", "Strength B",
    "Engine + Mobility", "Compromised Running", "Engine Intervals",
    "Partial Simulation", "Full Simulation", "Grip & Carry Test",
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
  ]
};

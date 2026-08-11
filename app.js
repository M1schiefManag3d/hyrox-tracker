/* Hyrox Tracker — app logic
   Data model persisted in localStorage under key "hyroxData":
   {
     setup: { bodyweight, maintenance, raceDate },
     workouts: [{id, date, session, completed, rpe, duration, notes}],
     nutrition: [{id, date, calories, protein, carbs, fat, bodyweight, notes}],
     sims: [{id, date, run, skierg, sledPush, sledPull, burpee, row, farmers, lunges, wallball, notes}]
   }
*/

const STORAGE_KEY = "hyroxData";
const DEFAULT_DATA = {
  setup: { bodyweight: 175, maintenance: 2550, raceDate: "" },
  workouts: [],
  nutrition: [],
  sims: []
};

let DATA = loadData();
let fsFileHandle = null; // File System Access API handle, Mac only

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_DATA), ...parsed };
  } catch (e) {
    console.error("loadData failed", e);
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ---------- Navigation ---------- */

const views = ["dashboard", "workouts", "nutrition", "sims", "recipes", "settings"];
const titles = { dashboard: "Dashboard", workouts: "Workouts", nutrition: "Nutrition", sims: "Sim Times", recipes: "Recipes", settings: "Settings" };

function showView(name) {
  views.forEach(v => {
    document.getElementById("view-" + v).classList.toggle("hidden", v !== name);
  });
  document.querySelectorAll(".tabbtn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  document.getElementById("pageTitle").textContent = titles[name];
  if (name === "dashboard") renderDashboard();
  if (name === "workouts") renderWorkouts();
  if (name === "nutrition") renderNutrition();
  if (name === "sims") renderSims();
  if (name === "recipes") renderRecipes(currentRecipeTab);
  if (name === "settings") renderSettings();
}

document.querySelectorAll(".tabbtn").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

/* ---------- Dashboard ---------- */

function proteinTarget() { return Math.round(DATA.setup.bodyweight * 1); }
function calorieTarget() { return Math.round(DATA.setup.maintenance - 350); }

function last7Days(arr, dateKey = "date") {
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  return arr.filter(x => new Date(x[dateKey] + "T00:00:00").getTime() >= cutoff);
}

function currentPhaseAndWeek() {
  // If no race date, just show Phase 1 Week 1 as a default reference.
  if (!DATA.setup.raceDate) return null;
  const race = new Date(DATA.setup.raceDate + "T00:00:00");
  const start = new Date(race);
  start.setDate(start.getDate() - 12 * 7);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (24 * 3600 * 1000));
  const week = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
  const phase = TRAINING_DATA.phases.find(p => p.weeks.includes(week)) || TRAINING_DATA.phases[0];
  return { week, phase, daysToRace: Math.ceil((race - now) / (24 * 3600 * 1000)) };
}

function renderDashboard() {
  const wk = last7Days(DATA.workouts).filter(w => w.completed);
  const nut = last7Days(DATA.nutrition);
  const avgProtein = nut.length ? Math.round(nut.reduce((s, n) => s + (Number(n.protein) || 0), 0) / nut.length) : 0;
  const pt = proteinTarget();
  const pw = currentPhaseAndWeek();

  const cards = [
    { label: "Sessions (7d)", value: wk.length, sub: "completed" },
    { label: "Avg Protein (7d)", value: avgProtein + "g", sub: `target ${pt}g` },
  ];
  if (pw) {
    cards.push({ label: "Race in", value: pw.daysToRace >= 0 ? pw.daysToRace + "d" : "—", sub: pw.daysToRace >= 0 ? "days to go" : "past date" });
    cards.push({ label: "Training Week", value: "Wk " + pw.week, sub: pw.phase.name.replace("Phase " + TRAINING_DATA.phases.indexOf(pw.phase) + 1 + " — ", "") });
  } else {
    cards.push({ label: "Race Date", value: "Not set", sub: "add in Settings" });
    cards.push({ label: "Bodyweight", value: DATA.setup.bodyweight + " lb", sub: "target " + pt + "g protein" });
  }

  document.getElementById("dashCards").innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="label">${c.label}</div>
      <div class="value">${c.value}</div>
      <div class="sub">${c.sub}</div>
    </div>`).join("");

  const phase = pw ? pw.phase : TRAINING_DATA.phases[0];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = dayNames[new Date().getDay()];
  document.getElementById("weekSchedule").innerHTML = Object.entries(phase.week).map(([day, session]) => `
    <div class="week-row ${day === todayName ? 'today' : ''}">
      <span class="day">${day}</span><span>${session}</span>
    </div>`).join("");

  const recentSims = [...DATA.sims].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (recentSims.length === 0) {
    document.getElementById("recentSims").innerHTML = `<p class="hint">No simulations logged yet.</p>`;
  } else {
    document.getElementById("recentSims").innerHTML = `
      <table><thead><tr><th>Date</th><th>Total (min)</th><th>Notes</th></tr></thead>
      <tbody>${recentSims.map(s => `<tr><td>${fmtDate(s.date)}</td><td>${simTotal(s).toFixed(1)}</td><td>${s.notes || ""}</td></tr>`).join("")}</tbody></table>`;
  }
}

function simTotal(s) {
  const keys = ["run", "skierg", "sledPush", "sledPull", "burpee", "row", "farmers", "lunges", "wallball"];
  return keys.reduce((sum, k) => sum + (Number(s[k]) || 0), 0);
}

/* ---------- Workouts ---------- */

function renderWorkouts() {
  const list = [...DATA.workouts].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("workoutList").innerHTML = list.length
    ? list.map(w => `
      <div class="log-item" data-id="${w.id}" data-kind="workout">
        <div class="row1"><span>${w.session}</span><span class="badge ${w.completed ? 'yes' : 'no'}">${w.completed ? 'Done' : 'Skipped'}</span></div>
        <div class="row2"><span>${fmtDate(w.date)}</span><span>${w.rpe ? 'RPE ' + w.rpe : ''} ${w.duration ? '· ' + w.duration + 'm' : ''}</span></div>
        ${w.notes ? `<div class="notes">${w.notes}</div>` : ""}
      </div>`).join("")
    : `<p class="hint">No workouts logged yet. Tap "Log Workout" to add one.</p>`;

  document.querySelectorAll('[data-kind="workout"]').forEach(el => {
    el.addEventListener("click", () => openWorkoutModal(el.dataset.id));
  });
}

document.getElementById("addWorkoutBtn").addEventListener("click", () => openWorkoutModal(null));

function openWorkoutModal(id) {
  const existing = id ? DATA.workouts.find(w => w.id === id) : null;
  const d = existing || { date: todayISO(), session: TRAINING_DATA.sessionTypes[0], completed: true, rpe: "", duration: "", notes: "" };

  document.getElementById("modalTitle").textContent = existing ? "Edit Workout" : "Log Workout";
  document.getElementById("modalBody").innerHTML = `
    <label>Date <input type="date" id="f-date" value="${d.date}"></label>
    <label>Session <select id="f-session">${TRAINING_DATA.sessionTypes.map(s => `<option ${s === d.session ? "selected" : ""}>${s}</option>`).join("")}</select></label>
    <label>Completed?
      <select id="f-completed">
        <option value="true" ${d.completed ? "selected" : ""}>Yes</option>
        <option value="false" ${!d.completed ? "selected" : ""}>No</option>
      </select>
    </label>
    <label>RPE (1-10) <input type="number" id="f-rpe" min="1" max="10" value="${d.rpe}"></label>
    <label>Duration (min) <input type="number" id="f-duration" value="${d.duration}"></label>
    <label>Notes <textarea id="f-notes">${d.notes || ""}</textarea></label>
  `;

  document.getElementById("modalDelete").style.display = existing ? "block" : "none";
  showModal(() => {
    if (!existing) return;
    DATA.workouts = DATA.workouts.filter(w => w.id !== existing.id);
    saveData();
    renderWorkouts();
    closeModal();
  }, () => {
    const record = {
      id: existing ? existing.id : uid(),
      date: document.getElementById("f-date").value || todayISO(),
      session: document.getElementById("f-session").value,
      completed: document.getElementById("f-completed").value === "true",
      rpe: document.getElementById("f-rpe").value,
      duration: document.getElementById("f-duration").value,
      notes: document.getElementById("f-notes").value.trim()
    };
    if (existing) {
      const idx = DATA.workouts.findIndex(w => w.id === existing.id);
      DATA.workouts[idx] = record;
    } else {
      DATA.workouts.push(record);
    }
    saveData();
    renderWorkouts();
    closeModal();
  });
}

/* ---------- Nutrition ---------- */

function renderNutrition() {
  document.getElementById("nutritionTargets").innerHTML = `
    <h2>Targets</h2>
    <div class="row2" style="display:flex;justify-content:space-between;font-size:14px;color:var(--text)">
      <span>Protein: <strong>${proteinTarget()}g</strong></span>
      <span>Calories: <strong>${calorieTarget()}</strong></span>
    </div>
    <p class="hint">Based on ${DATA.setup.bodyweight} lb bodyweight and ${DATA.setup.maintenance} kcal maintenance. Update in Settings.</p>
  `;

  const list = [...DATA.nutrition].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("nutritionList").innerHTML = list.length
    ? list.map(n => `
      <div class="log-item" data-id="${n.id}" data-kind="nutrition">
        <div class="row1"><span>${fmtDate(n.date)}</span><span>${n.calories || 0} kcal</span></div>
        <div class="row2"><span>P ${n.protein || 0}g · C ${n.carbs || 0}g · F ${n.fat || 0}g</span><span>${n.bodyweight ? n.bodyweight + ' lb' : ''}</span></div>
        ${n.notes ? `<div class="notes">${n.notes}</div>` : ""}
      </div>`).join("")
    : `<p class="hint">No nutrition days logged yet.</p>`;

  document.querySelectorAll('[data-kind="nutrition"]').forEach(el => {
    el.addEventListener("click", () => openNutritionModal(el.dataset.id));
  });
}

document.getElementById("addNutritionBtn").addEventListener("click", () => openNutritionModal(null));

function openNutritionModal(id) {
  const existing = id ? DATA.nutrition.find(n => n.id === id) : null;
  const d = existing || { date: todayISO(), calories: "", protein: "", carbs: "", fat: "", bodyweight: DATA.setup.bodyweight, notes: "" };

  document.getElementById("modalTitle").textContent = existing ? "Edit Day" : "Log Day";
  document.getElementById("modalBody").innerHTML = `
    <label>Date <input type="date" id="f-date" value="${d.date}"></label>
    <label>Calories <input type="number" id="f-calories" value="${d.calories}"></label>
    <label>Protein (g) <input type="number" id="f-protein" value="${d.protein}"></label>
    <label>Carbs (g) <input type="number" id="f-carbs" value="${d.carbs}"></label>
    <label>Fat (g) <input type="number" id="f-fat" value="${d.fat}"></label>
    <label>Bodyweight (lb) <input type="number" step="0.1" id="f-bodyweight" value="${d.bodyweight}"></label>
    <label>Notes <textarea id="f-notes">${d.notes || ""}</textarea></label>
  `;

  document.getElementById("modalDelete").style.display = existing ? "block" : "none";
  showModal(() => {
    if (!existing) return;
    DATA.nutrition = DATA.nutrition.filter(n => n.id !== existing.id);
    saveData();
    renderNutrition();
    closeModal();
  }, () => {
    const record = {
      id: existing ? existing.id : uid(),
      date: document.getElementById("f-date").value || todayISO(),
      calories: document.getElementById("f-calories").value,
      protein: document.getElementById("f-protein").value,
      carbs: document.getElementById("f-carbs").value,
      fat: document.getElementById("f-fat").value,
      bodyweight: document.getElementById("f-bodyweight").value,
      notes: document.getElementById("f-notes").value.trim()
    };
    if (existing) {
      const idx = DATA.nutrition.findIndex(n => n.id === existing.id);
      DATA.nutrition[idx] = record;
    } else {
      DATA.nutrition.push(record);
    }
    saveData();
    renderNutrition();
    closeModal();
  });
}

/* ---------- Sim Times ---------- */

function renderSims() {
  const list = [...DATA.sims].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("simList").innerHTML = list.length
    ? list.map(s => `
      <div class="log-item" data-id="${s.id}" data-kind="sim">
        <div class="row1"><span>${fmtDate(s.date)}</span><span>${simTotal(s).toFixed(1)} min total</span></div>
        ${s.notes ? `<div class="notes">${s.notes}</div>` : ""}
      </div>`).join("")
    : `<p class="hint">No simulations logged yet.</p>`;

  document.querySelectorAll('[data-kind="sim"]').forEach(el => {
    el.addEventListener("click", () => openSimModal(el.dataset.id));
  });
}

document.getElementById("addSimBtn").addEventListener("click", () => openSimModal(null));

const simFieldKeys = ["run", "skierg", "sledPush", "sledPull", "burpee", "row", "farmers", "lunges", "wallball"];

function openSimModal(id) {
  const existing = id ? DATA.sims.find(s => s.id === id) : null;
  const d = existing || { date: todayISO(), notes: "" };

  document.getElementById("modalTitle").textContent = existing ? "Edit Simulation" : "Log Simulation";
  const fieldsHtml = TRAINING_DATA.simStations.map((label, i) => {
    const key = simFieldKeys[i];
    return `<label>${label} <input type="number" step="0.1" id="f-${key}" value="${d[key] || ""}"></label>`;
  }).join("");

  document.getElementById("modalBody").innerHTML = `
    <label>Date <input type="date" id="f-date" value="${d.date}"></label>
    ${fieldsHtml}
    <label>Notes <textarea id="f-notes">${d.notes || ""}</textarea></label>
  `;

  document.getElementById("modalDelete").style.display = existing ? "block" : "none";
  showModal(() => {
    if (!existing) return;
    DATA.sims = DATA.sims.filter(s => s.id !== existing.id);
    saveData();
    renderSims();
    closeModal();
  }, () => {
    const record = { id: existing ? existing.id : uid(), date: document.getElementById("f-date").value || todayISO(), notes: document.getElementById("f-notes").value.trim() };
    simFieldKeys.forEach(key => { record[key] = document.getElementById("f-" + key).value; });
    if (existing) {
      const idx = DATA.sims.findIndex(s => s.id === existing.id);
      DATA.sims[idx] = record;
    } else {
      DATA.sims.push(record);
    }
    saveData();
    renderSims();
    closeModal();
  });
}

/* ---------- Recipes ---------- */

let currentRecipeTab = "sauces";

document.querySelectorAll("[data-recipe-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    currentRecipeTab = btn.dataset.recipeTab;
    document.querySelectorAll("[data-recipe-tab]").forEach(b => b.classList.toggle("active", b === btn));
    renderRecipes(currentRecipeTab);
  });
});

function renderRecipes(tab) {
  const el = document.getElementById("recipeContent");
  if (tab === "sauces") {
    el.innerHTML = RECIPE_DATA.sauces.map(s => `
      <div class="recipe-card">
        <h3>${s.name}</h3>
        ${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        <ul>${s.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        <div class="method">${s.method}</div>
        <div class="note">${s.note}</div>
      </div>`).join("");
  } else if (tab === "proteins") {
    el.innerHTML = RECIPE_DATA.proteins.map(p => `
      <div class="recipe-card">
        <h3>${p.name}</h3>
        <div class="method"><strong>Costco:</strong> ${p.costco}</div>
        <div class="method">${p.method}</div>
      </div>`).join("");
  } else if (tab === "breakfasts") {
    el.innerHTML = RECIPE_DATA.breakfasts.map(b => `
      <div class="recipe-card">
        <h3>${b.name} <span class="tag">${b.protein} protein</span></h3>
        <div class="method">${b.method}</div>
      </div>`).join("");
  } else if (tab === "grocery") {
    el.innerHTML = Object.entries(RECIPE_DATA.groceryList).map(([group, items]) => `
      <div class="grocery-group">
        <h4>${group}</h4>
        <ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>`).join("") + `<p class="hint" style="margin-top:14px">${RECIPE_DATA.weeklyRhythm.join(" · ")}</p>`;
  }
}

/* ---------- Settings ---------- */

function renderSettings() {
  document.getElementById("setupWeight").value = DATA.setup.bodyweight;
  document.getElementById("setupMaintenance").value = DATA.setup.maintenance;
  document.getElementById("setupRaceDate").value = DATA.setup.raceDate || "";
  updateSetupCalc();
  document.getElementById("syncStatus").textContent = fsFileHandle ? "Linked to an iCloud file for one-tap sync." : "";
}

function updateSetupCalc() {
  const w = Number(document.getElementById("setupWeight").value) || 0;
  const m = Number(document.getElementById("setupMaintenance").value) || 0;
  document.getElementById("setupCalc").textContent = `Protein target: ${Math.round(w)}g · Calorie target: ${Math.round(m - 350)} kcal`;
}
document.getElementById("setupWeight").addEventListener("input", updateSetupCalc);
document.getElementById("setupMaintenance").addEventListener("input", updateSetupCalc);

document.getElementById("saveSetupBtn").addEventListener("click", () => {
  DATA.setup.bodyweight = Number(document.getElementById("setupWeight").value) || DATA.setup.bodyweight;
  DATA.setup.maintenance = Number(document.getElementById("setupMaintenance").value) || DATA.setup.maintenance;
  DATA.setup.raceDate = document.getElementById("setupRaceDate").value;
  saveData();
  renderSettings();
  document.getElementById("syncStatus").textContent = "Saved.";
});

/* ---------- Modal helpers ---------- */

function showModal(onDelete, onSave) {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("hidden");
  const saveBtn = document.getElementById("modalSave");
  const delBtn = document.getElementById("modalDelete");
  const newSave = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSave, saveBtn);
  newSave.addEventListener("click", onSave);
  const newDel = delBtn.cloneNode(true);
  delBtn.parentNode.replaceChild(newDel, delBtn);
  newDel.style.display = delBtn.style.display;
  newDel.addEventListener("click", onDelete);
}
function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});

/* ---------- Sync: File System Access API (Mac Safari/Chrome) ---------- */

const fsSupported = "showSaveFilePicker" in window;
document.getElementById("fsSaveBtn").style.display = fsSupported ? "block" : "none";
document.getElementById("fsLoadBtn").style.display = fsSupported ? "block" : "none";

document.getElementById("fsSaveBtn").addEventListener("click", async () => {
  try {
    if (!fsFileHandle) {
      fsFileHandle = await window.showSaveFilePicker({
        suggestedName: "hyrox-data.json",
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });
    }
    const writable = await fsFileHandle.createWritable();
    await writable.write(JSON.stringify(DATA, null, 2));
    await writable.close();
    document.getElementById("syncStatus").textContent = "Saved to iCloud file at " + new Date().toLocaleTimeString() + ".";
  } catch (e) {
    if (e.name !== "AbortError") document.getElementById("syncStatus").textContent = "Save failed: " + e.message;
  }
});

document.getElementById("fsLoadBtn").addEventListener("click", async () => {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    });
    fsFileHandle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    DATA = { ...structuredClone(DEFAULT_DATA), ...parsed };
    saveData();
    document.getElementById("syncStatus").textContent = "Loaded from iCloud file. Data refreshed.";
    showView(currentViewName());
  } catch (e) {
    if (e.name !== "AbortError") document.getElementById("syncStatus").textContent = "Load failed: " + e.message;
  }
});

/* ---------- Sync: Export / Import fallback (iOS) ---------- */

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hyrox-data.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  document.getElementById("syncStatus").textContent = "Exported. Use the Share Sheet to save it into your iCloud Health folder.";
});

document.getElementById("importInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    DATA = { ...structuredClone(DEFAULT_DATA), ...parsed };
    saveData();
    document.getElementById("syncStatus").textContent = "Imported. Data refreshed.";
    showView(currentViewName());
  } catch (err) {
    document.getElementById("syncStatus").textContent = "Import failed: " + err.message;
  }
  e.target.value = "";
});

document.getElementById("syncBtn").addEventListener("click", () => showView("settings"));

function currentViewName() {
  return views.find(v => !document.getElementById("view-" + v).classList.contains("hidden")) || "dashboard";
}

/* ---------- Service worker registration ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ---------- Init ---------- */

showView("dashboard");

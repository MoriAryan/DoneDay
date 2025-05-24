const btn = document.getElementById('complete-day-btn');
const DEFAULT_HABITS = ["Drink Water", "Exercise", "Read", "Meditate"];
const wave = document.querySelector(".wave");
const percentageText = document.querySelector(".percentage-text");
const habitList = document.getElementById("habit-list");

// --- Habit & Progress Logic ---
function loadHabits() {
  let habits = JSON.parse(localStorage.getItem("habits"));
  if (!habits || !Array.isArray(habits) || habits.length === 0) {
    habits = [...DEFAULT_HABITS];
    localStorage.setItem("habits", JSON.stringify(habits));
  }
  return habits;
}

function loadProgressData() {
  return JSON.parse(localStorage.getItem("progressData")) || {
    date: new Date().toISOString().slice(0, 10),
    progress: {},
  };
}

function saveProgressData(data) {
  localStorage.setItem("progressData", JSON.stringify(data));
}

// --- Streak Logic ---
function getStreakData() {
  return JSON.parse(localStorage.getItem('streakData') || '{"streak":0,"lastCompleted":""}');
}
function setStreakData(data) {
  localStorage.setItem('streakData', JSON.stringify(data));
}
function updateStreakDisplay(streak) {
  const el = document.getElementById('streak-count');
  if (el) el.textContent = streak;
}

// --- Save Daily Progress for Weekly/Monthly ---
function saveDailyProgress(percent, dateKey) {
  let monthly = JSON.parse(localStorage.getItem("monthlyProgress") || "{}");
  monthly[dateKey] = percent;
  localStorage.setItem("monthlyProgress", JSON.stringify(monthly));

  // Weekly progress (Monday to Sunday)
  let weekly = JSON.parse(localStorage.getItem("weeklyProgress") || "{}");
  const d = new Date(dateKey);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const weekKey = monday.toISOString().slice(0, 10);
  if (!weekly[weekKey]) weekly[weekKey] = {};
  weekly[weekKey][dateKey] = percent;
  localStorage.setItem("weeklyProgress", JSON.stringify(weekly));
}

// --- Streak Update On Day Change ---
function updateStreakOnDayChange() {
  const habits = loadHabits();
  const prevProgressData = JSON.parse(localStorage.getItem("progressData")) || {};
  const prevDate = prevProgressData.date;
  const prevProgress = prevProgressData.progress || {};
  const today = new Date().toISOString().slice(0, 10);

  let data = getStreakData();

  if (prevDate && prevDate !== today) {
    const total = habits.length;
    const done = habits.filter(habit => prevProgress[habit]).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    saveDailyProgress(percent);

    // Calculate yesterday's date string
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (total > 0 && done === total) {
      // All habits completed yesterday
      if (data.lastCompleted === yesterdayStr || !data.lastCompleted) {
        data.streak = (data.streak || 0) + 1;
      } else {
        data.streak = 1;
      }
      data.lastCompleted = prevDate;
    } else {
      // Not all habits completed yesterday
      data.streak = 0;
      data.lastCompleted = prevDate;
    }
    setStreakData(data);
    updateStreakDisplay(data.streak);
  } else {
    updateStreakDisplay(data.streak || 0);
  }
}

function updateWaterLevel() {
  const checkboxes = document.querySelectorAll("#habit-list input[type='checkbox']");
  const total = checkboxes.length;
  const checked = document.querySelectorAll("#habit-list input[type='checkbox']:checked").length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  if (percentageText) percentageText.textContent = `${percent}%`;
  if (wave) {
    const newBottom = -100 + percent;
    wave.style.bottom = `${newBottom}%`;
  }
}

function renderHabits() {
  const habits = loadHabits();
  const { date, progress } = loadProgressData();
  const today = new Date().toISOString().slice(0, 10);

  // If new day → reset progress
  const freshProgress = (date !== today) ? {} : { ...progress };
  if (habitList) habitList.innerHTML = "";

  habits.forEach(habit => {
    // Ensure new habits are unchecked by default
    if (typeof freshProgress[habit] === "undefined") {
      freshProgress[habit] = false;
    }

    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!freshProgress[habit];

    checkbox.addEventListener("change", () => {
      freshProgress[habit] = checkbox.checked;
      saveProgressData({ date: today, progress: freshProgress });
      updateWaterLevel();
    });

    li.appendChild(checkbox);
    li.append(` ${habit}`);
    if (habitList) habitList.appendChild(li);
  });

  // Save today's progress and date
  saveProgressData({ date: today, progress: freshProgress });
  updateWaterLevel();
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
  updateStreakOnDayChange();
  renderHabits();
  updateWaterLevel();
});

// --- Sync habits from other tabs ---
window.addEventListener("storage", function (event) {
  if (event.key === "habits") {
    renderHabits();
    updateWaterLevel();
  }
});

// --- Complete Day Button Logic ---
if (btn) {
  btn.addEventListener('click', function() {
  const habits = loadHabits();
  const total = habits.length;
  const checked = document.querySelectorAll("#habit-list input[type='checkbox']:checked").length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  // Always use today's date
  const today = new Date().toISOString().slice(0, 10);

  // Save today's progress for both weekly and monthly
  saveDailyProgress(percent, today);

  // Save today's progress data for streak logic
  saveProgressData({ date: today, progress: {} });

  // Update streak logic (should use today as the reference)
  updateStreakOnDayChange();

  // Re-render habits for new day
  renderHabits();
  updateWaterLevel();
});
}
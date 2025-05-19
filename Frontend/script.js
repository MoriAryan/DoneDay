const DEFAULT_HABITS = ["Drink Water", "Exercise", "Read", "Meditate"];
const wave = document.querySelector(".wave");
const percentageText = document.querySelector(".percentage-text");
const habitList = document.getElementById("habit-list");

// --- Virtual Day Logic ---
function getVirtualDay() {
  return Number(localStorage.getItem('virtualDay') || 1);
}
function setVirtualDay(day) {
  localStorage.setItem('virtualDay', day);
}

// --- Streak Logic ---
function getStreakData() {
  return JSON.parse(localStorage.getItem('streakData') || '{"streak":0,"lastCompleted":0}');
}
function setStreakData(data) {
  localStorage.setItem('streakData', JSON.stringify(data));
}
function updateStreakDisplay(streak) {
  document.getElementById('streak-count').textContent = streak;
}

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
    date: getVirtualDay(),
    progress: {},
  };
}

function saveProgressData(data) {
  localStorage.setItem("progressData", JSON.stringify(data));
}

// --- Streak Update On Day Change ---
function updateStreakOnDayChange() {
  const habits = loadHabits();
  const prevProgressData = JSON.parse(localStorage.getItem("progressData")) || {};
  const prevDate = prevProgressData.date;
  const prevProgress = prevProgressData.progress || {};
  const today = getVirtualDay();

  let data = getStreakData();

  // Only update streak if the day has changed
  if (prevDate && prevDate !== today) {
    const total = habits.length;
    const done = habits.filter(habit => prevProgress[habit]).length;

    if (total > 0 && done === total) {
      // All habits completed yesterday
      if (data.lastCompleted === prevDate - 1 || data.lastCompleted === 0) {
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
    // No day change, just update display
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
  const today = getVirtualDay();

  // If new day → reset progress
  const freshProgress = (date !== today) ? {} : progress;
  habitList.innerHTML = "";

  habits.forEach(habit => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = freshProgress[habit] || false;

    checkbox.addEventListener("change", () => {
      freshProgress[habit] = checkbox.checked;
      saveProgressData({ date: today, progress: freshProgress });
      updateWaterLevel();
    });

    li.appendChild(checkbox);
    li.append(` ${habit}`);
    habitList.appendChild(li);
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
const wave = document.querySelector(".wave");
const percentageText = document.querySelector(".percentage-text");
const habitList = document.getElementById("habit-list");

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g., "2025-05-17"
}

function loadHabits() {
  return JSON.parse(localStorage.getItem("habits")) || [];
}

function loadProgressData() {
  return JSON.parse(localStorage.getItem("progressData")) || {
    date: getTodayDate(),
    progress: {},
  };
}

function saveProgressData(data) {
  localStorage.setItem("progressData", JSON.stringify(data));
}

function updateWaterLevel() {
  const checkboxes = document.querySelectorAll("#habit-list input[type='checkbox']");
  const total = checkboxes.length;
  const checked = document.querySelectorAll("#habit-list input[type='checkbox']:checked").length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  percentageText.textContent = `${percent}%`;
  const newBottom = -100 + percent;
  wave.style.bottom = `${newBottom}%`;
}

function renderHabits() {
  const habits = loadHabits();
  const { date, progress } = loadProgressData();
  const today = getTodayDate();

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

// Refresh from other tabs
window.addEventListener("storage", function (event) {
  if (event.key === "habits") {
    renderHabits();
  }
});

// When returning from edit page
if (localStorage.getItem("habitsUpdated") === "true") {
  localStorage.removeItem("habitsUpdated");

  const { date, progress } = loadProgressData();
  const habits = loadHabits();
  const updatedProgress = {};

  // Only keep progress of habits that still exist
  habits.forEach(habit => {
    updatedProgress[habit] = progress.hasOwnProperty(habit) ? progress[habit] : false;
  });

  saveProgressData({ date: date, progress: updatedProgress });
  renderHabits();
} else {
  renderHabits();
}


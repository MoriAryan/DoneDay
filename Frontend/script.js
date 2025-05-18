const wave = document.querySelector(".wave");
const percentageText = document.querySelector(".percentage-text");
const habitList = document.getElementById("habit-list");

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g., "2025-05-17"
}

async function loadHabits() {
  try {
    const res = await fetch("/api/habits");
    return await res.json();
  } catch {
    return [];
  }
}

async function loadProgressData() {
  try {
    const res = await fetch(`/api/progress?date=${getTodayDate()}`);
    return await res.json();
  } catch {
    return {
      date: getTodayDate(),
      progress: {},
    };
  }
}

async function saveProgressData(data) {
  await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
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

async function renderHabits() {
  const habits = await loadHabits();
  const { date, progress } = await loadProgressData();
  const today = getTodayDate();

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

  saveProgressData({ date: today, progress: freshProgress });
  updateWaterLevel();
}

window.addEventListener("storage", function (event) {
  if (event.key === "habits") {
    renderHabits();
  }
});
window.addEventListener("beforeunload", () => {
  // Save progress before leaving page
  const checkboxes = document.querySelectorAll("#habit-list input[type='checkbox']");
  const freshProgress = {};
  checkboxes.forEach(checkbox => {
    const habit = checkbox.nextSibling.textContent.trim();
    freshProgress[habit] = checkbox.checked;
  });
  saveProgressData({ date: getTodayDate(), progress: freshProgress });
});

renderHabits();

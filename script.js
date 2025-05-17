
    const checkboxes = document.querySelectorAll(".habit-list input[type='checkbox']");
const wave = document.querySelector(".wave");
const percentageText = document.querySelector(".percentage-text");

function updateWaterLevel() {
  const total = checkboxes.length;
  const checked = document.querySelectorAll(".habit-list input[type='checkbox']:checked").length;
  const percent = Math.round((checked / total) * 100);

  // Update text
  percentageText.textContent = `${percent}%`;

  // Update wave height (0% => -100%, 100% => 0%)
  const newBottom = -100 + percent;
  wave.style.bottom = `${newBottom}%`;
}

// Event listener for all checkboxes
checkboxes.forEach(cb => cb.addEventListener("change", updateWaterLevel));

// Initial update on page load
updateWaterLevel();


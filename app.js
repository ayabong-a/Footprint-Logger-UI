const ACTIVITIES = {
  transport: {
    car: { label: "Car travel (km)", co2: 0.21 },
    bus: { label: "Bus travel (km)", co2: 0.1 },
    train: { label: "Train travel (km)", co2: 0.05 },
    flight: { label: "Short-haul flight (km)", co2: 0.15 }
  },
  food: {
    meat: { label: "Meat-based meal", co2: 2.5 },
    dairy: { label: "Dairy-heavy meal", co2: 1.8 },
    plant: { label: "Plant-based meal", co2: 0.8 },
    processed: { label: "Processed food meal", co2: 1.2 }
  },
  energy: {
    electricity: { label: "Electricity use (kWh)", co2: 0.92 },
    gas: { label: "Gas heating (hour)", co2: 2.0 },
    ac: { label: "Air conditioning (hour)", co2: 1.5 },
    water: { label: "Hot water use (hour)", co2: 1.0 }
  }
};

let data = JSON.parse(localStorage.getItem("footprint")) || [];

// DOM elements
const categorySelect = document.getElementById("category");
const activitySelect = document.getElementById("activity");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");
const filterSelect = document.getElementById("filter");
const activitiesDiv = document.getElementById("activities");
const totalSpan = document.getElementById("total");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

// Init
function init() {
  populateCategories();
  updateActivities();
  renderActivities();
}

function populateCategories() {
  Object.keys(ACTIVITIES).forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

function updateActivities() {
  const category = categorySelect.value;
  activitySelect.innerHTML = "";

  Object.values(ACTIVITIES[category]).forEach(activity => {
    const option = document.createElement("option");
    option.value = activity.label;
    option.textContent = activity.label;
    activitySelect.appendChild(option);
  });
}

function addActivity() {
  const category = categorySelect.value;
  const activityLabel = activitySelect.value;
  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const activity = Object.values(ACTIVITIES[category])
    .find(a => a.label === activityLabel);

  const co2 = activity.co2 * amount;

  data.push({ category, activity: activityLabel, co2 });
  localStorage.setItem("footprint", JSON.stringify(data));

  amountInput.value = "";
  renderActivities();
}

function renderActivities() {
  const filter = filterSelect.value;
  activitiesDiv.innerHTML = "";

  const filtered = filter === "all"
    ? data
    : data.filter(item => item.category === filter);

  let total = 0;

  if (filtered.length === 0) {
    activitiesDiv.innerHTML = "<div class='muted'>No activities to display.</div>";
  }

  filtered.forEach(item => {
    total += item.co2;
    const div = document.createElement("div");
    div.className = "activity";
    div.innerHTML = `
      <span>${item.activity}</span>
      <strong>${item.co2.toFixed(2)} kg</strong>
    `;
    activitiesDiv.appendChild(div);
  });

  totalSpan.textContent = total.toFixed(2);
  drawChart();
}

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const totals = { transport: 0, food: 0, energy: 0 };

  data.forEach(item => {
    totals[item.category] += item.co2;
  });

  const categories = Object.keys(totals);
  const values = Object.values(totals);
  const max = Math.max(...values, 1);

  categories.forEach((cat, i) => {
    const barHeight = (values[i] / max) * 160;
    const x = 120 * i + 100;
    const y = 200 - barHeight;

    ctx.fillStyle = "#66bb6a";
    ctx.fillRect(x, y, 50, barHeight);

    ctx.fillStyle = "#2c3e50";
    ctx.fillText(cat, x - 5, 220);
    ctx.fillText(values[i].toFixed(1) + " kg", x - 10, y - 8);
  });
}

// Event listeners
categorySelect.addEventListener("change", updateActivities);
addBtn.addEventListener("click", addActivity);
filterSelect.addEventListener("change", renderActivities);

init();
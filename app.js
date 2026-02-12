const API = process.env.API;

const welcome = document.getElementById("welcome");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
} else if (user) {
  welcome.textContent = `Logged in as ${user.email}`;
}

async function validateSession() {
  const res = await fetch(`${API}/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

validateSession();

const ACTIVITIES = {
  transport: {
    car: { label: "Car travel (km)", co2: 0.21 },
    bus: { label: "Bus travel (km)", co2: 0.1 },
    train: { label: "Train travel (km)", co2: 0.05 },
    flight: { label: "Short-haul flight (km)", co2: 0.15 },
  },
  food: {
    meat: { label: "Meat-based meal", co2: 2.5 },
    dairy: { label: "Dairy-heavy meal", co2: 1.8 },
    plant: { label: "Plant-based meal", co2: 0.8 },
    processed: { label: "Processed food meal", co2: 1.2 },
  },
  energy: {
    electricity: { label: "Electricity use (kWh)", co2: 0.92 },
    gas: { label: "Gas heating (hour)", co2: 2.0 },
    ac: { label: "Air conditioning (hour)", co2: 1.5 },
    water: { label: "Hot water use (hour)", co2: 1.0 },
  },
};

let data = [];

async function loadActivities() {
  const res = await fetch(`${API}/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  renderActivities();
}

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
  loadActivities();
  loadCommunityAverage();
  loadLeaderboard();
  loadWeeklySummary();
}

function populateCategories() {
  Object.keys(ACTIVITIES).forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

function updateActivities() {
  const category = categorySelect.value;
  activitySelect.innerHTML = "";

  Object.values(ACTIVITIES[category]).forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity.label;
    option.textContent = activity.label;
    activitySelect.appendChild(option);
  });
}

async function addActivity() {
  const category = categorySelect.value;
  const activityLabel = activitySelect.value;
  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const activity = Object.values(ACTIVITIES[category]).find(
    (a) => a.label === activityLabel,
  );

  const unitCo2 = activity.co2;
  const co2 = unitCo2 * amount;

  await fetch(`${API}/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category,
      activity: activityLabel,
      amount,
      unitCo2
    }),
  });

  amountInput.value = "";
  loadActivities();
  loadCommunityAverage();
  loadLeaderboard();
  loadWeeklySummary();
}

function renderActivities() {
  const filter = filterSelect.value;
  activitiesDiv.innerHTML = "";

  const filtered =
    filter === "all" ? data : data.filter((item) => item.category === filter);

  let total = 0;

  if (filtered.length === 0) {
    activitiesDiv.innerHTML =
      "<div class='muted'>No activities to display.</div>";
  }

  filtered.forEach((item) => {
    total += item.co2;

    const div = document.createElement("div");
    div.className = "activity";

    div.innerHTML = `
    <div>
      <strong>${item.activity}</strong>
      <div class="muted small">${item.co2.toFixed(2)} kg</div>
    </div>
    <div class="activity-actions">
      <button class="edit-btn" data-id="${item._id}">Edit</button>
      <button class="delete-btn" data-id="${item._id}">Delete</button>
    </div>
  `;

    activitiesDiv.appendChild(div);
  })
  ;

  totalSpan.textContent = total.toFixed(2);
  drawChart();
}

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const totals = { transport: 0, food: 0, energy: 0 };

  data.forEach((item) => {
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

async function loadCommunityAverage() {
  const res = await fetch(`${API}/stats/community-average`);
  const data = await res.json();
  document.getElementById("communityAvg").textContent = data.avg
    ? data.avg.toFixed(2)
    : "0";
}

async function loadLeaderboard() {
  const res = await fetch(`${API}/stats/leaderboard`);
  const data = await res.json();

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<li class='muted'>No data yet</li>";
    return;
  }

  data.forEach((user, index) => {
    const li = document.createElement("li");
    li.textContent = `User ${index + 1}: ${user.total.toFixed(2)} kg`;
    list.appendChild(li);
  });
}

async function loadWeeklySummary() {
  const res = await fetch(`${API}/stats/weekly-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  document.getElementById("weeklyTotal").textContent =
    data.weeklyTotal.toFixed(2);
  document.getElementById("streak").textContent = data.streak;
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
};

// Event listeners
categorySelect.addEventListener("change", updateActivities);
addBtn.addEventListener("click", addActivity);
filterSelect.addEventListener("change", renderActivities);
activitiesDiv.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this activity?")) return;

    await fetch(`http://localhost:5000/api/activities/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    loadActivities(); // reload from backend
  }

  if (e.target.classList.contains("edit-btn")) {
    const newAmount = prompt("Enter new amount:");

    if (!newAmount || isNaN(newAmount)) return;

    await fetch(`http://localhost:5000/api/activities/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ amount: Number(newAmount) })
    });

    loadActivities();
  }
});


init();

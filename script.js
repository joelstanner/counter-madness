let digits = {
  digit1: 0,
  digit2: 0,
  digit3: 0
};

let matchCount = 0;
let running = true;
let timers = {};

const matchHistory = {
  "000": 0, "111": 0, "222": 0, "333": 0, "444": 0,
  "555": 0, "666": 0, "777": 0, "888": 0, "999": 0
};

const matchSound = document.getElementById("match-sound");

// Load saved state from localStorage
function loadState() {
  const savedCount = localStorage.getItem("matchCount");
  const savedHistory = localStorage.getItem("matchHistory");
  if (savedCount) matchCount = parseInt(savedCount);
  if (savedHistory) {
    const parsed = JSON.parse(savedHistory);
    Object.keys(matchHistory).forEach(key => {
      if (parsed[key] !== undefined) matchHistory[key] = parsed[key];
    });
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("matchCount", matchCount);
  localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
}

function renderMatchHistory() {
  const listEl = document.getElementById("match-list");
  listEl.innerHTML = "";

  const topValue = Math.max(...Object.values(matchHistory));
  const topKeys = Object.keys(matchHistory).filter(key => matchHistory[key] === topValue);

  Object.entries(matchHistory).forEach(([key, count]) => {
    const div = document.createElement("div");
    div.className = "match-item";
    div.textContent = `${key} → ${count}`;

    if (topKeys.includes(key) && count > 0) {
      div.classList.add("top-match");
    }

    div.id = `match-${key}`;
    listEl.appendChild(div);
  });
}

function updateMatchCounter() {
  const values = Object.values(digits);
  if (values.every(val => val === values[0])) {
    const matchKey = `${values[0]}${values[0]}${values[0]}`;
    matchCount++;
    document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;

    if (matchHistory[matchKey] !== undefined) {
      matchHistory[matchKey]++;
      saveState(); // persist
      renderMatchHistory();

      const flashEl = document.getElementById(`match-${matchKey}`);
      if (flashEl) {
        flashEl.classList.add("flash");
        setTimeout(() => flashEl.classList.remove("flash"), 1000);
      }
    }

    document.body.classList.remove("flash");
    void document.body.offsetWidth;
    document.body.classList.add("flash");

    // 🎉 Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 🔔 Sound
    matchSound.currentTime = 0;
    matchSound.play();
  }
}

function startDigitLoop(id, minSpeed, maxSpeed) {
  const el = document.getElementById(id);

  function loop() {
    if (!running) return;

    digits[id] = (digits[id] + 1) % 10;
    el.textContent = digits[id];
    updateMatchCounter();

    const delay = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
    timers[id] = setTimeout(loop, delay);
  }

  loop();
}

function startAll() {
  running = true;
  startDigitLoop("digit1", 50, 800);
  startDigitLoop("digit2", 50, 700);
  startDigitLoop("digit3", 50, 600);
  document.getElementById("toggle-button").textContent = "Stop";
}

function stopAll() {
  running = false;
  Object.values(timers).forEach(clearTimeout);
  document.getElementById("toggle-button").textContent = "Start";
}

document.getElementById("toggle-button").addEventListener("click", () => {
  running ? stopAll() : startAll();
});

document.getElementById("reset-button").addEventListener("click", () => {
  if (!confirm("Reset all match data?")) return;

  matchCount = 0;
  Object.keys(matchHistory).forEach(key => (matchHistory[key] = 0));
  localStorage.clear();
  renderMatchHistory();
  document.getElementById("match-counter").textContent = `Matches: 0`;
});

// Initialize app
loadState();
renderMatchHistory();
document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;
startAll();

// Initial state
let digits = {
  digit1: 0,
  digit2: 0,
  digit3: 0
};

let matchCount = 0;
let running = true;
let timers = {}; // Holds active timer IDs

// Match tracking object
const matchHistory = {
  "000": 0,
  "111": 0,
  "222": 0,
  "333": 0,
  "444": 0,
  "555": 0,
  "666": 0,
  "777": 0,
  "888": 0,
  "999": 0
};

// Render match history to the DOM
function renderMatchHistory() {
  const listEl = document.getElementById("match-list");
  listEl.innerHTML = "";

  const topValue = Math.max(...Object.values(matchHistory));
  const topKeys = Object.keys(matchHistory).filter(key => matchHistory[key] === topValue);

  Object.entries(matchHistory).forEach(([key, count]) => {
    const div = document.createElement("div");
    div.className = "match-item";
    div.textContent = `${key} → ${count}`;

    // Highlight top match
    if (topKeys.includes(key) && count > 0) {
      div.classList.add("top-match");
    }

    div.id = `match-${key}`;
    listEl.appendChild(div);
  });
}

// Called on every digit update to check for match and trigger effects
function updateMatchCounter() {
  const values = Object.values(digits);

  if (values.every(val => val === values[0])) {
    const matchKey = `${values[0]}${values[0]}${values[0]}`;
    matchCount++;
    document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;

    // Update match history and animate flash
    if (matchHistory[matchKey] !== undefined) {
      matchHistory[matchKey]++;
      renderMatchHistory();

      const flashEl = document.getElementById(`match-${matchKey}`);
      if (flashEl) {
        flashEl.classList.add("flash");
        setTimeout(() => flashEl.classList.remove("flash"), 1000);
      }
    }

    // Flash screen background
    document.body.classList.remove("flash");
    void document.body.offsetWidth; // trigger reflow
    document.body.classList.add("flash");

    // Launch confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// Main digit loop with variable timing
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

// Starts all digit counters
function startAll() {
  running = true;
  startDigitLoop("digit1", 50, 800);
  startDigitLoop("digit2", 50, 700);
  startDigitLoop("digit3", 50, 600);
  document.getElementById("toggle-button").textContent = "Stop";
}

// Stops all digit counters
function stopAll() {
  running = false;
  Object.values(timers).forEach(clearTimeout);
  document.getElementById("toggle-button").textContent = "Start";
}

// Handle start/stop button
document.getElementById("toggle-button").addEventListener("click", () => {
  running ? stopAll() : startAll();
});

// Initialize
renderMatchHistory();
startAll();

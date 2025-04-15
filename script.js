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

let running = true;
let timers = {};

function renderMatchHistory(highlightKey) {
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

    if (key === highlightKey) {
      div.classList.add("flash");
    }

    listEl.appendChild(div);
  });
}

let digits = {
  digit1: 0,
  digit2: 0,
  digit3: 0
};

let matchCount = 0;

function updateMatchCounter() {
  const values = Object.values(digits);
  if (values.every((val) => val === values[0])) {
    const matchKey = `${values[0]}${values[0]}${values[0]}`;

    matchCount++;
    document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;

    // Increment the matchHistory counter and re-render list
    if (matchHistory[matchKey] !== undefined) {
      matchHistory[matchKey]++;
      renderMatchHistory(matchKey);
    }

    // Trigger flash animation
    document.body.classList.remove("flash");
    void document.body.offsetWidth;
    document.body.classList.add("flash");

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function startRandomSpeedCounter(id, minSpeed, maxSpeed) {
  const el = document.getElementById(id);
  let digit = 0;

  function updateDigit() {
    if (!running) return;

    digit = (digit + 1) % 10;
    el.textContent = digit;
    digits[id] = digit;
    updateMatchCounter();

    const nextDelay = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
    timers[id] = setTimeout(updateDigit, nextDelay);
  }

  updateDigit();
}


// Start the counters
startRandomSpeedCounter("digit1", 50, 800);
startRandomSpeedCounter("digit2", 50, 700);
startRandomSpeedCounter("digit3", 50, 600);

document.getElementById("toggle-button").addEventListener("click", () => {
  running = !running;

  if (running) {
    // Restart all timers
    startRandomSpeedCounter("digit1", 50, 800);
    startRandomSpeedCounter("digit2", 50, 700);
    startRandomSpeedCounter("digit3", 50, 600);
    document.getElementById("toggle-button").textContent = "Stop";
  } else {
    // Stop all timers
    Object.values(timers).forEach(clearTimeout);
    document.getElementById("toggle-button").textContent = "Start";
  }
});


renderMatchHistory(); // Show initial 0s for all matches

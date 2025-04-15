let digits = {
  digit1: 0,
  digit2: 0,
  digit3: 0
};

let matchCount = 0;
let running = true;
let timers = {};  // To hold timer IDs

const matchHistory = {
  "000": 0, "111": 0, "222": 0, "333": 0, "444": 0,
  "555": 0, "666": 0, "777": 0, "888": 0, "999": 0
};

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
  if (values.every((val) => val === values[0])) {
    const matchKey = `${values[0]}${values[0]}${values[0]}`;
    matchCount++;
    document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;
    
    if (matchHistory[matchKey] !== undefined) {
      matchHistory[matchKey]++;
      renderMatchHistory();
    
      // Flash highlight on the current match item
      const flashEl = document.getElementById(`match-${matchKey}`);
      if (flashEl) {
        flashEl.classList.add("flash");
        setTimeout(() => flashEl.classList.remove("flash"), 1000);
      }
    }

  document.body.classList.remove("flash");
  void document.body.offsetWidth;
  document.body.classList.add("flash");
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
  if (running) {
    stopAll();
  } else {
    startAll();
  }
});

renderMatchHistory();
startAll();  // initial start

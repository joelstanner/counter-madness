let digits = {
  digit1: 0,
  digit2: 0,
  digit3: 0
};

let matchCount = 0;
let running = true;
let timers = {};

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

function activateDevilMode() {
  digits = { digit1: 6, digit2: 6, digit3: 6 };
  updateMatchCounter();

  // Play devil sound
  const sound = document.getElementById("devil-sound");
  if (sound) {
    sound.volume = 0.5; // 50% volume
    sound.play();
  }
    
  // Show blinking message
  const msg = document.getElementById("devil-mode-msg");
  if (msg) {
    msg.style.display = "block";
    setTimeout(() => {
      msg.style.display = "none";
    }, 4000);
  }

  // Show devil emoji + shake
  const devil = document.getElementById("devil-alert");
  if (devil) {
    devil.style.display = "block";
    devil.classList.add("flash");
    
    setTimeout(() => {
      devil.classList.remove("flash");
      devil.classList.add("fade-out");
    }, 3000);
    
    setTimeout(() => {
      devil.classList.remove("fade-out");
      devil.style.display = "none";
    }, 5000);
  }

  document.body.classList.add("shake");
  setTimeout(() => {
    document.body.classList.remove("shake");
    if (devil) {
      devil.classList.remove("flash");
      devil.style.display = "none";
    }
  }, 5000);

  console.log("😈 Devil mode triggered from 666 leaderboard tap");
}

function renderMatchHistory() {
  const listEl = document.getElementById("match-list");
  listEl.innerHTML = "";

  const topValue = Math.max(...Object.values(matchHistory));
  const topKeys = Object.keys(matchHistory).filter(
    (key) => matchHistory[key] === topValue
  );

  Object.entries(matchHistory).forEach(([key, count]) => {
    const div = document.createElement("div");
    div.className = "match-item";
    div.textContent = `${key} → ${count}`;
    div.id = `match-${key}`;

    if (topKeys.includes(key) && count > 0) {
      div.classList.add("top-match");
    }

    listEl.appendChild(div);
  });
}

function attachDevilTapListener() {
  const cheatBox = document.getElementById("match-666");
  if (!cheatBox) return;

  cheatBox.style.cursor = "default";

  let tapCount = 0;
  let tapTimer;

  cheatBox.addEventListener("click", () => {
    tapCount++;

    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, 1000); // Reset after 1s

    if (tapCount === 6) {
      activateDevilMode();
      tapCount = 0;
    }
  });
}


function updateMatchCounter() {
  const values = Object.values(digits);
  if (values.every((val) => val === values[0])) {
    const matchKey = `${values[0]}${values[0]}${values[0]}`;
    matchCount++;
    document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;

    if (matchKey === "666") {
      const devil = document.getElementById("devil-alert");
      devil.style.display = "block";
      devil.classList.add("flash");

      // Shake screen
      document.body.classList.add("shake");
      setTimeout(() => {
        document.body.classList.remove("shake");
      }, 500);

      // Optional: hide it again after a few seconds
      setTimeout(() => {
        devil.classList.remove("flash");
        devil.style.display = "none";
      }, 5000);

    }

    // Update "Last Match"
    const lastMatchEl = document.getElementById("last-match");
    lastMatchEl.textContent = `Last Match: ${matchKey}`;
    lastMatchEl.classList.remove("flash");
    void lastMatchEl.offsetWidth;
    lastMatchEl.classList.add("flash");

    if (matchHistory[matchKey] !== undefined) {
      matchHistory[matchKey]++;
      renderMatchHistory();
      attachDevilTapListener();

      const flashEl = document.getElementById(`match-${matchKey}`);
      if (flashEl) {
        flashEl.classList.add("flash");
        setTimeout(() => flashEl.classList.remove("flash"), 1000);
      }
    }

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

// Button event listeners
document.getElementById("toggle-button").addEventListener("click", () => {
  running ? stopAll() : startAll();
});

document.getElementById("reset-button").addEventListener("click", () => {
  if (!confirm("Reset all match data?")) return;

  matchCount = 0;
  Object.keys(matchHistory).forEach((key) => (matchHistory[key] = 0));
  Object.keys(digits).forEach((id) => {
    digits[id] = 0;
    document.getElementById(id).textContent = "0";
  });

  renderMatchHistory();
  document.getElementById("match-counter").textContent = `Matches: 0`;

  const lastMatchEl = document.getElementById("last-match");
  lastMatchEl.textContent = "Last Match: —";
});

// Initialize app
renderMatchHistory();
document.getElementById("match-counter").textContent = `Matches: ${matchCount}`;
attachDevilTapListener();
startAll();

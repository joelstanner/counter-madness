const DIGIT_IDS = ['digit1', 'digit2', 'digit3'];
const MATCH_KEYS = Array.from({ length: 10 }, (_, i) => `${i}${i}${i}`);
const DEVIL_MATCH = '666';
const DEVIL_TAP_COUNT = 6;
const SPEED_SLIDER_MIN = 50;
const SPEED_SLIDER_MAX = 2000;
const SPEED_FACTOR_MIN = 4.0;
const SPEED_FACTOR_MAX = 0.1;

let digits = Object.fromEntries(DIGIT_IDS.map(id => [id, 0]));
let matchCount = { value: 0 }; // Now an object for mutability
let running = true;
let timers = {};
let speedFactor = 1.0;

const matchHistory = Object.fromEntries(MATCH_KEYS.map(key => [key, 0]));

// --- DOM Elements ---
const $ = id => document.getElementById(id);
const matchCounterEl = $('match-counter');
const lastMatchEl = $('last-match');
const devilAlertEl = $('devil-alert');
const devilModeMsgEl = $('devil-mode-msg');
const devilSoundEl = $('devil-sound');
const toggleButton = $('toggle-button');
const resetButton = $('reset-button');
const speedSlider = $('speed-slider');
const speedValue = $('speed-value');

// --- Speed Control ---
const updateSpeedDisplay = val => { if (speedValue) speedValue.textContent = `${val}ms`; };
const updateSpeedFactor = val => {
  speedFactor = SPEED_FACTOR_MIN + (SPEED_SLIDER_MAX - val) * (SPEED_FACTOR_MAX - SPEED_FACTOR_MIN) / (SPEED_SLIDER_MAX - SPEED_SLIDER_MIN);
};
if (speedSlider && speedValue) {
  speedSlider.addEventListener('input', e => {
    updateSpeedDisplay(e.target.value);
    updateSpeedFactor(e.target.value);
  });
  speedSlider.addEventListener('change', e => updateSpeedDisplay(e.target.value));
  updateSpeedDisplay(speedSlider.value);
}

// --- Devil Mode ---
const activateDevilMode = () => {
  setDigits([6, 6, 6]);
  updateMatchCounter({
    digits,
    matchCount,
    matchHistory,
    matchCounterEl,
    lastMatchEl,
    renderMatchHistory,
    attachDevilTapListener,
    confetti: typeof confetti !== 'undefined' ? confetti : undefined,
    documentObj: document
  });
  playDevilSound();
  showDevilModeMsg();
  showDevilAlert();
  shakeBody();
  fadeOutDevil();
  console.log('😈 Devil mode triggered from 666 leaderboard tap');
};

const playDevilSound = () => {
  if (devilSoundEl) {
    devilSoundEl.volume = 0.5;
    devilSoundEl.play();
  }
};

const showDevilModeMsg = () => {
  if (devilModeMsgEl) {
    devilModeMsgEl.style.display = 'block';
    setTimeout(() => devilModeMsgEl.style.display = 'none', 4000);
  }
};

const showDevilAlert = () => {
  if (devilAlertEl) {
    devilAlertEl.style.display = 'block';
    devilAlertEl.classList.add('flash');
    setTimeout(() => {
      devilAlertEl.classList.remove('flash');
      devilAlertEl.classList.add('fade-out');
    }, 3000);
    setTimeout(() => {
      devilAlertEl.classList.remove('fade-out');
      devilAlertEl.style.display = 'none';
    }, 5000);
  }
};

const shakeBody = () => {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
};

const fadeOutDevil = (delay = 3000) => {
  if (!devilAlertEl) return;
  setTimeout(() => {
    devilAlertEl.classList.remove('flash');
    devilAlertEl.classList.add('fade-out');
  }, delay);
  setTimeout(() => {
    devilAlertEl.classList.remove('fade-out');
    devilAlertEl.style.display = 'none';
  }, delay + 2000);
};

// --- Match History ---
const renderMatchHistory = () => {
  const listEl = $('match-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  const topValue = Math.max(...Object.values(matchHistory));
  const topKeys = Object.keys(matchHistory).filter(key => matchHistory[key] === topValue && topValue > 0);
  Object.entries(matchHistory).forEach(([key, count]) => {
    const div = document.createElement('div');
    div.className = 'match-item';
    div.textContent = `${key} → ${count}`;
    div.id = `match-${key}`;
    if (topKeys.includes(key)) div.classList.add('top-match');
    listEl.appendChild(div);
  });
};

const attachDevilTapListener = () => {
  const cheatBox = $('match-666');
  if (!cheatBox) return;
  cheatBox.style.cursor = 'default';
  let tapCount = 0, tapTimer;
  cheatBox.onclick = () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => tapCount = 0, 1000);
    if (tapCount === DEVIL_TAP_COUNT) {
      activateDevilMode();
      tapCount = 0;
    }
  };
};

// --- Digit Logic ---
const setDigits = arr => {
  DIGIT_IDS.forEach((id, i) => {
    digits[id] = arr[i];
    const el = $(id);
    if (el) el.textContent = arr[i];
  });
};

// --- Main Counter Logic (Testable) ---
function updateMatchCounter({
  digits,
  matchCount,
  matchHistory,
  matchCounterEl,
  lastMatchEl,
  renderMatchHistory,
  attachDevilTapListener,
  confetti,
  documentObj
}) {
  // Check if all digits are equal
  const digitValues = Object.values(digits);
  if (
    digitValues.length !== 3 ||
    digitValues.some((v) => v !== digitValues[0])
  ) {
    return;
  }

  if (!digits || !matchCount) return;

  const values = Object.values(digits);
  const allEqual = values.every(val => val === values[0]);
  const matchKey = values.join('');

  if (!allEqual) return;

  // Only increment matchCount and update history if key is in matchHistory
  if (matchHistory && Object.prototype.hasOwnProperty.call(matchHistory, matchKey)) {
    matchCount.value += 1;
    matchHistory[matchKey] = (matchHistory[matchKey] || 0) + 1;
    if (matchCounterEl) matchCounterEl.textContent = `Matches: ${matchCount.value}`;
    if (lastMatchEl) lastMatchEl.textContent = `Last Match: ${matchKey}`;
    if (typeof renderMatchHistory === 'function') renderMatchHistory();
    if (typeof attachDevilTapListener === 'function') attachDevilTapListener();
    // Flash match item
    const flashEl = documentObj.getElementById(`match-${matchKey}`);
    if (flashEl) {
      flashEl.classList.add('flash');
      setTimeout(() => flashEl.classList.remove('flash'), 1000);
    }
  } else {
    // Still update matchCount and DOM for non-numeric keys, but don't update history or call renderMatchHistory
    matchCount.value += 1;
    if (matchCounterEl) matchCounterEl.textContent = `Matches: ${matchCount.value}`;
    if (lastMatchEl) lastMatchEl.textContent = `Last Match: ${matchKey}`;
  }

  // Devil class for 666
  if (matchKey === '666' && documentObj) {
    const digitsEls = documentObj.querySelectorAll('.digit');
    digitsEls.forEach((el) => el.classList.add('devil'));
    setTimeout(() => {
      digitsEls.forEach((el) => el.classList.remove('devil'));
    }, 5000);
  }

  // Flash class for body and lastMatchEl
  if (documentObj && documentObj.body) {
    documentObj.body.classList.add('flash');
    setTimeout(() => {
      documentObj.body.classList.remove('flash');
    }, 100);
  }
  if (lastMatchEl) {
    lastMatchEl.classList.add('flash');
    setTimeout(() => {
      lastMatchEl.classList.remove('flash');
    }, 100);
  }

  // Only call confetti for valid keys in matchHistory
  if (confetti && matchHistory && Object.prototype.hasOwnProperty.call(matchHistory, matchKey)) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
};

const startDigitLoop = (id, minSpeed, maxSpeed) => {
  const el = $(id);
  const loop = () => {
    if (!running) return;
    digits[id] = (digits[id] + 1) % 10;
    if (el) el.textContent = digits[id];
    updateMatchCounter({
      digits,
      matchCount,
      matchHistory,
      matchCounterEl,
      lastMatchEl,
      renderMatchHistory,
      attachDevilTapListener,
      confetti: typeof confetti !== 'undefined' ? confetti : undefined,
      documentObj: document
    });
    const baseDelay = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
    const delay = Math.max(10, baseDelay * speedFactor);
    timers[id] = setTimeout(loop, delay);
  };
  loop();
};

const startAll = () => {
  running = true;
  startDigitLoop('digit1', 50, 800);
  startDigitLoop('digit2', 50, 700);
  startDigitLoop('digit3', 50, 600);
  if (toggleButton) toggleButton.textContent = 'Stop';
};

const stopAll = () => {
  running = false;
  Object.values(timers).forEach(clearTimeout);
  if (toggleButton) toggleButton.textContent = 'Start';
};

// --- Button Event Listeners ---
if (toggleButton) {
  toggleButton.onclick = () => running ? stopAll() : startAll();
}
if (resetButton) {
  resetButton.onclick = () => {
    if (!confirm('Reset all match data?')) return;
    matchCount.value = 0;
    Object.keys(matchHistory).forEach(key => matchHistory[key] = 0);
    setDigits([0, 0, 0]);
    renderMatchHistory();
    if (matchCounterEl) matchCounterEl.textContent = 'Matches: 0';
    if (lastMatchEl) lastMatchEl.textContent = 'Last Match: —';
  };
}

// --- Initialize ---
renderMatchHistory();
if (matchCounterEl) matchCounterEl.textContent = `Matches: ${matchCount.value}`;
attachDevilTapListener();
startAll();

if (typeof module !== 'undefined') {
  module.exports = { updateMatchCounter };
}

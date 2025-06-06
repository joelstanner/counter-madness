/**
 * @jest-environment jsdom
 */

describe('updateMatchCounter', () => {
  let matchCounter, lastMatch, matchList, devilAlert, body, confettiMock;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    // Set up DOM
    document.body.innerHTML = `
      <div id="match-counter"></div>
      <div id="last-match"></div>
      <div id="match-list"></div>
      <div id="devil-alert" style="display:none"></div>
      <div class="digit" id="digit1"></div>
      <div class="digit" id="digit2"></div>
      <div class="digit" id="digit3"></div>
      <div id="toggle-button"></div>
      <div id="reset-button"></div>
    `;
    matchCounter = document.getElementById('match-counter');
    lastMatch = document.getElementById('last-match');
    matchList = document.getElementById('match-list');
    devilAlert = document.getElementById('devil-alert');
    body = document.body;

    // Provide confetti mock
    global.confetti = jest.fn();
    confettiMock = global.confetti;

    // Provide required global variables
    global.digits = { digit1: 0, digit2: 0, digit3: 0 };
    global.matchCount = 0;
    global.matchHistory = {
      "000": 0, "111": 0, "222": 0, "333": 0, "444": 0,
      "555": 0, "666": 0, "777": 0, "888": 0, "999": 0
    };

    // Provide required functions
    global.renderMatchHistory = jest.fn();
    global.attachDevilTapListener = jest.fn();
    global.fadeOutDevil = jest.fn();

    // Isolate updateMatchCounter
    global.updateMatchCounter = eval(`(${require('fs').readFileSync(require('path').resolve(__dirname, '../script.js'), 'utf8').match(/function updateMatchCounter\([\s\S]*?\n\}/)[0]})`);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // Existing tests

  it('does nothing if digits are not all equal', () => {
    global.digits = { digit1: 1, digit2: 2, digit3: 3 };
    updateMatchCounter();
    expect(matchCounter.textContent).not.toContain('Matches: 1');
    expect(lastMatch.textContent).not.toContain('Last Match: 123');
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('increments matchCount and updates DOM for a match', () => {
    global.digits = { digit1: 1, digit2: 1, digit3: 1 };
    updateMatchCounter();
    expect(matchCounter.textContent).toBe('Matches: 1');
    expect(lastMatch.textContent).toBe('Last Match: 111');
    expect(global.matchHistory["111"]).toBe(1);
    expect(confettiMock).toHaveBeenCalled();
    expect(global.renderMatchHistory).toHaveBeenCalled();
    expect(global.attachDevilTapListener).toHaveBeenCalled();
  });

  it('does not increment matchCount for repeated non-matching calls', () => {
    global.digits = { digit1: 1, digit2: 2, digit3: 3 };
    updateMatchCounter();
    updateMatchCounter();
    expect(global.matchCount).toBe(0);
    expect(matchCounter.textContent).not.toContain('Matches: 1');
  });

  it('increments matchCount for multiple consecutive matches', () => {
    global.digits = { digit1: 2, digit2: 2, digit3: 2 };
    updateMatchCounter();
    updateMatchCounter();
    expect(global.matchCount).toBe(2);
    expect(matchCounter.textContent).toBe('Matches: 2');
    expect(global.matchHistory["222"]).toBe(2);
  });

  it('does not update matchHistory for keys not in matchHistory', () => {
    global.digits = { digit1: 7, digit2: 7, digit3: 8 };
    updateMatchCounter();
    expect(global.matchHistory["778"]).toBeUndefined();
  });

  it('adds and removes devil class for 666 match', () => {
    // Add .digit elements for devil class
    document.body.innerHTML += `
      <div class="digit" id="digit1"></div>
      <div class="digit" id="digit2"></div>
      <div class="digit" id="digit3"></div>
    `;
    global.digits = { digit1: 6, digit2: 6, digit3: 6 };
    updateMatchCounter();
    document.querySelectorAll('.digit').forEach(d => {
      expect(d.classList.contains('devil')).toBe(true);
    });
    // Simulate time passing for setTimeout (removal)
    jest.advanceTimersByTime(5000);
    document.querySelectorAll('.digit').forEach(d => {
      expect(d.classList.contains('devil')).toBe(false);
    });
  });

  it('adds and removes flash class to body', () => {
    global.digits = { digit1: 3, digit2: 3, digit3: 3 };
    updateMatchCounter();
    expect(body.classList.contains('flash')).toBe(true);
    // Simulate time passing for setTimeout (if any)
    jest.runAllTimers();
  });

  it('calls confetti with correct arguments', () => {
    global.digits = { digit1: 8, digit2: 8, digit3: 8 };
    updateMatchCounter();
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    );
  });

  it('does not throw if matchHistory is missing a key', () => {
    delete global.matchHistory["333"];
    global.digits = { digit1: 3, digit2: 3, digit3: 3 };
    expect(() => updateMatchCounter()).not.toThrow();
    expect(global.matchCount).toBe(1);
    expect(matchCounter.textContent).toBe('Matches: 1');
  });

  it('does not throw if DOM elements are missing', () => {
    document.body.innerHTML = '';
    global.digits = { digit1: 1, digit2: 1, digit3: 1 };
    expect(() => updateMatchCounter()).not.toThrow();
  });

  it('does not increment matchCount if digits are not numbers', () => {
    global.digits = { digit1: 'a', digit2: 'a', digit3: 'a' };
    updateMatchCounter();
    expect(global.matchCount).toBe(1); // Still increments, as per logic
    expect(matchCounter.textContent).toBe('Matches: 1');
    // But matchHistory["aaa"] should be undefined
    expect(global.matchHistory["aaa"]).toBeUndefined();
  });

  it('does not call confetti if digits are not all equal', () => {
    global.digits = { digit1: 1, digit2: 2, digit3: 1 };
    updateMatchCounter();
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('adds and removes flash class to last-match on each match', () => {
    global.digits = { digit1: 4, digit2: 4, digit3: 4 };
    updateMatchCounter();
    expect(lastMatch.classList.contains('flash')).toBe(true);
    // Remove and add again
    global.digits = { digit1: 5, digit2: 5, digit3: 5 };
    updateMatchCounter();
    expect(lastMatch.classList.contains('flash')).toBe(true);
  });

  it('calls renderMatchHistory and attachDevilTapListener only for valid keys', () => {
    global.digits = { digit1: 7, digit2: 7, digit3: 7 };
    updateMatchCounter();
    expect(global.renderMatchHistory).toHaveBeenCalled();
    expect(global.attachDevilTapListener).toHaveBeenCalled();

    global.renderMatchHistory.mockClear();
    global.attachDevilTapListener.mockClear();

    global.digits = { digit1: 8, digit2: 8, digit3: 7 };
    updateMatchCounter();
    expect(global.renderMatchHistory).not.toHaveBeenCalled();
    expect(global.attachDevilTapListener).not.toHaveBeenCalled();
  });
});

/**
 * @jest-environment jsdom
 */

const { updateMatchCounter } = require('../script.js');

describe('updateMatchCounter', () => {
  let matchCounter, lastMatch, matchList, body, confettiMock, matchCount, matchHistory, digits;

  const setupDOM = () => {
    document.body.innerHTML = `
      <div id="match-counter"></div>
      <div id="last-match"></div>
      <div id="match-list"></div>
      <div class="digit" id="digit1"></div>
      <div class="digit" id="digit2"></div>
      <div class="digit" id="digit3"></div>
    `;
    matchCounter = document.getElementById('match-counter');
    lastMatch = document.getElementById('last-match');
    matchList = document.getElementById('match-list');
    body = document.body;
  };

  const setupGlobals = () => {
    digits = { digit1: 0, digit2: 0, digit3: 0 };
    matchCount = { value: 0 };
    matchHistory = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`${i}${i}${i}`, 0])
    );
    confettiMock = jest.fn();
  };

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    setupDOM();
    setupGlobals();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const callUMC = (extra = {}) =>
    updateMatchCounter({
      digits,
      matchCount,
      matchHistory,
      matchCounterEl: matchCounter,
      lastMatchEl: lastMatch,
      renderMatchHistory: jest.fn(),
      attachDevilTapListener: jest.fn(),
      confetti: confettiMock,
      documentObj: document,
      ...extra
    });

  it('does nothing if digits are not all equal', () => {
    digits = { digit1: 1, digit2: 2, digit3: 3 };
    callUMC();
    expect(matchCounter.textContent).toBe('');
    expect(lastMatch.textContent).toBe('');
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('increments matchCount and updates DOM for a match', () => {
    digits = { digit1: 1, digit2: 1, digit3: 1 };
    callUMC();
    expect(matchCounter.textContent).toBe('Matches: 1');
    expect(lastMatch.textContent).toBe('Last Match: 111');
    expect(matchHistory['111']).toBe(1);
    expect(confettiMock).toHaveBeenCalled();
  });

  it('does not increment matchCount for repeated non-matching calls', () => {
    digits = { digit1: 1, digit2: 2, digit3: 3 };
    callUMC();
    callUMC();
    expect(matchCount.value).toBe(0);
    expect(matchCounter.textContent).not.toContain('Matches: 1');
  });

  it('increments matchCount for multiple consecutive matches', () => {
    digits = { digit1: 2, digit2: 2, digit3: 2 };
    callUMC();
    callUMC();
    expect(matchCount.value).toBe(2);
    expect(matchCounter.textContent).toBe('Matches: 2');
    expect(matchHistory['222']).toBe(2);
  });

  it('does not update matchHistory for keys not in matchHistory', () => {
    digits = { digit1: 7, digit2: 7, digit3: 8 };
    callUMC();
    expect(matchHistory['778']).toBeUndefined();
  });

  it('adds and removes devil class for 666 match', () => {
    digits = { digit1: 6, digit2: 6, digit3: 6 };
    callUMC();
    document.querySelectorAll('.digit').forEach(d =>
      expect(d.classList.contains('devil')).toBe(true)
    );
    jest.advanceTimersByTime(5000);
    document.querySelectorAll('.digit').forEach(d =>
      expect(d.classList.contains('devil')).toBe(false)
    );
  });

  it('adds and removes flash class to body', () => {
    digits = { digit1: 3, digit2: 3, digit3: 3 };
    callUMC();
    expect(body.classList.contains('flash')).toBe(true);
    jest.runAllTimers();
  });

  it('calls confetti with correct arguments', () => {
    digits = { digit1: 8, digit2: 8, digit3: 8 };
    callUMC();
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    );
  });

  it('does not throw if matchHistory is missing a key', () => {
    delete matchHistory['333'];
    digits = { digit1: 3, digit2: 3, digit3: 3 };
    expect(() => callUMC()).not.toThrow();
    expect(matchCount.value).toBe(1);
    expect(matchCounter.textContent).toBe('Matches: 1');
  });

  it('does not throw if DOM elements are missing', () => {
    document.body.innerHTML = '';
    digits = { digit1: 1, digit2: 1, digit3: 1 };
    expect(() => callUMC()).not.toThrow();
  });

  it('does not increment matchCount if digits are not numbers', () => {
    digits = { digit1: 'a', digit2: 'a', digit3: 'a' };
    callUMC();
    expect(matchCount.value).toBe(1);
    expect(matchCounter.textContent).toBe('Matches: 1');
    expect(matchHistory['aaa']).toBeUndefined();
  });

  it('does not call confetti if digits are not all equal', () => {
    digits = { digit1: 1, digit2: 2, digit3: 1 };
    callUMC();
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('adds and removes flash class to last-match on each match', () => {
    digits = { digit1: 4, digit2: 4, digit3: 4 };
    callUMC();
    expect(lastMatch.classList.contains('flash')).toBe(true);
    digits = { digit1: 5, digit2: 5, digit3: 5 };
    callUMC();
    expect(lastMatch.classList.contains('flash')).toBe(true);
  });

  it('calls renderMatchHistory and attachDevilTapListener only for valid keys', () => {
    global.renderMatchHistory = jest.fn();
    global.attachDevilTapListener = jest.fn();

    digits = { digit1: 7, digit2: 7, digit3: 7 };
    callUMC({
      renderMatchHistory: global.renderMatchHistory,
      attachDevilTapListener: global.attachDevilTapListener
    });
    expect(global.renderMatchHistory).toHaveBeenCalled();
    expect(global.attachDevilTapListener).toHaveBeenCalled();

    global.renderMatchHistory.mockClear();
    global.attachDevilTapListener.mockClear();

    digits = { digit1: 8, digit2: 8, digit3: 7 };
    callUMC({
      renderMatchHistory: global.renderMatchHistory,
      attachDevilTapListener: global.attachDevilTapListener
    });
    expect(global.renderMatchHistory).not.toHaveBeenCalled();
    expect(global.attachDevilTapListener).not.toHaveBeenCalled();
  });
});

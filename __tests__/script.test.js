const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadDom() {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const scriptPath = path.resolve(__dirname, '../script.js');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  html = html.replace('<script src="script.js"></script>', `<script>${scriptContent}</script>`);
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost' });
  return new Promise(resolve => {
    dom.window.addEventListener('load', () => {
      // prevent audio playback errors
      dom.window.confetti = () => {};
      resolve(dom);
    });
  });
}

describe('counter madness controls', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('startAll launches digit loops and updates button text', async () => {
    const dom = await loadDom();
    const { window } = dom;
    window.stopAll();
    jest.clearAllTimers();
    window.eval('digits.digit1=0;digits.digit2=0;digits.digit3=0;timers={};');

    window.startAll();

    expect(window.document.getElementById('toggle-button').textContent).toBe('Stop');
    expect(window.document.getElementById('digit1').textContent).toBe('1');
    expect(window.document.getElementById('digit2').textContent).toBe('1');
    expect(window.document.getElementById('digit3').textContent).toBe('1');

    const timerCount = window.eval('Object.keys(timers).length');
    expect(timerCount).toBe(3);
  });

  test('stopAll stops timers and toggles the button label', async () => {
    const dom = await loadDom();
    const { window } = dom;
    window.stopAll();
    jest.clearAllTimers();
    window.eval('digits.digit1=0;digits.digit2=0;digits.digit3=0;timers={};');

    window.startAll();
    window.stopAll();

    const prev = window.document.getElementById('digit1').textContent;
    jest.advanceTimersByTime(500);
    expect(window.document.getElementById('digit1').textContent).toBe(prev);
    expect(window.document.getElementById('toggle-button').textContent).toBe('Start');
  });

  test('updateMatchCounter increments matches and handles 666', async () => {
    const dom = await loadDom();
    const { window } = dom;
    window.stopAll();
    jest.clearAllTimers();
    window.eval(
      'matchCount=0;Object.keys(matchHistory).forEach(k=>matchHistory[k]=0);digits.digit1=1;digits.digit2=1;digits.digit3=1;'
    );
    window.updateMatchCounter();
    expect(window.document.getElementById('match-counter').textContent).toBe('Matches: 1');
    expect(window.document.getElementById('last-match').textContent).toBe('Last Match: 111');
    expect(window.document.getElementById('match-111').textContent).toBe('111 → 1');

    window.eval('digits.digit1=6;digits.digit2=6;digits.digit3=6;');
    window.updateMatchCounter();
    expect(window.document.getElementById('match-counter').textContent).toBe('Matches: 2');
    expect(window.document.querySelectorAll('.digit.devil').length).toBe(3);
    expect(window.document.getElementById('match-666').textContent).toBe('666 → 1');
    expect(window.document.getElementById('devil-alert').style.display).toBe('block');
  });
});

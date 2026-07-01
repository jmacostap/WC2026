const CODE_RE = /^([A-Z]{2,3})(\d{1,2})$/;
const PREFIX_RE = /^[A-Z]{2,4}$/;
const NUM_RE = /^\d{1,2}$/;

// Parse one list, accepting two interchangeable styles:
//   full codes  ->  MAR13 ARG10 BRA9
//   per-line    ->  ARG: 1 2 3 4   (a country prefix applies to the
//                                   bare numbers that follow it on the line)
// Quantities in parentheses are ignored: "17(2x)" reads as 17.
// Returns { valid: Set<string>, invalid: string[] }.
function parseList(text) {
  const valid = new Set();
  const invalid = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    let prefix = null;
    const cleaned = line.toUpperCase().replace(/\([^)]*\)/g, ' ');
    for (const tok of cleaned.split(/[\s,:]+/).filter(Boolean)) {
      if (CODE_RE.test(tok)) {
        valid.add(tok);
        prefix = tok.match(CODE_RE)[1];
      } else if (PREFIX_RE.test(tok)) {
        prefix = tok;
      } else if (NUM_RE.test(tok)) {
        const code = prefix ? prefix + tok : tok;
        if (CODE_RE.test(code)) valid.add(code);
        else invalid.push(code);
      } else {
        invalid.push(tok);
      }
    }
  }
  return { valid, invalid };
}

function sortCodes(codes) {
  return [...codes].sort((a, b) => {
    const ma = a.match(CODE_RE);
    const mb = b.match(CODE_RE);
    if (ma[1] !== mb[1]) return ma[1] < mb[1] ? -1 : 1;
    return Number(ma[2]) - Number(mb[2]);
  });
}

function intersect(setA, setB) {
  return sortCodes([...setA].filter((c) => setB.has(c)));
}

function renderChips(el, codes) {
  el.innerHTML = '';
  if (!codes.length) {
    el.innerHTML = '<span class="muted">none</span>';
    return;
  }
  for (const c of codes) {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = c;
    el.appendChild(span);
  }
}

// Runs once data.js has loaded and the DOM is ready.
function boot() {
  const mine = {
    missing: parseList(MY_MISSING),
    repeats: parseList(MY_REPEATS),
  };

  renderChips(document.getElementById('my-missing'), sortCodes(mine.missing.valid));
  renderChips(document.getElementById('my-repeats'), sortCodes(mine.repeats.valid));

  const theirMissingEl = document.getElementById('their-missing');
  const theirRepeatsEl = document.getElementById('their-repeats');
  const results = document.getElementById('results');

  document.getElementById('compare').addEventListener('click', () => {
    const theirMissing = parseList(theirMissingEl.value);
    const theirRepeats = parseList(theirRepeatsEl.value);

    // I give you: my repeats that you are missing.
    const iGive = intersect(mine.repeats.valid, theirMissing.valid);
    // You give me: your repeats that I am missing.
    const youGive = intersect(theirRepeats.valid, mine.missing.valid);

    renderChips(document.getElementById('i-give'), iGive);
    renderChips(document.getElementById('you-give'), youGive);
    document.getElementById('i-give-count').textContent = iGive.length;
    document.getElementById('you-give-count').textContent = youGive.length;

    const bad = [...theirMissing.invalid, ...theirRepeats.invalid];
    const warn = document.getElementById('warn');
    if (bad.length) {
      warn.textContent = `Ignored (not valid codes): ${[...new Set(bad)].join(', ')}`;
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }

    results.hidden = false;
  });
}

// Load my lists with a cache-buster so updates to data.js reach returning
// visitors on their next reload, instead of waiting out the GitHub Pages
// 10-minute cache. The query is skipped under file:// for local testing.
function loadData() {
  const bust = location.protocol.startsWith('http') ? '?t=' + Date.now() : '';
  const s = document.createElement('script');
  s.src = 'data.js' + bust;
  s.onload = boot;
  document.head.appendChild(s);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadData);
} else {
  loadData();
}

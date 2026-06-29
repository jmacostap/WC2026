const CODE_RE = /^([A-Z]{3})(\d{1,2})$/;

// Split raw text into tokens, dropping comments and blanks.
function tokenize(text) {
  return text
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join(' ')
    .split(/[\s,]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

// Returns { valid: Set<string>, invalid: string[] }.
function parseList(text) {
  const valid = new Set();
  const invalid = [];
  for (const tok of tokenize(text)) {
    if (CODE_RE.test(tok)) valid.add(tok);
    else invalid.push(tok);
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

// My lists, parsed once at load.
const mine = {
  missing: parseList(MY_MISSING),
  repeats: parseList(MY_REPEATS),
};

document.addEventListener('DOMContentLoaded', () => {
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
});

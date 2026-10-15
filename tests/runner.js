// Minimal in-browser test runner: test files register tests on import,
// tests.html calls run() once every test file is loaded.

const tests = [];
const loadErrors = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export function assert(cond, msg = 'assertion failed') {
  if (!cond) throw new Error(msg);
}

export function assertEqual(actual, expected, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg ? msg + ': ' : ''}expected ${e}, got ${a}`);
}

export function reportLoadError(file, err) {
  loadErrors.push({ name: `load ${file}`, error: err });
}

export function run() {
  const results = loadErrors.map((l) => ({ name: l.name, ok: false, msg: String(l.error) }));
  for (const t of tests) {
    try {
      t.fn();
      results.push({ name: t.name, ok: true });
    } catch (err) {
      results.push({ name: t.name, ok: false, msg: err && err.message ? err.message : String(err) });
    }
  }
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  const root = document.getElementById('results');
  root.innerHTML = '';
  for (const r of results) {
    const li = document.createElement('li');
    li.className = r.ok ? 'ok' : 'bad';
    li.textContent = `${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : ' — ' + r.msg}`;
    root.appendChild(li);
  }
  const summary = failed ? `FAIL ${failed}` : `PASS ${passed}`;
  document.title = summary;
  const s = document.getElementById('summary');
  s.textContent = `${summary} (passed ${passed}, failed ${failed})`;
  s.dataset.status = failed ? 'fail' : 'pass';
  return { passed, failed };
}

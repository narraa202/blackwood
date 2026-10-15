# Blackwood Hall Detective Mini-App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 20-minute Russian-language detective game ("Смерть в Блэквуд-холле") that runs as a Telegram Mini App on GitHub Pages.

**Architecture:** Static site, ES modules, no build. All story content is data in `js/data/case.js`; `js/engine/` is pure functions over a plain state object (no DOM) and is unit-tested in the browser; `js/ui/` renders screens from state; `js/art/` returns SVG strings.

**Tech Stack:** HTML, CSS, vanilla JS (ES2020 modules), inline SVG, WebAudio, Telegram `telegram-web-app.js`, Google Fonts, `python3 -m http.server` for local serving.

**Spec:** `docs/superpowers/specs/2026-10-15-blackwood-detective-design.md` — all story content (characters, clues, testimonies, deductions, questions, timeline) is defined there and copied into `case.js` verbatim in meaning; in-game text is Russian.

## Global Constraints

- No Node, no npm, no build step; every file is served as-is.
- External scripts only: `https://telegram.org/js/telegram-web-app.js`. Fonts only from Google Fonts. Everything else inline/local.
- In-game text Russian; code, comments, docs English; commits Russian.
- Engine modules must not touch `document`, `window` or `localStorage` (storage module excepted).
- Reputation starts 100, clamped 0..100; wrong link −5, wrong presentation −10, hint −15; patience 3 per character; 3 hints.
- Unlocks: guest wing at ≥ 4 physical clues; midgame at (talked to Lucy and ≥ 8 cards) or ≥ 12 cards; conservatory and Lucy's room after midgame; `suitcase` after deduction `theft`.
- Score = round(20·correct · (0.5 + rep/200)) + round(10 · foundClues/totalClues), capped at 100. Ranks: <40 Констебль, <60 Сержант, <80 Инспектор, else Старший инспектор; Великий сыщик = 5/5 correct, hintsUsed ≤ 1, rep ≥ 70.
- Phone-first: layout works at 320×568 and 375×812, no horizontal scroll.
- Never commit secrets; bot token stays with the owner.

## Review Focus

- Rapid double taps on a hotspot, topic or link → no duplicate cards and no double penalty (tests in Tasks 3–5).
- Linking a card with itself, or the pair in reverse order → reverse works like forward, self-link is ignored without penalty (Task 4).
- Corrupted or old-version save JSON, and reopening after the game was finished → fresh start / result screen, never a crash (Task 7).
- Reputation at 0 and hints at 0 → score stays a finite number, hint button disabled, no negative values (Task 6).
- Telegram viewport (small phones, safe-area, `viewportStableHeight` changes) → nothing cut off, buttons reachable (Task 9 CSS, Task 14 manual check at 320×568).

---

### Task 1: Scaffold and browser test runner

**Files:**
- Create: `index.html`, `tests.html`, `tests/runner.js`, `tests/smoke.test.js`, `.gitignore`, `README.md`

**Interfaces:**
- Produces: `tests/runner.js` exports `test(name: string, fn: () => void)`, `assert(cond: any, msg?: string)`, `assertEqual(actual, expected, msg?)` (deep equal via JSON.stringify), `run(): {passed:number, failed:number}` which renders results into `#results` and sets `document.title` to `PASS n` or `FAIL n`.
- `tests.html` imports `runner.js`, then every `tests/*.test.js`, then calls `run()`.

- [ ] **Step 1:** Write `tests/smoke.test.js` with `test('runner works', () => assertEqual(1 + 1, 2))` and one deliberately failing `test('runner reports failure', () => assertEqual(1, 2))`.
- [ ] **Step 2:** Write `runner.js`, `tests.html`; serve with `python3 -m http.server 8000` (background) and open `http://localhost:8000/tests.html` in the built-in browser. Expected: title `FAIL 1`, one green, one red line.
- [ ] **Step 3:** Delete the deliberately failing test. Reload. Expected: `PASS 1`.
- [ ] **Step 4:** `index.html` shell: viewport meta with `viewport-fit=cover`, Telegram script, Google Fonts link (Poiret One, Playfair Display, PT Serif — all with Cyrillic), `<div id="app">`, `<script type="module" src="js/main.js">`. README: how to run locally and open tests.
- [ ] **Step 5:** Commit `Каркас проекта и браузерный тест-раннер`.

### Task 2: Case data and integrity tests

**Files:**
- Create: `js/data/case.js`, `tests/case.test.js`

**Interfaces:**
- Produces `export const CASE` with:
  - `rooms: Array<{id, name, unlock: {type:'start'} | {type:'clues', count:4} | {type:'event', id:'midgame'}}>` — ids `study, library, drawing, billiards, guest, lucy, conservatory`.
  - `clues: Array<{id, room, title, text, requires?: string}>` — `requires` is a card id that must be owned before the clue can be found (only `suitcase: 'theft'`).
  - `testimonies: Array<{id, from, title, text}>`.
  - `deductions: Array<{id, a, b, title, text}>`.
  - `characters: Array<{id, name, role, suspect: boolean, intro, topics: Array<{id, label, text, requires?: string[], gives?: string}>, presents: Array<{card, text, gives?: string}>, wrong: string, goneAfter?: 'midgame'}>` — `lucy.goneAfter = 'midgame'`.
  - `events: {midgame: {title, text}}`.
  - `questions: Array<{id:'who'|'how'|'why'|'framer'|'necklace', text, options: Array<{id,label}>, answer: string}>`; `who` also has `proof: string[]` = `['framed','falsealibi','purchase','lucywitness']`.
  - `hints: Array<{until: string, text}>` — ordered; the first whose `until` card is not owned is the current hint.
  - `prologue: string[]` (3–4 slides), `finale: {caught: string, escaped: string}`.
- Card = any clue, testimony or deduction id; all ids globally unique.

- [ ] **Step 1: Write failing integrity tests** in `tests/case.test.js`:
  - `ids are globally unique` — clues+testimonies+deductions ids have no duplicates.
  - `every reference exists` — each `clue.room`, `clue.requires`, `deduction.a/b`, `topic.requires[]`, `topic.gives`, `present.card`, `present.gives`, `hint.until`, `question.answer` (in its options), `who.proof[]` resolves.
  - `spec counts` — 21 clues, 8 testimonies, 8 deductions, 7 characters (5 with `suspect:true`), 5 questions.
  - `answers match spec` — who=`finch`, how=`digitalis`, why=`embezzlement`, framer=`finch`, necklace=`vivian_julian`.
  - `each testimony is given by exactly one topic or present of its 'from' character`.
- [ ] **Step 2:** Run tests. Expected: FAIL (module missing).
- [ ] **Step 3:** Write `case.js` from the spec tables. Every character has an intro, 2–4 free topics, presents per the spec's testimony table, plus flavour presents for red herrings (e.g. `iou` to arthur, `lovenote` to vivian, `safe` to julian) that reveal secrets without giving cards. Finch's presents for `framed`, `falsealibi`, `purchase` give evasive text and no card. Hints cover the critical path in order: talk to Jenkins → find study clues → `poison` → guest wing → `framed` → `t_alibi` → `falsealibi` → `theft` → `t_clinic` → `motive` → accuse.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit `Данные дела: улики, персонажи, выводы`.

### Task 3: Engine — state, clues, rooms, events

**Files:**
- Create: `js/engine/state.js`, `tests/state.test.js`

**Interfaces:**
- Consumes: `CASE` (Task 2).
- Produces (all pure, return new objects, never mutate input):
  - `createState(now: number) → State` where `State = {version:1, startedAt, endedAt:null, cards: string[], talked: string[], seenTopics: string[] /* "char:topic" */, patience: {[charId]: number}, lockedAt: {[charId]: number} /* deductions count when locked */, reputation: 100, hintsUsed: 0, events: string[], finished: null | {answers, score, rank, correct}}`.
  - `hasCard(state, id) → boolean`, `clueCount(state) → number` (physical clues only), `deductionCount(state) → number`.
  - `unlockedRooms(state) → string[]`.
  - `findClue(state, clueId) → {state, result: 'new'|'already'|'locked'|'unknown'}` — `locked` if room not unlocked or `requires` not owned.
  - `pendingEvent(state) → 'midgame' | null`, `applyEvent(state, id) → State`.
  - `availableCharacters(state) → string[]`.

- [ ] **Step 1: Write failing tests:**
  - `fresh state` — reputation 100, cards `[]`, `unlockedRooms` = `['study','library','drawing','billiards']`.
  - `findClue adds once` — find `glass` twice → second result `'already'`, `cards` = `['glass']`.
  - `guest wing at 4 clues` — after 3 study clues `guest` locked; after 4th unlocked; `findClue(s,'lancet')` before that → `'locked'`.
  - `suitcase requires theft` — in unlocked guest wing `'locked'` until `theft` in cards.
  - `midgame triggers` — with `talked:['lucy']` and 8 cards → `'midgame'`; with 7 → null; without Lucy and 12 cards → `'midgame'`; after `applyEvent` → null, `lucy` and `conservatory` unlocked, `lucy` not in `availableCharacters`.
  - `unknown id` — `findClue(s,'nope').result === 'unknown'` and state equal to input.
  - `immutability` — input state JSON unchanged after `findClue`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Clone with `structuredClone`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `Движок: состояние, улики, комнаты, событие`.

### Task 4: Engine — board linking

**Files:**
- Create: `js/engine/board.js`, `tests/board.test.js`

**Interfaces:**
- Produces: `link(state, a: string, b: string) → {state, outcome: 'new'|'already'|'none'|'invalid', deduction?: object}` — order-independent; `invalid` when a===b or either card not owned (no penalty); `none` costs 5 reputation; `already` no penalty.

- [ ] **Step 1: Failing tests:** `diary+handbook gives poison`; `reverse order works`; `second link is 'already' without penalty`; `wrong pair costs 5` (rep 95, then repeated wrong pair 90 — each attempt costs); `self link invalid, no penalty`; `unowned card invalid`; `reputation never below 0` (25 wrong links → 0).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `Движок: связывание улик на доске`.

### Task 5: Engine — interrogation

**Files:**
- Create: `js/engine/talk.js`, `tests/talk.test.js`

**Interfaces:**
- Produces:
  - `canTalk(state, charId) → boolean` — false if not available or locked out; lock clears when `deductionCount(state) > lockedAt[charId]` (then patience back to 3).
  - `meet(state, charId) → State` — adds to `talked`.
  - `availableTopics(state, charId) → topic[]` — `requires` all owned.
  - `askTopic(state, charId, topicId) → {state, text, gained: string[]}` — marks seen, adds `gives` once.
  - `present(state, charId, cardId) → {state, outcome: 'reveal'|'already'|'wrong'|'refused', text, gained: string[]}` — `reveal` when a matching present exists and was not used before (track in `seenTopics` as `"char:present:card"`); `already` on repeat, no penalty; `wrong` → rep −10, patience −1, at 0 sets `lockedAt`; `refused` when `!canTalk`.
  - `cleanupLock(state) → State` helper used by `canTalk` consumers (UI calls it before rendering).

- [ ] **Step 1: Failing tests:** `jenkins habit topic gives t_habit once` (asking twice → cards contain it once); `presenting scorecard to thorne gives t_alibi`; `repeat present is 'already' without penalty`; `wrong present costs 10 and patience`; `three wrongs lock out, next deduction unlocks with patience 3`; `topic requiring framed hidden until framed owned`; `lucy refused after midgame`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `Движок: допросы и предъявление улик`.

### Task 6: Engine — hints, accusation, scoring

**Files:**
- Create: `js/engine/scoring.js`, `tests/scoring.test.js`
- Modify: `js/engine/state.js` (add hint functions)

**Interfaces:**
- Produces:
  - `currentHint(state) → string | null`, `useHint(state) → {state, text}` — when `hintsUsed >= 3` returns state unchanged and `text: null`; otherwise rep −15, `hintsUsed+1`.
  - `evaluate(answers: {who, proof, how, why, framer, necklace}) → {correct: {who,how,why,framer,necklace: boolean}, count: number}` — `who` correct only if `who==='finch'` and `proof` in `CASE.questions.who.proof`.
  - `rankFor(score, count, hintsUsed, reputation) → string`.
  - `computeResult(state, answers, now) → {score, rank, correct, count, timeMs, cluesFound, cluesTotal}`.
  - `finish(state, answers, now) → State` — sets `finished` and `endedAt`.

- [ ] **Step 1: Failing tests:** `perfect run is Великий сыщик` (all correct, rep 100, all 21 clues, 0 hints → score 100); `right suspect wrong proof is not correct`; `rank thresholds` (`rankFor` with scores 39, 40, 59, 60, 79, 80 and count 4 → Констебль/Сержант/Сержант/Инспектор/Инспектор/Старший инспектор); `5/5 with 2 hints is not Великий сыщик`; `score finite at rep 0 and no clues` (=0); `useHint stops at 3` (4th call: text null, rep unchanged).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `Движок: подсказки, обвинение, ранги`.

### Task 7: Storage and full-playthrough solver test

**Files:**
- Create: `js/engine/storage.js`, `tests/storage.test.js`, `tests/solver.test.js`

**Interfaces:**
- Produces: `save(state)`, `load() → State | null` (null on missing, unparsable, or `version !== 1`), `clear()`. Key `blackwood.save.v1`. All wrapped in try/catch.
- `tests/solver.test.js` exports nothing; contains `solve(state, {skipLucy})` that loops until no progress: apply pending event; find every clue in unlocked rooms; for every available character `meet`, ask every available topic, present every card listed in its `presents`; link every deduction pair owned.

- [ ] **Step 1: Failing tests:** `save/load round trip`; `garbage JSON → null`; `version 2 → null`; `solver reaches every card` (all 37 cards owned, rep still 100); `solver without Lucy still reaches midgame and every card except t_cane`; `solver then perfect accusation → Великий сыщик`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement storage; fix any content gap the solver reveals in `case.js`. **Step 4:** PASS (whole `tests.html` green).
- [ ] **Step 5:** Commit `Сохранение и тест полного прохождения`.

### Task 8: Telegram wrapper and sound

**Files:**
- Create: `js/telegram.js`, `js/sound.js`

**Interfaces:**
- `telegram.js`: `initTelegram()` (ready, expand, set header/background color `#0d1f1a`, disable vertical swipes if supported), `haptic(kind: 'light'|'medium'|'heavy'|'success'|'error')`, `share(text: string, url: string)` → `openTelegramLink('https://t.me/share/url?url=…&text=…')`, fallback `navigator.share` → clipboard. `isTelegram() → boolean`. All safe outside Telegram.
- `sound.js`: `toggleSound() → boolean`, `isSoundOn()`, `playThunder()`, `playFound()`, `playWrong()` — WebAudio, created lazily on first user gesture, rain = filtered noise loop.

- [ ] **Step 1:** Implement both. **Step 2:** In the built-in browser console: import modules, call each function → no errors outside Telegram, sound plays after a click.
- [ ] **Step 3:** Commit `Обёртка Telegram и звук`.

### Task 9: UI shell, theme, cover, prologue, map

**Files:**
- Create: `css/style.css`, `js/main.js`, `js/ui/hud.js`, `js/ui/cover.js`, `js/ui/prologue.js`, `js/ui/map.js`, `js/ui/modal.js`, `js/art/cover.js`, `js/art/deco.js`

**Interfaces:**
- `main.js` owns `ctx = {state, set(fnOrState), go(screen, params), toast(text), cardFx(card)}`; `set` saves via storage, then re-renders current screen; after each `set` it checks `pendingEvent` and routes to `event` screen.
- Every screen module: `export function render(root: HTMLElement, ctx, params) → void`.
- `modal.js`: `showModal({title, html, actions: [{label, onClick}]})`, `showCard(card)` (flying card animation, used by rooms/talk/board).
- `deco.js`: art-deco frame/divider/icon SVG helpers.
- CSS tokens on `:root`: `--emerald #0d1f1a`, `--emerald-2 #163a30`, `--gold #c9a24a`, `--gold-soft #e6cf8f`, `--ivory #f3ead7`, `--ink #0a0a0a`, `--blood #8e1b1b`; safe-area padding; 100dvh layout; screen fade/slide transitions.

- [ ] **Step 1:** Implement. Cover SVG: manor silhouette, rain, animated lightning flash + `playThunder` when sound on. Map: floor-plan SVG with 6 room areas (Lucy's room shown inside guest wing), locked rooms dimmed with lock icon; character portrait strip (uses placeholder circles until Task 11).
- [ ] **Step 2:** Verify in built-in browser at 375×812: cover → prologue → map; reload keeps map ("Продолжить"); no console errors.
- [ ] **Step 3:** Commit `Интерфейс: тема, обложка, пролог, карта`.

### Task 10: Room scenes

**Files:**
- Create: `js/art/rooms.js`, `js/ui/room.js`, `tests/art.test.js`

**Interfaces:**
- `rooms.js`: `roomSvg(roomId) → string` — viewBox `0 0 400 560`, each clue hotspot is `<g class="hotspot" data-clue="ID">`.
- `room.js` taps hotspot → `findClue` → `showCard`, `haptic('medium')`, `playFound`; found hotspots get `.found`; `locked` suitcase shows "Заперт" toast.

- [ ] **Step 1: Failing test** `every clue has a hotspot in its room` — parse `roomSvg(room)` with `DOMParser`, collect `data-clue`, assert equals set of clues with that room.
- [ ] **Step 2:** FAIL. **Step 3:** Draw 7 rooms (study with desk, fireplace, safe, body silhouette; library shelves; drawing room sofa; billiards table; guest corridor with 3 doors/objects; Lucy's small room; conservatory with plants) in the palette, hotspots with subtle shimmer animation. **Step 4:** PASS + visual check of every room at 375×812.
- [ ] **Step 5:** Commit `Комнаты особняка и поиск улик`.

### Task 11: Portraits and interrogation screen

**Files:**
- Create: `js/art/portraits.js`, `js/ui/talk.js`

**Interfaces:**
- `portraitSvg(charId) → string` — art-deco bust, distinct silhouette per character (Finch: spectacles, cane top; Thorne: moustache, medals; Vivian: bob and pearls; Arthur: slick hair, loose tie; Julian: round glasses; Jenkins: tailcoat; Lucy: cap).
- `talk.js`: intro on first meet, topic buttons (seen ones dimmed), "Предъявить улику" opens card picker, patience shown as 3 dots, refused state message "Не желает с вами говорить. Найдите что-то новое."

- [ ] **Step 1:** Implement. **Step 2:** Verify: talk to Jenkins, gain `t_habit`; wrong present 3× to Arthur locks him; make a deduction → unlocked. **Step 3:** Commit `Портреты и допросы`.

### Task 12: Evidence board

**Files:**
- Create: `js/ui/board.js`

**Interfaces:**
- Cards grouped (Улики / Показания / Выводы); tap A highlights, tap B calls `link`; `new` → red-thread SVG animation + `haptic('success')` + deduction card; `none` → shake + "Связи нет" + `haptic('error')`; tap selected card again deselects; long text opens card detail. Buttons: "Подсказка (n)" → confirm then `useHint`; "Обвинить" → accusation.

- [ ] **Step 1:** Implement. **Step 2:** Verify linking diary+handbook and a wrong pair at 375×812. **Step 3:** Commit `Доска улик`.

### Task 13: Midgame event, accusation, result, share

**Files:**
- Create: `js/ui/event.js`, `js/ui/accuse.js`, `js/ui/result.js`

**Interfaces:**
- `event.js`: full-screen scene for `CASE.events.midgame`, `haptic('heavy')`, thunder; button calls `applyEvent` then map.
- `accuse.js`: confirm dialog "Обвинение можно выдвинуть только один раз", then 5 questions one per screen; after `who` the proof picker shows owned cards only; then `finish` → result.
- `result.js`: finale text (`caught`/`escaped`), the truth summary, rank badge SVG, score, time mm:ss, clues n/21; "Поделиться" → `share('Я раскрыл(а) дело «Смерть в Блэквуд-холле» — ранг «…», N очков. Сможешь лучше?', location.href)`; "Сыграть снова" → `clear()` + cover. Reopening a finished game lands on result.

- [ ] **Step 1:** Implement. **Step 2:** Verify one wrong and one perfect accusation in browser. **Step 3:** Commit `Поворот, обвинение, итог и шеринг`.

### Task 14: Full manual playthrough and polish

- [ ] **Step 1:** `tests.html` → all PASS.
- [ ] **Step 2:** Fresh playthrough in the built-in browser at 375×812, timing it; note anything confusing, cut off or slow. Repeat key screens at 320×568.
- [ ] **Step 3:** Fix findings; re-run tests.
- [ ] **Step 4:** Commit `Полировка после прохождения`.

### Task 15: Deployment docs

**Files:**
- Create: `docs/telegram-setup.md`

- [ ] **Step 1:** Write step-by-step guide in Russian: create GitHub repo, push branch, open PR, merge, enable Pages (Settings → Pages → main / root), create bot in @BotFather (`/newbot`), set Mini App (`/newapp` or Bot Settings → Menu Button → URL), test with friends, how to update the game later.
- [ ] **Step 2:** Commit `Инструкция по запуску в Telegram`.

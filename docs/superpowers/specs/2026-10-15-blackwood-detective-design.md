# Blackwood Hall — Telegram detective mini-app — Design

Date: 2026-10-15
Status: approved in chat, pending written-spec review

## 1. Goal and audience

A single-case detective game played inside Telegram as a Mini App, made for
the owner's friends / Telegram channel. One sitting of about 20 minutes,
difficulty about 7/10, art-deco vector graphics. Players share their rank to
chats, which is the main growth mechanic.

Success criteria:
- A first-time player finishes in 15–25 minutes.
- Solving "who" requires real deduction; a trope-savvy guess is actively
  misled by the frame-up of Arthur.
- The game can always be finished (no soft-locks), progress survives closing
  the app.
- Works on a phone screen inside Telegram (iOS/Android) and in a normal
  mobile browser.

Language of all in-game text: Russian. Code, comments, docs: English.

## 2. Technical approach

- Static site: plain HTML + CSS + JavaScript ES modules. No framework, no
  build step, no server, no database.
- Hosting: GitHub Pages. Telegram bot created by the owner in @BotFather with
  its menu button / Mini App URL pointing at the Pages URL. The bot token is
  never put into the code or the chat.
- Telegram integration via the official `telegram-web-app.js` script:
  `ready()`, `expand()`, haptic feedback, theme-independent own palette,
  share via `openTelegramLink("https://t.me/share/url?...")`. A wrapper
  module makes every call a no-op outside Telegram, so the game runs in any
  browser.
- Save: `localStorage` (wrapped in try/catch; game still works if it fails).
- Sound: optional thunder/rain ambience generated with WebAudio (no audio
  files), off by default, toggle in the corner.
- Graphics: hand-written inline SVG (rooms, portraits, cover, icons) in an
  art-deco palette: deep emerald, black, ivory, gold accents, Art Deco fonts
  from Google Fonts (e.g. "Poiret One" / "Playfair Display" + a readable
  body font with Cyrillic support).
- Tests: no Node on the machine, so tests run in the browser: `tests.html`
  loads a tiny in-house test runner and the engine modules and prints
  pass/fail. Run locally with `python3 -m http.server`.

### File layout

```
index.html              app shell, loads js/main.js
tests.html              browser test runner page
css/style.css           theme tokens, layout, animations
js/main.js              boot, screen router
js/telegram.js          Telegram WebApp wrapper (no-op outside TG)
js/sound.js             WebAudio ambience
js/data/case.js         ALL story content as data (rooms, clues, characters,
                        topics, deductions, events, final questions)
js/engine/state.js      game state + pure transition functions
js/engine/scoring.js    score and rank
js/engine/storage.js    save/load (versioned)
js/ui/*.js              one module per screen
js/art/*.js             SVG builders: rooms, portraits, cover
tests/*.test.js         engine + content-integrity tests
```

Boundaries: `case.js` is pure data and has no logic; `engine/` has no DOM
access (pure functions in, new state out) so it is testable; `ui/` reads
state and calls engine functions; `art/` only returns SVG strings.

## 3. The case — "Смерть в Блэквуд-холле", 1926

Storm, the road is washed out, guests are stuck in the manor. Lord Edmund
Blackwood celebrates his 60th birthday. At dinner he announces: "Tomorrow I
see my solicitor Mr. Price. Some people at this table will be surprised."
At 00:15 he is found dead in his study, door locked from the inside. The
player is a guest-detective.

### Characters

| Id | Name | Role | Public face | Truth |
|---|---|---|---|---|
| finch | Доктор Гарольд Финч | family doctor, walks with a cane (gout) | helpful, first to say "poison!", steers suspicion to Arthur | **Killer** |
| arthur | Артур Блэквуд | son | gambling debts, loud quarrel with father at 22:50 | innocent, framed |
| vivian | Леди Вивиан | young wife, ex-actress | love letter, empty safe | stole the necklace with Julian, not a killer |
| julian | Джулиан Грей | secretary | nervous, hiding something | Vivian's lover, knows the real will change |
| thorne | Полковник Торн | old war friend, walks with a cane (war wound) | gives Finch an alibi | covers for a friend, innocent |
| jenkins | Дженкинс | butler (NPC witness) | | reliable timeline source |
| lucy | Люси | maid (NPC witness) | | saw a man with a cane near the study at 22:30 |

### True timeline

- 20:00 Dinner, will-change announcement.
- 21:00 Men to billiards (Thorne, Finch). Vivian and Julian in conservatory.
  Lord in the library until 22:45.
- 21:45 Vivian opens the study safe (code = her birthday) and takes the
  necklace; Julian keeps watch. They plan to flee to Paris.
- 22:25–22:45 Finch leaves billiards "for cigars". In the study he swaps the
  lord's heart drops (digitalis tincture) for a concentrate in an identical
  bottle, pockets the old bottle, then plants a second concentrate vial in
  Arthur's room wrapped in a page torn from his own copy of The Lancet.
  Lucy glimpses "a gentleman with a cane" at the study door at 22:30 and
  notices a hospital (carbolic) smell.
- 22:35 Jenkins serves Thorne a whisky in billiards — Thorne is alone.
- 22:50–23:05 Arthur asks his father for money; quarrel overheard by
  Jenkins ("Ты не получишь ни гроша!"). At 23:00 the lord takes his drops
  with brandy and grimaces: "Finch's new bottle is bitter."
- 23:05 Arthur leaves; the lord locks himself in, as he always does when
  working late.
- 23:20 Last diary entry: yellow halos around lamps, racing heart, "Price
  must hear about the clinic tomorrow."
- 23:30 Vivian knocks to confess — no answer, light under the door.
- 00:15 Jenkins, Arthur and Thorne break the door. Finch "examines" the body,
  declares poison, slips the new bottle into his pocket while everyone
  looks at the body, later hides it in a conservatory flowerpot.
- 00:30 In the hall Lucy says she saw someone at the study earlier. Finch
  gives her a "calming draught" — an overdose of chloral.

Motive: the lord learned from his bank that Finch embezzled £12,000 from
the Finch Clinic fund the lord financed. The "will change" removes the
£20,000 bequest to the clinic and he intended to go to the police. Everyone
assumes the change targets the family — the main misdirection.

### Rooms

Open from the start: Кабинет (study), Библиотека, Гостиная, Бильярдная.
Гостевое крыло unlocks after the player has 4 clues (Jenkins offers to show
the rooms). Оранжерея unlocks after the midgame event (mud trail).
Комната Люси appears in the guest wing after the midgame event.

### Clues (physical) — id, room, short meaning

| Id | Room | Clue |
|---|---|---|
| body | study | Тело лорда: спокойное лицо, синеватые губы, следов борьбы нет |
| glass | study | Бокал бренди: горький запах, осадок |
| emptyspot | study | Пустое место на столе: круглый след от флакона |
| burntletter | study | Обгоревшее письмо из банка: «...счёт клиники Финча... £12 000 без отчётов...» |
| safe | study | Открытый сейф, пустой футляр от колье |
| diary | study | Дневник: «лампы в жёлтых ореолах... сердце скачет... Прайс должен узнать о клинике» |
| key | study | Ключ в кармане лорда — заперся сам |
| handbook | library | Медицинский справочник, закладка на «Наперстянка: жёлтое зрение, ореолы, аритмия, смерть через 1–3 ч» |
| oldwill | library | Копия завещания: £20 000 клинике Финча, остальное Артуру и Вивиан |
| scorecard | billiards | Бильярдная записка: партия Торн–Финч прерывается в 22:25, продолжается в 22:45 |
| cigarbox | billiards | Полная коробка сигар на столе |
| iou | drawing | Долговая расписка Артура букмекеру на £3 000 |
| lovenote | drawing | Записка Вивиан Джулиану: «В 21:45, как договорились. Код — мой день рождения» |
| arthurvial | guest | Пузырёк в комнате Артура, завёрнут в страницу из The Lancet |
| lancet | guest | Журнал The Lancet в комнате доктора, страница вырвана |
| receipt | guest | Аптечный чек в саквояже доктора: «концентрат наперстянки — 2 фл.» |
| suitcase | guest | Чемодан Джулиана: колье и два билета в Париж (locked until deduction `theft`) |
| sleepglass | lucy | Стакан с осадком хлорала у кровати Люси |
| lucynote | lucy | Записка Люси: «у кабинета — джентльмен с тростью, пахло больницей» |
| bottle | conservatory | Флакон капель лорда в цветочном горшке — почти полный, горький запах |
| canemarks | conservatory | Следы трости и ботинок в земле оранжереи |

### Testimonies (cards gained in interrogation)

| Id | From | Trigger | Content |
|---|---|---|---|
| t_habit | jenkins | topic "Привычки лорда" | Капли в 23:00 с бренди; флакон всегда на столе; работая допоздна, лорд запирается |
| t_quarrel | jenkins | topic "Что вы слышали?" | Ссора Артура с отцом 22:50–23:05 |
| t_whisky | jenkins | present `scorecard` | В 22:35 подал виски полковнику — тот был один |
| t_cane | lucy | topic "Вы что-то видели?" | В 22:30 у кабинета джентльмен с тростью |
| t_bitter | arthur | present deduction `framed` | Отец сказал: «Новый флакон Финча горчит» |
| t_knock | vivian | present `suitcase` | В 23:30 стучала — не ответил, свет горел |
| t_clinic | julian | present `suitcase` or `burntletter` | Лорд диктовал письмо Прайсу: вычеркнуть клинику и заявить в полицию |
| t_alibi | thorne | present `scorecard` or `t_whisky` | Финч уходил с 22:25 до 22:45 «за сигарами» |

### Deductions (link two cards on the board)

| Id | Cards | Result |
|---|---|---|
| poison | diary + handbook | Лорда отравили наперстянкой |
| drops | bottle + glass | Яд был в каплях, флакон подменили |
| framed | arthurvial + lancet | Пузырёк Артуру подбросил владелец журнала — Финч |
| falsealibi | t_alibi + cigarbox | Финч ушёл не за сигарами — алиби ложное |
| theft | lovenote + safe | Колье взяли в 21:45 до убийства — кража, а не убийство |
| motive | burntletter + t_clinic | Лорд разоблачал растрату Финча |
| purchase | receipt + arthurvial | Финч купил два флакона: один в капли, второй подбросить |
| lucywitness | lucynote + canemarks | Тот, кто был у кабинета, прятал флакон в оранжерее |

A wrong link costs reputation. Linking two cards with no deduction shows a
short "Связи нет" message.

### Interrogation rules

- Each character has free topics plus topics unlocked by clues/deductions.
- "Предъявить улику": presenting the right card triggers a reveal (new
  testimony, clue unlock, or confession of a secret). The wrong card costs
  reputation and one point of that character's patience (3). At 0 patience
  the character refuses to talk until the player makes any new deduction
  (prevents brute force, no soft-lock).
- Finch is cooperative, always nudges toward Arthur; presenting `framed`,
  `falsealibi` or `purchase` makes him evasive but he never confesses before
  the accusation.

### Midgame event

Trigger: player has interviewed Lucy and holds ≥ 8 cards, or holds ≥ 12
cards regardless (so skipping Lucy cannot block progress). Full-screen scene:
Lucy is found unconscious. Unlocks Lucy's room and the conservatory (Jenkins
noticed a mud trail). Haptic "heavy" impact.

### Accusation — 5 questions

1. Кто убил лорда? (5 suspects) — Финч. Then "Чем докажете?" — pick one
   card; accepted: `framed`, `falsealibi`, `purchase`, `lucywitness`.
2. Чем? (Мышьяк в бренди / Концентрат наперстянки в каплях / Удар по голове
   / Цианид) — наперстянка.
3. Зачем? (Наследство / Ревность / Скрыть растрату клиники / Карточные
   долги) — растрата.
4. Кто подставил Артура? (5 suspects + "Никто — улики настоящие") — Финч.
5. Кто взял колье? (Вивиан и Джулиан / Артур / Дженкинс / Убийца) — Вивиан
   и Джулиан.

One attempt. Available from the start (button on the board), with a confirm
dialog. Then a reveal scene: correct "who" → Finch is exposed (short
dramatic monologue); wrong → "Убийца уходит" ending with the truth shown.

### Scoring

- 20 points per correct answer (Q1 needs both suspect and accepted proof).
- Reputation starts at 100: wrong link −5, wrong presentation −10, hint −15.
- Final score = answers (0–100) × (0.5 + reputation/200), plus up to +10 for
  share of clues found, capped at 100.
- Ranks: Констебль < 40 ≤ Сержант < 60 ≤ Инспектор < 80 ≤ Старший
  инспектор; Великий сыщик requires all 5 correct, ≤ 1 hint, reputation
  ≥ 70.
- Hints: 3 available; each points to the next unmade useful step.

## 4. Screens

1. Cover — manor in a storm with SVG lightning, art-deco frame, "Начать
   расследование" / "Продолжить".
2. Prologue — 3–4 short illustrated text slides.
3. Map — manor floor plan, rooms as tappable gold-outlined areas, locked
   rooms dimmed; a strip of character portraits below opens
   interrogations (Lucy is greyed out after the midgame event).
4. Room — SVG scene with tappable hotspots (subtle shimmer); found clue
   flies into a card; found hotspots get a check mark.
5. Interrogation — portrait, dialog bubble, topic list, "Предъявить улику".
6. Board — cork board, cards (clues, testimonies, deductions), tap card A
   then card B to link; red thread animation on success.
7. Accusation — 5 sequential questions + proof picker.
8. Result — rank badge, time, clues found, "Поделиться", "Сыграть снова".

Persistent HUD: reputation, hints left, sound toggle, board button.

## 5. Pacing target

0–3 min prologue and body; 3–10 the case against Arthur; ~10 midgame event;
10–17 frame-up collapses, theft and embezzlement surface; 17–20 accusation.

## 6. Error handling

- `localStorage` unavailable → game runs without save.
- Saved state with an unknown version → ignored, fresh start.
- Telegram SDK missing → wrapper no-ops; share falls back to copying text.
- Any engine function receiving an unknown id returns the state unchanged.

## 7. Testing

Browser test page (`tests.html`):
- Engine: finding clues, linking (right/wrong), presenting (right/wrong,
  patience, lockout recovery), unlock rules, midgame trigger, scoring and
  ranks, save/load round-trip.
- Content integrity: every id referenced by deductions/topics/answers
  exists; every clue is reachable; an automated solver plays the game from
  a fresh state to a perfect accusation, proving there is no soft-lock.
- Manual: full playthrough in the built-in browser at 375×812, then in real
  Telegram by the owner.

## 8. Deployment

1. Move the project to a permanent folder, push branch, open PR, merge to
   main via PR.
2. Enable GitHub Pages on main.
3. Owner creates the bot in @BotFather and sets the Mini App URL (step-by-
   step guide provided as `docs/telegram-setup.md`).

## Out of scope

Multiple cases, leaderboards, backend, payments, localisation, AI images.

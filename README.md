# Смерть в Блэквуд-холле

A 20-minute detective game for Telegram (Mini App). Static site: HTML, CSS,
vanilla JS modules, no build step.

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 for the game, http://localhost:8000/tests.html
for the tests.

## Tests from the terminal

```bash
./scripts/test.sh
```

Runs `tests.html` in headless Google Chrome; exit code 0 means all tests
passed.

## Launch in Telegram

See `docs/telegram-setup.md`.

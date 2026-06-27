# RFC: `gradio --wait-for-result` — human-in-the-loop feedback for LLM agents

> **Status: Draft / RFC.** This PR contains a design proposal only — no implementation yet.
> Looking for feedback on the surface area and data flow before building. Comment inline.

## Motivation

Coding agents (Claude Code, Codex, etc.) are good at writing throwaway Gradio apps, but
they have no clean way to get a human *back in the loop*. The pattern we want to make
trivial:

1. The agent writes a quick Gradio app that shows some examples (model outputs, candidate
   designs, generated data, etc.).
2. The agent launches it for the human.
3. The human reviews, **flags** the examples they like / dislike, and closes the page.
4. The flagged data is handed **back to the agent** so it can act on the human's judgment.

Today an agent would have to launch non-blocking, poll a flagged CSV, guess when the
human is done, and call `close()`. We want one command instead.

## Proposed UX

```bash
gradio --wait-for-result app.py
```

- Runs `app.py` exactly as written — **no code change to the app required**.
- The agent's `app.py` just uses normal flagging (e.g. `gr.Interface(..., flagging_mode="manual")`).
- The command **blocks** until the human clicks **"Finish & send results"** (or closes the tab).
- On finish, the flagged rows are emitted as JSON to stdout, which the agent reads.

The same behavior is available programmatically:

```python
results = demo.launch(wait_for_result=True)   # blocks; returns collected data
```

## Architecture

```
LLM agent                          Gradio                            Human
─────────                          ──────                            ─────
gradio --wait-for-result app.py
   │  sets GRADIO_WAIT_FOR_RESULT=true
   │  spawns: python -u app.py ───▶ launch() detects env var
   │                                 • installs in-memory result sink
   │                                 • renders floating "Finish" button (app chrome)
   │                                 • blocks (block_thread waits on finished_event)
   │                                                          ◀──── opens page,
   │                                                                flags examples
   │                                                          ◀──── clicks Finish
   │                                                                (or closes tab)
   │                                 • finalize: collect flagged rows
   │  ◀── stdout: <<<GRADIO_RESULT>>>{json}<<<END>>>
   │                                 • close() server, launch() returns data
   │  subprocess exits
   ▼
agent parses the JSON block
```

### Three layers, one behavior

The flag is sugar over an env var, which is sugar over a `launch()` kwarg — mirroring the
existing `GRADIO_MCP_SERVER` / `GRADIO_DEBUG` pattern. This gives us "CLI for agents +
kwarg for everyone else" with no extra surface.

| Layer | Where | Notes |
|-------|-------|-------|
| `--wait-for-result` flag | `gradio/cli/commands/reload.py`, `gradio/cli/cli.py` | Sets env var, **disables file-watching** for this mode, waits for subprocess exit |
| `GRADIO_WAIT_FOR_RESULT` env var | read in `launch()` (`gradio/blocks.py`) | Same pattern as `GRADIO_MCP_SERVER` (`routes.py:321`) |
| `launch(wait_for_result=True)` kwarg | `gradio/blocks.py` | Falls out for free; usable in notebooks / scripts |

### The four pieces to build

**A. In-memory result sink** — `gradio/flagging.py`
Reuse flagging; it already *is* "human marks examples to send back," complete with flag
buttons, flag options, and per-component serialization. Add an
`InMemoryLogger(FlaggingCallback)` (or a `keep_in_memory` flag on `CSVLogger`) that appends
each flagged row to a list. When `wait_for_result` is on, this becomes the default
`flagging_callback`.

**B. "Finish" button as app chrome** — frontend (`js/`)
When `config.wait_for_result` is true, the frontend overlays a small banner + a
**"Finish & send results"** button. It is rendered as app chrome, **not injected into the
user's component tree** (which is fragile and layout-dependent). Clicking it hits a new
route `POST /gradio_api/finish_result`. This keeps the feature general — works with any
`Interface` or `Blocks` app, zero code change.

**C. Finalize + emit + shutdown** — `gradio/blocks.py`, `gradio/routes.py`
- Add `self.finished_event` (a `threading.Event`).
- `block_thread()` (`blocks.py:3361`) waits on `finished_event` in addition to `is_running`.
- The finish route **and** the existing `unload` heartbeat path (`routes.py:1234`, the
  tab-close fallback) both call `finalize_result()`, which: reads the in-memory sink →
  serializes JSON → prints `<<<GRADIO_RESULT>>>…<<<END>>>` to stdout → sets `finished_event`.
- `launch()` returns the collected data so the kwarg path works in-process.

**D. Result schema** (JSON)
```json
{
  "flagged": [
    {
      "index": 0,
      "values": {"input_text": "...", "output_image": "/path/....png"},
      "flag_option": "Good",
      "timestamp": "2026-06-26T12:00:00"
    }
  ],
  "count": 1
}
```
Mirrors the flagged-CSV columns, but JSON and addressed to the agent.

## Completion triggers

Both, per design discussion:
- **Primary:** the "Finish & send results" button (unambiguous — the agent knows results
  are final).
- **Fallback:** tab close, via the existing `unload` / heartbeat mechanism
  (`routes.py:1234`), so results aren't lost if the human just closes the tab.

## Files to touch

- `gradio/cli/commands/reload.py` — add `--wait-for-result`; set env var; skip watching; wait for subprocess exit.
- `gradio/cli/cli.py` — flag passthrough.
- `gradio/blocks.py` — read env var in `launch()`; `finished_event`; `block_thread()` wait; `finalize_result()`; return value; `wait_for_result` in config payload.
- `gradio/routes.py` — `POST /finish_result` route; hook `finalize_result()` into the unload path.
- `gradio/flagging.py` — in-memory collector.
- `js/` — floating Finish button + banner gated on `config.wait_for_result`.

## Open questions (feedback wanted)

1. **Return channel: stdout sentinels vs. a results file.**
   Stdout "just works" for agents but can interleave with app logs. A `--result-file path.json`
   (printed once at startup) is more robust for binary/file artifacts and large payloads.
   *Proposed:* stdout-delimited JSON by default, with `--result-file` as opt-in.

2. **What counts as "the data" for non-flagging apps.**
   This RFC anchors on flagging (matches the core use case). The same sink could later accept
   appends from any event handler. *Proposed:* flagging-only for v1.

3. **Finish button: overlay chrome vs. requiring a `gr.Button`.**
   Overlay is general (zero code change) but is real frontend work. *Proposed:* overlay.

4. **Naming.** `--wait-for-result` / `GRADIO_WAIT_FOR_RESULT` / `launch(wait_for_result=)` —
   alternatives considered: `--collect`, `--review`, `--feedback`. Open to bikeshedding.

## Suggested build order

A thin vertical slice first to de-risk the data flow end-to-end:
`launch(wait_for_result=True)` blocking + in-memory flagging + stdout emit on a hardcoded
finish route, tested with a ~10-line `Interface`. Then wire the CLI flag and the polished
frontend overlay.

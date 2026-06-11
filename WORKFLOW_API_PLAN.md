# Plan: Run Workflow subgraphs via Gradio's HTTP API

> **Status:** Draft plan only — no implementation yet. This document is a
> placeholder for design review and will be removed once the implementation
> lands. Comment inline on anything you'd like changed.

## Goal

Expose each workflow **subject** (output node) as a named Gradio endpoint that
reuses the existing `/info`, `/call/{api_name}`, and `/api/{api_name}` machinery
— so `gradio_client`, the API recorder, and MCP work against a workflow defined
visually in the UI. Endpoints re-derive **live** when the graph is saved.

## Decisions (locked)

- **Base branch:** off `main` (now includes the merged auth/token work, #13520).
- **Granularity:** one endpoint per subject/output. The endpoint's inputs are the
  reference/free-input ports feeding that subject's upstream sub-DAG; its output
  is the subject's value.
- **Lifecycle:** live-update — endpoints (and `/info`) re-derive whenever the
  graph is saved via `save_workflow`.
- **Downstream auth:** reuse the existing token resolution (caller-supplied token
  → OAuth → host local token, write-access only), threaded from the endpoint's
  injected `Request` + `OAuthToken`.
- **Registration strategy: B2 — explicit non-rendered components.** Map each
  free-input/output port to a real Gradio component (`gr.Image`/`gr.Audio`/
  `gr.Video`/`gr.Textbox`/`gr.Number`/…) and register a `BlockFunction` with
  explicit `inputs=/outputs=/api_name=`. Chosen over `gr.api()` (type-hint
  driven) because workflows are image/audio/video-centric and real components
  carry the proven `api_info` + `FileData` file round-trip that `gradio_client`
  already handles, and space outputs are already saved to tempdir and served as
  `/gradio_api/file=` URLs.

## What exists today (reuse, don't reinvent)

- `Workflow(Blocks)` registers one `WorkflowCanvas` + a list of
  `server_functions` (`call_space`, `call_model`, `call_fn`, `fetch_dataset`, …)
  exposed via `/component_server`. Execution is **client-side**: the browser
  topo-runs the DAG calling those functions per node
  (`gradio/workflow.py:1201`, `runtime: {"default": "client"}`).
- Graph model (`schema_version: 2`): `references` (inputs), `operators`
  (`kind` ∈ space/model/fn), `subjects` (outputs), `edges` (port→port).
  Multi-output operators exist (e.g. FLUX → `out_0` image, `out_1` seed).
- API machinery: `/info` ← `Blocks.get_api_info()` iterating `self.fns`
  (`gradio/blocks.py:3387`); `/call` & `/api` resolve `api_name`→`BlockFunction`
  by linear search over `self.fns` (`gradio/route_utils.py:268`); `/info` is
  cached in `app.api_info` (`gradio/routes.py:251`, populated `:723`).

## The two new pieces

### 1. Server-side execution engine (the core new capability)

There's no headless way to run a client-orchestrated DAG, so we port the
orchestration to Python: parse the graph, extract a subject's upstream sub-DAG,
topologically execute operators by `kind`, thread values along edges, and return
the subject's value.

We **refactor the cores** of `call_space`/`call_model`/`call_fn` into plain
helpers (`_run_space(space_id, endpoint, args, token)`, …) shared by both the
existing frontend server-functions and the new executor — no logic duplication,
consistent behavior.

### 2. Endpoint registration (reuses `/info` + `/call` + `/api`)

One endpoint per subject; `api_name` = slugified subject label (deduped via
`append_unique_suffix`, keyed internally by subject id); inputs = the free-input
ports of the subgraph (typed by port type); output = the subject's type.

Port-type → component map (mirrors the canvas `Component.svelte`): text→`Textbox`,
image→`Image`, audio→`Audio`, video→`Video`, 3d→`Model3D`, dataframe→`Dataframe`,
number→`Number`, boolean→`Checkbox`, gallery→`Gallery`, plot→`Plot`,
default→`Textbox`/JSON. Components are created **without rendering** into the
canvas UI; they still appear in `/info` and are callable via `/call`.

## Phases

- **Phase 0 — Spike (validate B2):** register one static endpoint for a known
  subject using explicit components; confirm it appears in `/info` and round-trips
  via `gradio_client` for text, then image. (~½ day.)
- **Phase 1 — Graph model + subgraph extraction (pure Python):** parse schema-v2,
  `upstream_subgraph(subject)`, free-input detection, port→component map. Unit
  tests against `demo/workflow/workflow.json`. No execution.
- **Phase 2 — Executor:** refactor `call_space/call_model/call_fn` cores into
  shared helpers; topo-execute a subgraph (multi-output ports mapped by
  `output_index`); reuse token resolution from injected `Request`+`OAuthToken`.
  Tests with HF calls mocked.
- **Phase 3 — Static registration at launch:** one endpoint per subject from the
  loaded graph; integration test via `gradio_client` against real `/info`+`/call`.
- **Phase 4 — Live-update on edit:** in `save_workflow`, diff subjects → add /
  remove / update `BlockFunction`s in `self.fns` and invalidate
  `app.api_info` / `app.all_app_info` so `/info` refreshes (`/call` already reads
  `self.fns` live). Tests for add/remove/rename.
- **Phase 5 — Hardening + docs:** cycles, missing-required-inputs, unknown-kind
  errors; generator/streaming spaces (return final value in v1); api_name
  collisions; changeset + docs.

## Risks / open items

- **Multi-output operators** (image+seed): executor maps edges by `output_index`.
- **File outputs:** B2 + real components handle `FileData` / `/gradio_api/file=`.
- **`self.fns` mutation during live-update** vs in-flight requests (low risk
  single-process; will note/guard).
- **api_name churn on subject rename:** old clients break; key internally by
  subject id, expose slug. Acceptable for beta; will document.
- **Auth on `/call`:** endpoint fn receives `Request`+`OAuthToken` by type hint
  (`special_args` injects them) to reuse resolution.

## Proposed file layout

- `gradio/workflow_api.py` — graph parsing, subgraph extraction, port→component
  map, executor, `register_endpoints` / `sync_endpoints`.
- Refactor shared HF-call helpers within `gradio/workflow.py`.
- Hook `register_endpoints` in `Workflow._build()`; `sync_endpoints` +
  cache-invalidate in `save_workflow`.
- Tests in `test/test_workflow_api.py`; a demo workflow with ≥2 subjects.

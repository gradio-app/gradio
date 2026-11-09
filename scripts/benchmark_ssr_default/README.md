# Benchmark: SSR by default (#14016) vs 7.0-dev vs plain FastAPI

Results are in [RESULTS.md](RESULTS.md). This folder holds the harness that produced them.

## Arms

| Arm | Gradio | `GRADIO_SSR_MODE` | Renders with |
|---|---|---|---|
| `fastapi` | – (FastAPI + uvicorn only) | – | a hand-written HTML page + `fetch` |
| `base-csr` | 7.0-dev `e6f0dd4` (merge base of #14016) | unset | client-side rendering (today's local default) |
| `base-ssr` | 7.0-dev `e6f0dd4` | `true` | SSR (what Spaces opts into today) |
| `pr-default` | #14016 `e297d03` | unset | SSR (the new default, since Node 24.22.1 is installed) |
| `pr-csr` | #14016 `e297d03` | `false` | client-side rendering |
| `main` | main `ebccfcf` (6.31.0) | unset | client-side rendering (no gateway process) |

All Gradio builds are the PR-preview wheels, installed with the same pinned
dependencies (`constraints.txt`; `main` still uses httpx, so it uses
`constraints_main.txt`, which drops only the httpx2 pins). FastAPI and uvicorn are the versions that the
Gradio wheels pull in. Analytics are off in every arm.

## Apps

- `apps/simple_gradio.py`: a textbox, a button and a textbox (`greet`). `apps/simple_fastapi.py` is the same app in plain FastAPI, with the same element ids.
- `apps/many_tabs.py`: `demo/many_tabs` (10 `gr.Tab`s with images, video, audio, a dataframe, a chatbot and more), with two `elem_id`s added for selectors.

`apps/run.py` launches an app and prints wall-clock timestamps for import, building the Blocks, and `launch()`.

## Suites (`bench.py`)

- **startup**: spawns the app 10 times per arm, interleaving arms. Measures import, build and `launch()`, time from spawn to the first `200` on `/`, the first `GET /`, and idle RSS summed over the whole process tree (app process, gateway, Node).
- **pageload**: headless Chromium (Playwright). Cold loads use a fresh profile each time (15 runs), warm loads reuse one with a primed HTTP cache (15 runs), and "throttled" loads use Lighthouse's mobile profile: 150 ms RTT, 1.6 Mbps, 4x CPU slowdown (5 runs). Recorded: TTFB, FCP, LCP, DOMContentLoaded, `load`, **interactive** (the inputs and button are mounted and visible), the first and second event round trips through the UI, the many_tabs tab switch, and bytes and requests by type.
- **http**: a 4-process aiohttp load generator. It hits `GET /`, `GET /config`, and the app's API (Gradio: `POST /gradio_api/call/greet` and then reading the SSE result; FastAPI: `POST /api/greet`). Concurrency 1 runs 300 sequential requests. 10, 50 and 100 run for 10 s each after a 2 s warm-up. It also samples server CPU and peak RSS.
- **tabs**: opens 1, 10, 25 and 50 tabs at once. With `shared`, all tabs are in one browser profile: one user, with Chrome's 6-connections-per-host limit. With `isolated`, each tab gets its own profile: many users. It times each tab until interactive, then fires one event in every tab at once.

## Running

```bash
# virtualenvs: base, pr (gradio wheels) and tools (playwright, aiohttp, psutil, huggingface_hub)
uv venv --python 3.12 .venvs/base && VIRTUAL_ENV=.venvs/base uv pip install -c constraints.txt \
  "gradio-client @ git+https://github.com/gradio-app/gradio@e6f0dd47471bb459dac110d38f5e61f62c64f498#subdirectory=client/python" \
  https://huggingface.co/buckets/gradio/pypi-previews/resolve/e6f0dd47471bb459dac110d38f5e61f62c64f498/gradio-7.0.0.dev0-py3-none-any.whl
uv venv --python 3.12 .venvs/pr && VIRTUAL_ENV=.venvs/pr uv pip install -c constraints.txt \
  "gradio-client @ git+https://github.com/gradio-app/gradio@e297d03bd0005012343511ef9cc3ba3fd5a6a900#subdirectory=client/python" \
  https://huggingface.co/buckets/gradio/pypi-previews/resolve/e297d03bd0005012343511ef9cc3ba3fd5a6a900/gradio-7.0.0.dev0-py3-none-any.whl
uv venv --python 3.12 .venvs/tools && VIRTUAL_ENV=.venvs/tools uv pip install playwright aiohttp psutil requests huggingface_hub

# local: all suites, all arms (~1 hour)
.venvs/tools/bin/python bench.py --out results/local.json

# Spaces: one private Docker Space per arm on cpu-basic, each with Node 24.22.1
.venvs/tools/bin/python spaces/deploy.py deploy --owner <you>
.venvs/tools/bin/python spaces/deploy.py wait --owner <you>
# The Hugging Face edge rate-limits each Space (HTTP 429) after a few thousand
# quick requests, so the Spaces runs use low concurrency and pauses.
.venvs/tools/bin/python spaces/deploy.py startup --owner <you> --app simple --out results/spaces-simple.json
.venvs/tools/bin/python bench.py --hf-auth --suites pageload --page-reps 10 --throttled-reps 3 \
  --out results/spaces-simple.json $(.venvs/tools/bin/python spaces/deploy.py urls --owner <you> --app simple)
.venvs/tools/bin/python bench.py --hf-auth --suites http,tabs --http-scenarios page,api --http-levels 1,10 \
  --http-count 100 --http-duration 5 --http-pause 60 --tab-counts 1,10,25 --tab-pause 45 \
  --out results/spaces-simple.json $(.venvs/tools/bin/python spaces/deploy.py urls --owner <you> --app simple)

.venvs/tools/bin/python spaces/deploy.py set-app --owner <you> --app many_tabs
.venvs/tools/bin/python spaces/deploy.py startup --owner <you> --app many_tabs --reps 2 --out results/spaces-many_tabs.json
.venvs/tools/bin/python bench.py --hf-auth --suites pageload,tabs --page-reps 5 --throttled-reps 2 \
  --tab-counts 1,10,25 --tab-pause 45 --out results/spaces-many_tabs.json \
  $(.venvs/tools/bin/python spaces/deploy.py urls --owner <you> --app many_tabs)

.venvs/tools/bin/python merge.py results/spaces.json results/spaces-simple.json results/spaces-many_tabs.json
.venvs/tools/bin/python report.py --local results/local.json --spaces results/spaces.json  # tables in RESULTS.md

# main, measured later with 7.0-dev and #14016 rerun alongside as controls
uv venv --python 3.12 .venvs/main && VIRTUAL_ENV=.venvs/main uv pip install -c constraints_main.txt \
  "gradio-client @ git+https://github.com/gradio-app/gradio@ebccfcf3194dd3cd132491a6bc35968f1321611a#subdirectory=client/python" \
  https://huggingface.co/buckets/gradio/pypi-previews/resolve/ebccfcf3194dd3cd132491a6bc35968f1321611a/gradio-6.31.0-py3-none-any.whl
.venvs/tools/bin/python bench.py --arms main,base-csr,pr-default --apps simple --http-levels 1,100 \
  --http-scenarios page,api --tab-counts 50 --tab-modes isolated --out results/local-main.json
.venvs/tools/bin/python spaces/deploy.py deploy --owner <you> --arms main
.venvs/tools/bin/python spaces/deploy.py startup --owner <you> --app simple --reps 3 --arms main,base-csr,pr-default --out results/spaces-main.json
.venvs/tools/bin/python bench.py --hf-auth --suites pageload --page-reps 10 --throttled-reps 3 --out results/spaces-main.json \
  $(.venvs/tools/bin/python spaces/deploy.py urls --owner <you> --app simple --arms main,base-csr,pr-default)
```

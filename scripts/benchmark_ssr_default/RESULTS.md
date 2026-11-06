# Results: SSR by default (#14016) vs 7.0-dev vs plain FastAPI

Five arms (see [README.md](README.md)):

- **FastAPI**: a hand-written page with the same element ids, plus a JSON endpoint.
- **7.0-dev CSR**: `e6f0dd4`, today's default.
- **7.0-dev SSR**: `GRADIO_SSR_MODE=true`, which is how Spaces runs today.
- **#14016 default**: `e297d03`; it resolves to SSR because Node 24.22.1 is installed.
- **#14016 with SSR off**.

Two apps: `simple` (textbox → button → textbox) and `many_tabs` (`demo/many_tabs`, 10 `gr.Tab`s of media and data components).

- **Local**: an M1 Pro (10 cores, 16 GB), macOS, Node 24.22.1, Python 3.12, headless Chromium (Playwright 1.64). The machine had unrelated background load, with a load average of about 10. Arms were interleaved in every suite so all of them saw the same noise. Client and server shared the machine.
- **Spaces**: one private Docker Space per arm on `cpu-basic` (2 vCPU), each with Node 24.22.1, so the PR really runs SSR. Stock Gradio-SDK Spaces ship Node 20.20.2, where #14016 falls back to CSR. The client was the same laptop over the internet.

## Key findings

**1. #14016 behaves exactly like 7.0-dev with `GRADIO_SSR_MODE=true`.** Every metric is within noise of the `base-ssr` arm, and *#14016 with SSR off* is within noise of 7.0-dev CSR. So the cost or benefit below comes from SSR itself, which this PR turns on for everyone with a patched Node.

**2. On a real network, SSR makes cold loads much faster.**

| | Cold, interactive | Cold, LCP | Warm, interactive |
|---|---|---|---|
| `simple` on Spaces | 1,013 → 587 ms (−42%) | 944 → 450 ms | 251 → 364 ms (+45%) |
| `many_tabs` on Spaces | 837 → 629 ms (−25%) | 892 → 676 ms | 318 → 441 ms (+39%) |
| `simple` on localhost | 100 → 99 ms (no change) | | |

With a primed cache, SSR is slower: each navigation re-renders HTML in Node and loads about 67 CSS files instead of 15.

**3. On slow devices (Lighthouse mobile: 150 ms RTT, 1.6 Mbps, 4x CPU), SSR is slower.**

| | 7.0-dev CSR | #14016 (SSR) |
|---|---|---|
| `simple`, localhost | 2.5 s | 4.3 s (+71%) |
| `many_tabs`, localhost | 4.8 s | 8.3 s |
| `simple`, Spaces | 2.4 s | 2.7 s |

The SSR page is 365 KB in 105 requests, against 308 KB in 43 requests for CSR. That's because SSR links every component's CSS (67 files), and on a slow link the request count dominates. One caveat for `many_tabs`: under CSR it reports "interactive" before its event dependencies have loaded. The first event then takes 2.9 s with CSR and 0.38 s with SSR, so counting until the first result, the gap is about 7.7 s vs 8.7 s.

**4. Serving the page costs more server CPU under SSR.** Every `GET /` is rendered by Node.

| `GET /`, 100 concurrent users (local) | Throughput | p50 |
|---|---|---|
| FastAPI | 5,711 req/s | 17 ms |
| CSR | 1,340 req/s | 68 ms |
| SSR (base and #14016) | 485–516 req/s, about 2.7x lower than CSR | 190–200 ms |

A single uncached page fetch takes 5.4 ms with SSR and 0.9 ms with CSR. Node also adds a process and about 130 MB of idle memory: 434 MB vs 307 MB across all processes for `simple`.

**5. 🐛 The SSR Node proxy sends `Connection: close` on every proxied request.** I confirmed it on `/config` and `/gradio_api/*`. It already happens on 7.0-dev with SSR on.
- Under sustained load it caused 6k–12k failed requests per 10 s run on `GET /config`: 502s and connection refusals once ephemeral ports ran out. That happened even at 10 concurrent clients. CSR had 0 errors.
- Cause: `js/app/proxy_index.js` calls `httpProxy.createProxyServer()` without an `agent`, and http-proxy then forces `connection: close` (`lib/http-proxy/common.js`).
- Likely fix (untested): pass `agent: new http.Agent({ keepAlive: true })`.
- This doesn't block #14016, but #14016 makes it the default path for every local app.

**6. With many concurrent users, SSR handles the burst better than CSR.**

| Many users at once (isolated browser profiles) | 7.0-dev CSR | #14016 (SSR) |
|---|---|---|
| `many_tabs`, 50 users, local: tabs interactive (p50) | 8.6 s | 5.2 s |
| `many_tabs`, 50 users, local: event round trip (p50) | 10.6 s | 1.4 s |
| `many_tabs`, 25 users, Spaces: tabs interactive (p50) | 7.8 s | 5.0 s |
| `simple`, 50 users, local: tabs interactive (p50) | 3.8 s | 2.0 s |

Single-user latency for API events is the same in every Gradio arm: 3.6–3.8 ms locally, 90–99 ms on Spaces. Throughput is capped by the default per-event queue (`concurrency_limit=1`): about 100–150 req/s, against about 4,700 for FastAPI.

**7. 🐛 Existing problem, not from this PR: with more than 6 tabs in one browser profile over HTTP/1.1, `many_tabs` never loads.** This happens locally (`http://`), on every arm.
- Each tab keeps a `/gradio_api/heartbeat/<session>` stream open.
- With 10 tabs, those streams take all 6 of Chrome's per-host connections, so `Blocks.js` and `theme.css` in the other tabs never load.
- The `simple` app opens no heartbeat, so it's fine.
- Spaces (HTTPS, HTTP/2) is fine.

**8. Startup is about the same across Gradio arms and much slower than FastAPI.**

| Spawn → first `200` | Local | Spaces (container start → listening) |
|---|---|---|
| FastAPI | 0.7 s | 1.1 s |
| 7.0-dev CSR | 7.5 s | 6.4–9.0 s |
| #14016 (SSR) | 7.9 s | 6.4–9.0 s |

- Locally, SSR adds about 0.3–0.4 s to `launch()` to start Node.
- About 3.5 s of every Gradio startup is `import gradio`.
- On Spaces, 3 restarts per arm don't separate the Gradio arms, and restart → first `200` (13–22 s) is mostly the Spaces scheduler.

### Other observations

- **Click events:** Gradio's default `trigger_mode="once"` drops a click while the previous event is still pending, and the output arrives before the event completes. The harness waits 0.5 s, untimed, between back-to-back events.
- **`.change` events on Spaces:** under Spaces latency plus throttling, a second `.change` event on `many_tabs` was never processed after 180 s. This happened on base CSR, base SSR and the PR, so `many_tabs · throttled` on Spaces has only 1–2 runs per arm (none for base SSR). It may be an `always_last` bug worth a separate look.
- **Spaces rate limits:** the Hugging Face edge rate-limits each Space (HTTP 429) after a few thousand requests in quick succession. The limit took 1–6 min to clear. So Spaces HTTP load stops at 10 concurrent users, with 60 s pauses between runs. Server-side throughput limits are in the local tables.

## Tables

All numbers are medians unless noted. Raw data: [`results/local.json`](results/local.json), [`results/spaces.json`](results/spaces.json).

#### Local: summary (simple app)

| Arm | Startup | Idle RSS | Page ready (cold) | Page ready (warm) | Page ready (slow 4G + 4x CPU) | First UI event | API latency (1 user) | API req/s (50 users) | `GET /` req/s (50 users) | 50 tabs ready (p50 / max) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 0.7 s | 60 MB | 18 ms | 17 ms | 230 ms | 6.8 ms | 0.5 ms | 4,729 | 5,677 | 262 / 281 ms |
| 7.0-dev (CSR, default) | 7.5 s | 307 MB | 100 ms | 76 ms | 2,484 ms | 30 ms | 3.6 ms | 149 | 1,402 | 3,792 / 3,903 ms |
| 7.0-dev (SSR opt-in) | 7.5 s | 435 MB | 100 ms | 85 ms | 4,258 ms | 34 ms | 3.7 ms | 140 | 512 | 1,691 / 2,786 ms |
| **#14016 (default → SSR)** | 7.9 s | 434 MB | 99 ms | 84 ms | 4,271 ms | 32 ms | 3.8 ms | 139 | 532 | 1,986 / 2,826 ms |
| #14016 (SSR off) | 7.2 s | 305 MB | 97 ms | 77 ms | 2,494 ms | 30 ms | 3.6 ms | 148 | 1,393 | 3,683 / 3,768 ms |

#### Local: startup

| App | Arm | SSR | Procs | Import | Build Blocks | launch() | Spawn → first 200 | (p90) | First `GET /` | HTML | Idle RSS (all procs) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | FastAPI | no | 1 | 549 ms | 64 ms | 28 ms | 678 ms | 695 ms | 35 ms | 1 KB | 60 MB |
| simple | 7.0-dev (CSR, default) | no | 2 | 3,629 ms | 115 ms | 3,763 ms | 7,504 ms | 7,782 ms | 56 ms | 9 KB | 307 MB |
| simple | 7.0-dev (SSR opt-in) | yes | 3 | 3,316 ms | 112 ms | 4,053 ms | 7,479 ms | 7,555 ms | 150 ms | 15 KB | 435 MB |
| simple | **#14016 (default → SSR)** | yes | 3 | 3,681 ms | 119 ms | 4,115 ms | 7,892 ms | 8,222 ms | 151 ms | 15 KB | 434 MB |
| simple | #14016 (SSR off) | no | 2 | 3,326 ms | 113 ms | 3,785 ms | 7,224 ms | 7,389 ms | 56 ms | 9 KB | 305 MB |
| many_tabs | 7.0-dev (CSR, default) | no | 3 | 3,663 ms | 266 ms | 3,903 ms | 7,833 ms | 8,039 ms | 110 ms | 190 KB | 331 MB |
| many_tabs | 7.0-dev (SSR opt-in) | yes | 4 | 3,326 ms | 255 ms | 4,340 ms | 7,891 ms | 7,994 ms | 327 ms | 15 KB | 472 MB |
| many_tabs | **#14016 (default → SSR)** | yes | 4 | 3,666 ms | 270 ms | 4,428 ms | 8,337 ms | 8,455 ms | 319 ms | 15 KB | 472 MB |
| many_tabs | #14016 (SSR off) | no | 3 | 3,329 ms | 261 ms | 3,908 ms | 7,464 ms | 7,765 ms | 108 ms | 190 KB | 331 MB |

#### Local: page load

**simple · cold** (median of 15)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 2.1 ms | 16 ms | 16 ms | 6.0 ms | 9.6 ms | 18 ms | 20 ms | 6.8 ms | 6.5 ms |
| 7.0-dev (CSR, default) | 3.1 ms | 64 ms | 100 ms | 22 ms | 36 ms | 100 ms | 108 ms | 30 ms | 20 ms |
| 7.0-dev (SSR opt-in) | 9.8 ms | 60 ms | 68 ms | 45 ms | 60 ms | 100 ms | 110 ms | 34 ms | 26 ms |
| **#14016 (default → SSR)** | 9.2 ms | 60 ms | 68 ms | 44 ms | 59 ms | 99 ms | 118 ms | 32 ms | 25 ms |
| #14016 (SSR off) | 2.5 ms | 64 ms | 100 ms | 21 ms | 34 ms | 97 ms | 107 ms | 30 ms | 19 ms |

**simple · warm** (median of 15)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1.6 ms | 16 ms | 16 ms | 5.4 ms | 8.8 ms | 17 ms | 18 ms | 7.8 ms | 6.9 ms |
| 7.0-dev (CSR, default) | 2.3 ms | 48 ms | 68 ms | 13 ms | 21 ms | 76 ms | 82 ms | 28 ms | 19 ms |
| 7.0-dev (SSR opt-in) | 8.0 ms | 52 ms | 52 ms | 35 ms | 45 ms | 85 ms | 106 ms | 30 ms | 24 ms |
| **#14016 (default → SSR)** | 7.4 ms | 52 ms | 52 ms | 35 ms | 45 ms | 84 ms | 92 ms | 30 ms | 26 ms |
| #14016 (SSR off) | 2.3 ms | 48 ms | 68 ms | 13 ms | 21 ms | 77 ms | 82 ms | 25 ms | 21 ms |

**simple · throttled** (median of 5)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 4.0 ms | 212 ms | 212 ms | 202 ms | 202 ms | 230 ms | 237 ms | 184 ms | 192 ms |
| 7.0-dev (CSR, default) | 7.3 ms | 1,620 ms | 2,016 ms | 741 ms | 1,314 ms | 2,484 ms | 2,504 ms | 378 ms | 347 ms |
| 7.0-dev (SSR opt-in) | 18 ms | 2,276 ms | 2,284 ms | 2,271 ms | 3,710 ms | 4,258 ms | 4,292 ms | 376 ms | 351 ms |
| **#14016 (default → SSR)** | 18 ms | 2,272 ms | 2,288 ms | 2,271 ms | 3,723 ms | 4,271 ms | 4,293 ms | 380 ms | 344 ms |
| #14016 (SSR off) | 6.5 ms | 1,628 ms | 2,016 ms | 735 ms | 1,285 ms | 2,494 ms | 2,506 ms | 375 ms | 353 ms |

**many_tabs · cold** (median of 15)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event | Switch to Video tab |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 15 ms | 76 ms | 204 ms | 34 ms | 47 ms | 175 ms | 186 ms | 30 ms | 19 ms | 15 ms |
| 7.0-dev (SSR opt-in) | 36 ms | 84 ms | 216 ms | 70 ms | 84 ms | 207 ms | 263 ms | 32 ms | 24 ms | 14 ms |
| **#14016 (default → SSR)** | 34 ms | 84 ms | 224 ms | 68 ms | 83 ms | 204 ms | 219 ms | 31 ms | 26 ms | 14 ms |
| #14016 (SSR off) | 14 ms | 76 ms | 208 ms | 35 ms | 47 ms | 170 ms | 183 ms | 28 ms | 19 ms | 14 ms |

**many_tabs · warm** (median of 15)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 13 ms | 60 ms | 172 ms | 31 ms | 36 ms | 162 ms | 170 ms | 26 ms | 21 ms |
| 7.0-dev (SSR opt-in) | 31 ms | 76 ms | 200 ms | 59 ms | 68 ms | 190 ms | 198 ms | 29 ms | 25 ms |
| **#14016 (default → SSR)** | 32 ms | 76 ms | 204 ms | 59 ms | 69 ms | 192 ms | 202 ms | 29 ms | 26 ms |
| #14016 (SSR off) | 13 ms | 60 ms | 172 ms | 31 ms | 35 ms | 161 ms | 166 ms | 26 ms | 21 ms |

**many_tabs · throttled** (median of 5)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event | Switch to Video tab |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 19 ms | 2,556 ms | 4,696 ms | 1,665 ms | 2,229 ms | 4,800 ms | 4,813 ms | 2,943 ms | 365 ms | 47 ms |
| 7.0-dev (SSR opt-in) | 44 ms | 2,288 ms | 5,428 ms | 2,276 ms | 3,702 ms | 8,310 ms | 8,323 ms | 383 ms | 357 ms | 48 ms |
| **#14016 (default → SSR)** | 44 ms | 2,280 ms | 5,432 ms | 2,276 ms | 3,731 ms | 8,320 ms | 8,345 ms | 382 ms | 362 ms | 48 ms |
| #14016 (SSR off) | 19 ms | 2,552 ms | 4,700 ms | 1,664 ms | 2,244 ms | 4,811 ms | 4,816 ms | 2,924 ms | 353 ms | 47 ms |

#### Local: bytes on a cold load

| App | Arm | Requests | Transferred | Decoded | HTML | JS (files / transferred) | CSS (files / transferred) |
|---|---:|---:|---:|---:|---:|---:|---:|
| simple | FastAPI | 1.0 | 1 KB | 1 KB | 1 KB | 0.0 / 0 KB | 0.0 / 0 KB |
| simple | 7.0-dev (CSR, default) | 42 | 308 KB | 670 KB | 10 KB | 24 / 166 KB | 15 / 27 KB |
| simple | 7.0-dev (SSR opt-in) | 105 | 365 KB | 970 KB | 15 KB | 33 / 154 KB | 67 / 85 KB |
| simple | **#14016 (default → SSR)** | 105 | 365 KB | 970 KB | 15 KB | 33 / 154 KB | 67 / 85 KB |
| simple | #14016 (SSR off) | 42 | 308 KB | 670 KB | 10 KB | 24 / 166 KB | 15 / 27 KB |
| many_tabs | 7.0-dev (CSR, default) | 120 | 1,057 KB | 2,633 KB | 190 KB | 70 / 700 KB | 47 / 60 KB |
| many_tabs | 7.0-dev (SSR opt-in) | 167 | 1,010 KB | 2,852 KB | 15 KB | 79 / 608 KB | 83 / 95 KB |
| many_tabs | **#14016 (default → SSR)** | 167 | 1,010 KB | 2,853 KB | 15 KB | 79 / 608 KB | 83 / 95 KB |
| many_tabs | #14016 (SSR off) | 120 | 1,057 KB | 2,633 KB | 190 KB | 70 / 700 KB | 47 / 60 KB |

#### Local: HTTP load

**`GET /` (the HTML document)**

| Arm | Concurrency | req/s | p50 | p90 | p99 | Errors | Server CPU (cores) |
|---|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1 | 503 | 0.4 ms | 0.5 ms | 0.6 ms | 0 | 0.1 |
| FastAPI | 10 | 5,301 | 1.8 ms | 2.3 ms | 2.9 ms | 0 | 1.0 |
| FastAPI | 50 | 5,677 | 8.5 ms | 9.8 ms | 18 ms | 0 | 1.0 |
| FastAPI | 100 | 5,711 | 17 ms | 19 ms | 28 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 1 | 440 | 0.9 ms | 1.0 ms | 1.2 ms | 0 | 0.3 |
| 7.0-dev (CSR, default) | 10 | 1,422 | 6.8 ms | 8.3 ms | 11 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 50 | 1,402 | 33 ms | 41 ms | 74 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 100 | 1,340 | 68 ms | 105 ms | 124 ms | 0 | 1.0 |
| 7.0-dev (SSR opt-in) | 1 | 149 | 5.2 ms | 6.2 ms | 9.7 ms | 0 | 0.9 |
| 7.0-dev (SSR opt-in) | 10 | 477 | 21 ms | 24 ms | 28 ms | 0 | 1.8 |
| 7.0-dev (SSR opt-in) | 50 | 512 | 95 ms | 122 ms | 140 ms | 0 | 1.7 |
| 7.0-dev (SSR opt-in) | 100 | 485 | 198 ms | 240 ms | 257 ms | 0 | 1.7 |
| **#14016 (default → SSR)** | 1 | 141 | 5.4 ms | 6.5 ms | 11 ms | 0 | 0.9 |
| **#14016 (default → SSR)** | 10 | 467 | 21 ms | 25 ms | 33 ms | 0 | 1.8 |
| **#14016 (default → SSR)** | 50 | 532 | 91 ms | 120 ms | 139 ms | 0 | 1.7 |
| **#14016 (default → SSR)** | 100 | 516 | 187 ms | 226 ms | 246 ms | 0 | 1.7 |
| #14016 (SSR off) | 1 | 416 | 0.9 ms | 1.0 ms | 2.9 ms | 0 | 0.3 |
| #14016 (SSR off) | 10 | 1,389 | 6.8 ms | 8.5 ms | 13 ms | 0 | 1.0 |
| #14016 (SSR off) | 50 | 1,393 | 33 ms | 42 ms | 75 ms | 0 | 1.0 |
| #14016 (SSR off) | 100 | 1,361 | 68 ms | 105 ms | 119 ms | 0 | 1.0 |

**`GET /config` (Python route)**

| Arm | Concurrency | req/s | p50 | p90 | p99 | Errors | Server CPU (cores) |
|---|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 1 | 407 | 0.9 ms | 1.1 ms | 2.0 ms | 0 | 0.3 |
| 7.0-dev (CSR, default) | 10 | 1,688 | 5.8 ms | 7.1 ms | 8.5 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 50 | 1,686 | 28 ms | 32 ms | 68 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 100 | 1,605 | 60 ms | 66 ms | 107 ms | 0 | 1.0 |
| 7.0-dev (SSR opt-in) | 1 | 333 | 1.5 ms | 1.9 ms | 3.1 ms | 0 | 0.4 |
| 7.0-dev (SSR opt-in) | 10 | 780 | 7.3 ms | 9.1 ms | 48 ms | 6236 | 1.0 |
| 7.0-dev (SSR opt-in) | 50 | 419 | 34 ms | 314 ms | 826 ms | 12340 | 0.5 |
| 7.0-dev (SSR opt-in) | 100 | 860 | 70 ms | 107 ms | 1,322 ms | 5756 | 0.8 |
| **#14016 (default → SSR)** | 1 | 338 | 1.5 ms | 1.8 ms | 2.2 ms | 0 | 0.4 |
| **#14016 (default → SSR)** | 10 | 708 | 7.3 ms | 9.5 ms | 52 ms | 7165 | 1.0 |
| **#14016 (default → SSR)** | 50 | 428 | 33 ms | 360 ms | 808 ms | 11953 | 0.5 |
| **#14016 (default → SSR)** | 100 | 818 | 70 ms | 106 ms | 1,236 ms | 6866 | 0.7 |
| #14016 (SSR off) | 1 | 478 | 0.8 ms | 0.9 ms | 1.2 ms | 0 | 0.3 |
| #14016 (SSR off) | 10 | 1,656 | 5.9 ms | 7.2 ms | 9.1 ms | 0 | 1.0 |
| #14016 (SSR off) | 50 | 1,680 | 29 ms | 32 ms | 68 ms | 0 | 1.0 |
| #14016 (SSR off) | 100 | 1,639 | 58 ms | 64 ms | 102 ms | 0 | 1.0 |

**API call (Gradio: `POST /gradio_api/call/greet` + SSE result; FastAPI: `POST /api/greet`)**

| Arm | Concurrency | req/s | p50 | p90 | p99 | Errors | Server CPU (cores) |
|---|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1 | 570 | 0.5 ms | 0.6 ms | 0.8 ms | 0 | 0.2 |
| FastAPI | 10 | 4,332 | 2.2 ms | 2.7 ms | 3.8 ms | 0 | 1.0 |
| FastAPI | 50 | 4,729 | 10 ms | 12 ms | 20 ms | 0 | 1.0 |
| FastAPI | 100 | 4,703 | 21 ms | 24 ms | 32 ms | 0 | 1.0 |
| 7.0-dev (CSR, default) | 1 | 189 | 3.6 ms | 4.0 ms | 5.5 ms | 0 | 0.7 |
| 7.0-dev (CSR, default) | 10 | 225 | 43 ms | 51 ms | 85 ms | 0 | 1.1 |
| 7.0-dev (CSR, default) | 50 | 149 | 334 ms | 352 ms | 399 ms | 0 | 1.1 |
| 7.0-dev (CSR, default) | 100 | 101 | 983 ms | 1,078 ms | 1,127 ms | 0 | 1.1 |
| 7.0-dev (SSR opt-in) | 1 | 184 | 3.7 ms | 4.2 ms | 7.2 ms | 0 | 0.9 |
| 7.0-dev (SSR opt-in) | 10 | 212 | 46 ms | 53 ms | 70 ms | 0 | 1.3 |
| 7.0-dev (SSR opt-in) | 50 | 140 | 361 ms | 379 ms | 412 ms | 0 | 1.2 |
| 7.0-dev (SSR opt-in) | 100 | 100 | 990 ms | 1,051 ms | 1,135 ms | 0 | 1.2 |
| **#14016 (default → SSR)** | 1 | 178 | 3.8 ms | 4.3 ms | 6.6 ms | 0 | 0.9 |
| **#14016 (default → SSR)** | 10 | 209 | 47 ms | 53 ms | 84 ms | 0 | 1.4 |
| **#14016 (default → SSR)** | 50 | 139 | 356 ms | 381 ms | 412 ms | 0 | 1.2 |
| **#14016 (default → SSR)** | 100 | 99 | 993 ms | 1,069 ms | 1,089 ms | 0 | 1.2 |
| #14016 (SSR off) | 1 | 197 | 3.6 ms | 4.0 ms | 5.0 ms | 0 | 0.7 |
| #14016 (SSR off) | 10 | 228 | 43 ms | 50 ms | 60 ms | 0 | 1.1 |
| #14016 (SSR off) | 50 | 148 | 333 ms | 370 ms | 391 ms | 0 | 1.1 |
| #14016 (SSR off) | 100 | 106 | 942 ms | 992 ms | 1,015 ms | 0 | 1.1 |

#### Local: many browser tabs

| App | Profiles | Tabs | Arm | Ready p50 | Ready max | All ready | Event p50 | Event max | Failures | Server CPU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | shared | 1 | FastAPI | 70 ms | 70 ms | 0.1 s | 12 ms | 12 ms | 0 | 0.0 s |
| simple | shared | 1 | 7.0-dev (CSR, default) | 165 ms | 165 ms | 0.2 s | 30 ms | 30 ms | 0 | 0.1 s |
| simple | shared | 1 | 7.0-dev (SSR opt-in) | 115 ms | 115 ms | 0.1 s | 28 ms | 28 ms | 0 | 0.1 s |
| simple | shared | 1 | **#14016 (default → SSR)** | 106 ms | 106 ms | 0.1 s | 26 ms | 26 ms | 0 | 0.1 s |
| simple | shared | 1 | #14016 (SSR off) | 99 ms | 99 ms | 0.1 s | 13 ms | 13 ms | 0 | 0.1 s |
| simple | shared | 10 | FastAPI | 66 ms | 67 ms | 0.1 s | 9.4 ms | 12 ms | 0 | 0.0 s |
| simple | shared | 10 | 7.0-dev (CSR, default) | 263 ms | 312 ms | 0.3 s | 93 ms | 121 ms | 0 | 0.2 s |
| simple | shared | 10 | 7.0-dev (SSR opt-in) | 253 ms | 405 ms | 0.4 s | 112 ms | 134 ms | 0 | 0.5 s |
| simple | shared | 10 | **#14016 (default → SSR)** | 265 ms | 402 ms | 0.4 s | 113 ms | 140 ms | 0 | 0.5 s |
| simple | shared | 10 | #14016 (SSR off) | 296 ms | 318 ms | 0.3 s | 112 ms | 132 ms | 0 | 0.2 s |
| simple | shared | 25 | FastAPI | 139 ms | 142 ms | 0.2 s | 12 ms | 18 ms | 0 | 0.0 s |
| simple | shared | 25 | 7.0-dev (CSR, default) | 486 ms | 723 ms | 0.7 s | 313 ms | 412 ms | 0 | 0.5 s |
| simple | shared | 25 | 7.0-dev (SSR opt-in) | 692 ms | 1,120 ms | 1.1 s | 364 ms | 489 ms | 0 | 1.2 s |
| simple | shared | 25 | **#14016 (default → SSR)** | 581 ms | 1,034 ms | 1.1 s | 444 ms | 534 ms | 0 | 1.1 s |
| simple | shared | 25 | #14016 (SSR off) | 575 ms | 741 ms | 0.8 s | 321 ms | 411 ms | 0 | 0.5 s |
| simple | shared | 50 | FastAPI | 284 ms | 298 ms | 0.3 s | 21 ms | 31 ms | 0 | 0.1 s |
| simple | shared | 50 | 7.0-dev (CSR, default) | 1,214 ms | 1,556 ms | 1.6 s | 1,012 ms | 1,600 ms | 0 | 1.2 s |
| simple | shared | 50 | 7.0-dev (SSR opt-in) | 975 ms | 2,162 ms | 2.2 s | 1,671 ms | 1,869 ms | 0 | 2.4 s |
| simple | shared | 50 | **#14016 (default → SSR)** | 1,095 ms | 2,098 ms | 2.1 s | 1,025 ms | 1,464 ms | 0 | 2.2 s |
| simple | shared | 50 | #14016 (SSR off) | 1,447 ms | 1,454 ms | 1.5 s | 887 ms | 1,363 ms | 0 | 1.1 s |
| simple | isolated | 1 | FastAPI | 17 ms | 17 ms | 0.0 s | 3.5 ms | 3.5 ms | 0 | 0.0 s |
| simple | isolated | 1 | 7.0-dev (CSR, default) | 102 ms | 102 ms | 0.1 s | 14 ms | 14 ms | 0 | 0.1 s |
| simple | isolated | 1 | 7.0-dev (SSR opt-in) | 101 ms | 101 ms | 0.1 s | 29 ms | 29 ms | 0 | 0.1 s |
| simple | isolated | 1 | **#14016 (default → SSR)** | 97 ms | 97 ms | 0.1 s | 21 ms | 21 ms | 0 | 0.1 s |
| simple | isolated | 1 | #14016 (SSR off) | 154 ms | 154 ms | 0.2 s | 22 ms | 22 ms | 0 | 0.1 s |
| simple | isolated | 10 | FastAPI | 55 ms | 57 ms | 0.1 s | 6.0 ms | 6.4 ms | 0 | 0.0 s |
| simple | isolated | 10 | 7.0-dev (CSR, default) | 618 ms | 631 ms | 0.6 s | 116 ms | 136 ms | 0 | 0.7 s |
| simple | isolated | 10 | 7.0-dev (SSR opt-in) | 410 ms | 550 ms | 0.6 s | 124 ms | 144 ms | 0 | 1.0 s |
| simple | isolated | 10 | **#14016 (default → SSR)** | 446 ms | 572 ms | 0.6 s | 127 ms | 148 ms | 0 | 1.0 s |
| simple | isolated | 10 | #14016 (SSR off) | 647 ms | 657 ms | 0.7 s | 99 ms | 120 ms | 0 | 0.8 s |
| simple | isolated | 25 | FastAPI | 182 ms | 185 ms | 0.2 s | 10 ms | 18 ms | 0 | 0.0 s |
| simple | isolated | 25 | 7.0-dev (CSR, default) | 1,637 ms | 1,672 ms | 1.7 s | 385 ms | 481 ms | 0 | 1.9 s |
| simple | isolated | 25 | 7.0-dev (SSR opt-in) | 797 ms | 1,501 ms | 1.5 s | 641 ms | 794 ms | 0 | 2.2 s |
| simple | isolated | 25 | **#14016 (default → SSR)** | 1,886 ms | 2,100 ms | 2.1 s | 485 ms | 552 ms | 0 | 2.1 s |
| simple | isolated | 25 | #14016 (SSR off) | 1,794 ms | 1,858 ms | 1.9 s | 551 ms | 617 ms | 0 | 2.0 s |
| simple | isolated | 50 | FastAPI | 262 ms | 281 ms | 0.3 s | 26 ms | 31 ms | 0 | 0.1 s |
| simple | isolated | 50 | 7.0-dev (CSR, default) | 3,792 ms | 3,903 ms | 3.9 s | 1,038 ms | 1,170 ms | 0 | 4.2 s |
| simple | isolated | 50 | 7.0-dev (SSR opt-in) | 1,691 ms | 2,786 ms | 2.8 s | 1,083 ms | 1,208 ms | 0 | 4.3 s |
| simple | isolated | 50 | **#14016 (default → SSR)** | 1,986 ms | 2,826 ms | 2.9 s | 1,099 ms | 1,294 ms | 0 | 4.1 s |
| simple | isolated | 50 | #14016 (SSR off) | 3,683 ms | 3,768 ms | 3.8 s | 911 ms | 1,095 ms | 0 | 4.1 s |
| many_tabs | shared | 1 | 7.0-dev (CSR, default) | 207 ms | 207 ms | 0.2 s | 26 ms | 26 ms | 0 | 0.2 s |
| many_tabs | shared | 1 | 7.0-dev (SSR opt-in) | 221 ms | 221 ms | 0.2 s | 27 ms | 27 ms | 0 | 0.2 s |
| many_tabs | shared | 1 | **#14016 (default → SSR)** | 221 ms | 221 ms | 0.2 s | 30 ms | 30 ms | 0 | 0.2 s |
| many_tabs | shared | 1 | #14016 (SSR off) | 190 ms | 190 ms | 0.2 s | 61 ms | 61 ms | 0 | 0.2 s |
| many_tabs | shared | 10 | 7.0-dev (CSR, default) | – | – | 120 s | – | – | 10 | 7.2 s |
| many_tabs | shared | 10 | 7.0-dev (SSR opt-in) | 471 ms | 858 ms | 121 s | – | – | 10 | 14 s |
| many_tabs | shared | 10 | **#14016 (default → SSR)** | 512 ms | 965 ms | 121 s | – | – | 10 | 14 s |
| many_tabs | shared | 10 | #14016 (SSR off) | – | – | 120 s | – | – | 10 | 7.5 s |
| many_tabs | shared | 25 | 7.0-dev (CSR, default) | – | – | 121 s | – | – | 25 | 5.1 s |
| many_tabs | shared | 25 | 7.0-dev (SSR opt-in) | 516 ms | 1,640 ms | 121 s | – | – | 25 | 13 s |
| many_tabs | shared | 25 | **#14016 (default → SSR)** | 460 ms | 1,573 ms | 121 s | – | – | 25 | 12 s |
| many_tabs | shared | 25 | #14016 (SSR off) | – | – | 121 s | – | – | 25 | 4.7 s |
| many_tabs | shared | 50 | 7.0-dev (CSR, default) | – | – | 122 s | – | – | 50 | 6.3 s |
| many_tabs | shared | 50 | 7.0-dev (SSR opt-in) | 509 ms | 3,008 ms | 123 s | – | – | 50 | 12 s |
| many_tabs | shared | 50 | **#14016 (default → SSR)** | 539 ms | 2,834 ms | 123 s | – | – | 50 | 14 s |
| many_tabs | shared | 50 | #14016 (SSR off) | – | – | 122 s | – | – | 50 | 5.7 s |
| many_tabs | isolated | 1 | 7.0-dev (CSR, default) | 176 ms | 176 ms | 0.2 s | 24 ms | 24 ms | 0 | 0.2 s |
| many_tabs | isolated | 1 | 7.0-dev (SSR opt-in) | 204 ms | 204 ms | 0.2 s | 18 ms | 18 ms | 0 | 0.2 s |
| many_tabs | isolated | 1 | **#14016 (default → SSR)** | 207 ms | 207 ms | 0.2 s | 19 ms | 19 ms | 0 | 0.2 s |
| many_tabs | isolated | 1 | #14016 (SSR off) | 235 ms | 235 ms | 0.2 s | 28 ms | 28 ms | 0 | 0.2 s |
| many_tabs | isolated | 10 | 7.0-dev (CSR, default) | 1,176 ms | 1,241 ms | 1.2 s | 688 ms | 718 ms | 0 | 2.0 s |
| many_tabs | isolated | 10 | 7.0-dev (SSR opt-in) | 1,131 ms | 1,207 ms | 1.2 s | 136 ms | 156 ms | 0 | 1.8 s |
| many_tabs | isolated | 10 | **#14016 (default → SSR)** | 1,224 ms | 1,277 ms | 1.3 s | 126 ms | 156 ms | 0 | 1.8 s |
| many_tabs | isolated | 10 | #14016 (SSR off) | 1,191 ms | 1,268 ms | 1.3 s | 700 ms | 759 ms | 0 | 2.0 s |
| many_tabs | isolated | 25 | 7.0-dev (CSR, default) | 4,603 ms | 4,794 ms | 4.8 s | 4,169 ms | 4,316 ms | 0 | 6.2 s |
| many_tabs | isolated | 25 | 7.0-dev (SSR opt-in) | 2,438 ms | 3,215 ms | 3.2 s | 648 ms | 774 ms | 0 | 4.4 s |
| many_tabs | isolated | 25 | **#14016 (default → SSR)** | 3,443 ms | 3,832 ms | 3.9 s | 491 ms | 567 ms | 0 | 4.1 s |
| many_tabs | isolated | 25 | #14016 (SSR off) | 3,512 ms | 3,633 ms | 3.7 s | 2,536 ms | 2,640 ms | 0 | 5.6 s |
| many_tabs | isolated | 50 | 7.0-dev (CSR, default) | 8,559 ms | 9,318 ms | 9.3 s | 10,628 ms | 11,042 ms | 0 | 14 s |
| many_tabs | isolated | 50 | 7.0-dev (SSR opt-in) | 4,879 ms | 5,978 ms | 6.0 s | 1,190 ms | 1,588 ms | 0 | 8.1 s |
| many_tabs | isolated | 50 | **#14016 (default → SSR)** | 5,203 ms | 6,158 ms | 6.2 s | 1,386 ms | 1,824 ms | 0 | 8.3 s |
| many_tabs | isolated | 50 | #14016 (SSR off) | 8,105 ms | 8,357 ms | 8.4 s | 9,860 ms | 10,298 ms | 0 | 13 s |

#### Spaces: summary (simple app)

| Arm | Startup | Idle RSS | Page ready (cold) | Page ready (warm) | Page ready (slow 4G + 4x CPU) | First UI event | API latency (1 user) | API req/s (10 users) | `GET /` req/s (10 users) | 25 tabs ready (p50 / max) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1.1 s | – | 95 ms | 60 ms | 254 ms | 53 ms | 44 ms | 165 | 152 | 225 / 235 ms |
| 7.0-dev (CSR, default) | 9.0 s | – | 1,013 ms | 251 ms | 2,411 ms | 75 ms | 90 ms | 89 | 145 | 2,808 / 3,122 ms |
| 7.0-dev (SSR opt-in) | 6.5 s | – | 536 ms | 333 ms | 2,724 ms | 72 ms | 97 ms | 85 | 136 | 2,029 / 2,391 ms |
| **#14016 (default → SSR)** | 8.3 s | – | 587 ms | 364 ms | 2,722 ms | 76 ms | 99 ms | 71 | 121 | 2,654 / 2,725 ms |
| #14016 (SSR off) | 6.4 s | – | 1,014 ms | 283 ms | 2,359 ms | 66 ms | 91 ms | 94 | 192 | 2,175 / 2,458 ms |

#### Spaces: startup

| App | Arm | SSR | Runs | Import | Build Blocks | launch() | Container start → listening | Restart API call → first 200 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | FastAPI | no | 3 | 1,042 ms | 32 ms | 17 ms | 1,095 ms | 13 s |
| simple | 7.0-dev (CSR, default) | no | 3 | 4,290 ms | 160 ms | 4,456 ms | 8,967 ms | 22 s |
| simple | 7.0-dev (SSR opt-in) | yes | 3 | 3,004 ms | 125 ms | 3,458 ms | 6,547 ms | 16 s |
| simple | **#14016 (default → SSR)** | yes | 3 | 3,560 ms | 144 ms | 4,589 ms | 8,333 ms | 19 s |
| simple | #14016 (SSR off) | no | 3 | 3,100 ms | 123 ms | 3,208 ms | 6,431 ms | 16 s |
| many_tabs | 7.0-dev (CSR, default) | no | 2 | 4,115 ms | 442 ms | 4,759 ms | 9,316 ms | 22 s |
| many_tabs | 7.0-dev (SSR opt-in) | yes | 2 | 3,882 ms | 501 ms | 5,421 ms | 9,804 ms | 21 s |
| many_tabs | **#14016 (default → SSR)** | yes | 2 | 3,924 ms | 461 ms | 4,719 ms | 8,607 ms | 19 s |
| many_tabs | #14016 (SSR off) | no | 2 | 3,728 ms | 446 ms | 3,705 ms | 7,879 ms | 20 s |

#### Spaces: page load

**simple · cold** (median of 10)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 77 ms | 96 ms | 96 ms | 82 ms | 86 ms | 95 ms | 113 ms | 53 ms | 54 ms |
| 7.0-dev (CSR, default) | 108 ms | 386 ms | 944 ms | 234 ms | 349 ms | 1,013 ms | 1,183 ms | 75 ms | 58 ms |
| 7.0-dev (SSR opt-in) | 142 ms | 352 ms | 422 ms | 352 ms | 405 ms | 536 ms | 774 ms | 72 ms | 62 ms |
| **#14016 (default → SSR)** | 146 ms | 366 ms | 450 ms | 368 ms | 445 ms | 587 ms | 704 ms | 76 ms | 63 ms |
| #14016 (SSR off) | 77 ms | 370 ms | 952 ms | 204 ms | 331 ms | 1,014 ms | 1,082 ms | 66 ms | 59 ms |

**simple · warm** (median of 10)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 42 ms | 60 ms | 60 ms | 47 ms | 51 ms | 60 ms | 105 ms | 55 ms | 53 ms |
| 7.0-dev (CSR, default) | 52 ms | 102 ms | 242 ms | 69 ms | 76 ms | 251 ms | 292 ms | 66 ms | 60 ms |
| 7.0-dev (SSR opt-in) | 59 ms | 126 ms | 138 ms | 123 ms | 123 ms | 333 ms | 363 ms | 76 ms | 60 ms |
| **#14016 (default → SSR)** | 75 ms | 198 ms | 214 ms | 196 ms | 196 ms | 364 ms | 412 ms | 81 ms | 68 ms |
| #14016 (SSR off) | 47 ms | 96 ms | 274 ms | 60 ms | 69 ms | 283 ms | 322 ms | 78 ms | 58 ms |

**simple · throttled** (median of 3)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 69 ms | 256 ms | 256 ms | 210 ms | 225 ms | 254 ms | 298 ms | 177 ms | 176 ms |
| 7.0-dev (CSR, default) | 78 ms | 1,556 ms | 2,112 ms | 766 ms | 1,134 ms | 2,411 ms | 2,562 ms | 211 ms | 185 ms |
| 7.0-dev (SSR opt-in) | 105 ms | 1,908 ms | 2,012 ms | 1,898 ms | 2,755 ms | 2,724 ms | 2,733 ms | 211 ms | 191 ms |
| **#14016 (default → SSR)** | 138 ms | 1,896 ms | 2,012 ms | 1,897 ms | 2,739 ms | 2,722 ms | 2,731 ms | 206 ms | 189 ms |
| #14016 (SSR off) | 78 ms | 1,560 ms | 2,060 ms | 756 ms | 1,171 ms | 2,359 ms | 2,510 ms | 208 ms | 188 ms |

**many_tabs · cold** (median of 5)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event | Switch to Video tab |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 122 ms | 372 ms | 892 ms | 216 ms | 334 ms | 837 ms | 1,112 ms | 72 ms | 62 ms | 17 ms |
| 7.0-dev (SSR opt-in) | 160 ms | 312 ms | 636 ms | 309 ms | 366 ms | 582 ms | 710 ms | 71 ms | 58 ms | 18 ms |
| **#14016 (default → SSR)** | 176 ms | 336 ms | 676 ms | 335 ms | 380 ms | 629 ms | 666 ms | 78 ms | 60 ms | 18 ms |
| #14016 (SSR off) | 122 ms | 364 ms | 908 ms | 211 ms | 324 ms | 799 ms | 1,124 ms | 70 ms | 61 ms | 17 ms |

**many_tabs · warm** (median of 5)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 83 ms | 136 ms | 328 ms | 105 ms | 109 ms | 318 ms | 330 ms | 79 ms | 57 ms |
| 7.0-dev (SSR opt-in) | 101 ms | 168 ms | 420 ms | 166 ms | 166 ms | 410 ms | 502 ms | 70 ms | 61 ms |
| **#14016 (default → SSR)** | 119 ms | 188 ms | 448 ms | 177 ms | 178 ms | 441 ms | 504 ms | 77 ms | 62 ms |
| #14016 (SSR off) | 74 ms | 128 ms | 320 ms | 100 ms | 104 ms | 307 ms | 319 ms | 72 ms | 56 ms |

**many_tabs · throttled** (median of 1)

| Arm | TTFB | FCP | LCP | DOMContentLoaded | load | **Interactive** | (p90) | 1st event | 2nd event | Switch to Video tab |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 7.0-dev (CSR, default) | 131 ms | 2,520 ms | 4,216 ms | 1,724 ms | 2,146 ms | 4,397 ms | 4,397 ms | 284 ms | 234 ms | 1,586 ms |
| 7.0-dev (SSR opt-in) | – | – | – | – | – | – | – | – | – | – |
| **#14016 (default → SSR)** | 205 ms | 1,936 ms | 4,536 ms | 1,937 ms | 2,976 ms | 4,722 ms | 4,722 ms | 269 ms | 237 ms | 868 ms |
| #14016 (SSR off) | 159 ms | 2,528 ms | 4,398 ms | 1,725 ms | 2,148 ms | 4,412 ms | 4,512 ms | 287 ms | 247 ms | 1,603 ms |

#### Spaces: bytes on a cold load

| App | Arm | Requests | Transferred | Decoded | HTML | JS (files / transferred) | CSS (files / transferred) |
|---|---:|---:|---:|---:|---:|---:|---:|
| simple | FastAPI | 1.0 | 1 KB | 1 KB | 1 KB | 0.0 / 0 KB | 0.0 / 0 KB |
| simple | 7.0-dev (CSR, default) | 43 | 308 KB | 670 KB | 10 KB | 24 / 166 KB | 15 / 27 KB |
| simple | 7.0-dev (SSR opt-in) | 105 | 365 KB | 970 KB | 15 KB | 33 / 154 KB | 67 / 85 KB |
| simple | **#14016 (default → SSR)** | 105 | 365 KB | 970 KB | 15 KB | 33 / 154 KB | 67 / 85 KB |
| simple | #14016 (SSR off) | 43 | 308 KB | 671 KB | 10 KB | 24 / 166 KB | 15 / 27 KB |
| many_tabs | 7.0-dev (CSR, default) | 121 | 1,058 KB | 2,634 KB | 191 KB | 70 / 700 KB | 47 / 60 KB |
| many_tabs | 7.0-dev (SSR opt-in) | 167 | 1,011 KB | 2,854 KB | 15 KB | 79 / 608 KB | 83 / 95 KB |
| many_tabs | **#14016 (default → SSR)** | 167 | 1,012 KB | 2,854 KB | 15 KB | 79 / 608 KB | 83 / 95 KB |
| many_tabs | #14016 (SSR off) | 121 | 1,058 KB | 2,634 KB | 191 KB | 70 / 700 KB | 47 / 60 KB |

#### Spaces: HTTP load

**`GET /` (the HTML document)**

| Arm | Concurrency | req/s | p50 | p90 | p99 | Errors | Server CPU (cores) |
|---|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1 | 18 | 42 ms | 87 ms | 133 ms | 0 | – |
| FastAPI | 10 | 152 | 48 ms | 126 ms | 177 ms | 0 | – |
| 7.0-dev (CSR, default) | 1 | 13 | 51 ms | 123 ms | 179 ms | 0 | – |
| 7.0-dev (CSR, default) | 10 | 145 | 59 ms | 114 ms | 160 ms | 0 | – |
| 7.0-dev (SSR opt-in) | 1 | 14 | 61 ms | 71 ms | 158 ms | 0 | – |
| 7.0-dev (SSR opt-in) | 10 | 136 | 69 ms | 86 ms | 158 ms | 0 | – |
| **#14016 (default → SSR)** | 1 | 13 | 67 ms | 84 ms | 154 ms | 0 | – |
| **#14016 (default → SSR)** | 10 | 121 | 81 ms | 101 ms | 164 ms | 0 | – |
| #14016 (SSR off) | 1 | 18 | 47 ms | 55 ms | 127 ms | 0 | – |
| #14016 (SSR off) | 10 | 192 | 50 ms | 61 ms | 99 ms | 0 | – |

**API call (Gradio: `POST /gradio_api/call/greet` + SSE result; FastAPI: `POST /api/greet`)**

| Arm | Concurrency | req/s | p50 | p90 | p99 | Errors | Server CPU (cores) |
|---|---:|---:|---:|---:|---:|---:|---:|
| FastAPI | 1 | 17 | 44 ms | 96 ms | 135 ms | 0 | – |
| FastAPI | 10 | 165 | 47 ms | 114 ms | 159 ms | 0 | – |
| 7.0-dev (CSR, default) | 1 | 9.8 | 90 ms | 111 ms | 200 ms | 0 | – |
| 7.0-dev (CSR, default) | 10 | 89 | 103 ms | 155 ms | 244 ms | 0 | – |
| 7.0-dev (SSR opt-in) | 1 | 9.6 | 97 ms | 113 ms | 152 ms | 0 | – |
| 7.0-dev (SSR opt-in) | 10 | 85 | 100 ms | 122 ms | 201 ms | 0 | – |
| **#14016 (default → SSR)** | 1 | 8.7 | 99 ms | 121 ms | 227 ms | 0 | – |
| **#14016 (default → SSR)** | 10 | 71 | 127 ms | 198 ms | 228 ms | 0 | – |
| #14016 (SSR off) | 1 | 8.4 | 91 ms | 149 ms | 273 ms | 0 | – |
| #14016 (SSR off) | 10 | 94 | 100 ms | 123 ms | 283 ms | 0 | – |

#### Spaces: many browser tabs

| App | Profiles | Tabs | Arm | Ready p50 | Ready max | All ready | Event p50 | Event max | Failures | Server CPU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | shared | 1 | FastAPI | 232 ms | 232 ms | 0.2 s | 53 ms | 53 ms | 0 | – |
| simple | shared | 1 | 7.0-dev (CSR, default) | 684 ms | 684 ms | 0.7 s | 59 ms | 59 ms | 0 | – |
| simple | shared | 1 | 7.0-dev (SSR opt-in) | 506 ms | 506 ms | 0.5 s | 67 ms | 67 ms | 0 | – |
| simple | shared | 1 | **#14016 (default → SSR)** | 580 ms | 580 ms | 0.6 s | 72 ms | 72 ms | 0 | – |
| simple | shared | 1 | #14016 (SSR off) | 621 ms | 621 ms | 0.6 s | 58 ms | 58 ms | 0 | – |
| simple | shared | 10 | FastAPI | 306 ms | 478 ms | 0.5 s | 54 ms | 67 ms | 0 | – |
| simple | shared | 10 | 7.0-dev (CSR, default) | 1,655 ms | 2,381 ms | 2.4 s | 100 ms | 117 ms | 0 | – |
| simple | shared | 10 | 7.0-dev (SSR opt-in) | 671 ms | 1,010 ms | 1.0 s | 116 ms | 136 ms | 0 | – |
| simple | shared | 10 | **#14016 (default → SSR)** | 644 ms | 926 ms | 0.9 s | 156 ms | 176 ms | 0 | – |
| simple | shared | 10 | #14016 (SSR off) | 790 ms | 978 ms | 1.0 s | 114 ms | 150 ms | 0 | – |
| simple | shared | 25 | FastAPI | 595 ms | 1,060 ms | 1.1 s | 57 ms | 68 ms | 0 | – |
| simple | shared | 25 | 7.0-dev (CSR, default) | 1,091 ms | 1,661 ms | 1.7 s | 298 ms | 1,931 ms | 0 | – |
| simple | shared | 25 | 7.0-dev (SSR opt-in) | 1,077 ms | 1,743 ms | 1.8 s | 255 ms | 296 ms | 0 | – |
| simple | shared | 25 | **#14016 (default → SSR)** | 1,179 ms | 1,971 ms | 2.0 s | 359 ms | 460 ms | 0 | – |
| simple | shared | 25 | #14016 (SSR off) | 1,139 ms | 1,698 ms | 1.7 s | 246 ms | 301 ms | 0 | – |
| simple | isolated | 1 | FastAPI | 198 ms | 198 ms | 0.2 s | 43 ms | 43 ms | 0 | – |
| simple | isolated | 1 | 7.0-dev (CSR, default) | 576 ms | 576 ms | 0.6 s | 58 ms | 58 ms | 0 | – |
| simple | isolated | 1 | 7.0-dev (SSR opt-in) | 487 ms | 487 ms | 0.5 s | 59 ms | 59 ms | 0 | – |
| simple | isolated | 1 | **#14016 (default → SSR)** | 474 ms | 474 ms | 0.5 s | 64 ms | 64 ms | 0 | – |
| simple | isolated | 1 | #14016 (SSR off) | 622 ms | 622 ms | 0.6 s | 56 ms | 56 ms | 0 | – |
| simple | isolated | 10 | FastAPI | 169 ms | 183 ms | 0.2 s | 49 ms | 57 ms | 0 | – |
| simple | isolated | 10 | 7.0-dev (CSR, default) | 1,225 ms | 1,355 ms | 1.4 s | 132 ms | 157 ms | 0 | – |
| simple | isolated | 10 | 7.0-dev (SSR opt-in) | 1,062 ms | 1,194 ms | 1.2 s | 128 ms | 144 ms | 0 | – |
| simple | isolated | 10 | **#14016 (default → SSR)** | 1,527 ms | 1,543 ms | 1.5 s | 214 ms | 242 ms | 0 | – |
| simple | isolated | 10 | #14016 (SSR off) | 1,491 ms | 1,641 ms | 1.6 s | 141 ms | 156 ms | 0 | – |
| simple | isolated | 25 | FastAPI | 225 ms | 235 ms | 0.2 s | 63 ms | 80 ms | 0 | – |
| simple | isolated | 25 | 7.0-dev (CSR, default) | 2,808 ms | 3,122 ms | 3.1 s | 259 ms | 344 ms | 0 | – |
| simple | isolated | 25 | 7.0-dev (SSR opt-in) | 2,029 ms | 2,391 ms | 2.4 s | 344 ms | 381 ms | 0 | – |
| simple | isolated | 25 | **#14016 (default → SSR)** | 2,654 ms | 2,725 ms | 2.7 s | 384 ms | 480 ms | 0 | – |
| simple | isolated | 25 | #14016 (SSR off) | 2,175 ms | 2,458 ms | 2.5 s | 341 ms | 386 ms | 0 | – |
| many_tabs | shared | 1 | 7.0-dev (CSR, default) | 830 ms | 830 ms | 0.8 s | 73 ms | 73 ms | 0 | – |
| many_tabs | shared | 1 | 7.0-dev (SSR opt-in) | 820 ms | 820 ms | 0.8 s | 71 ms | 71 ms | 0 | – |
| many_tabs | shared | 1 | **#14016 (default → SSR)** | 893 ms | 893 ms | 0.9 s | 62 ms | 62 ms | 0 | – |
| many_tabs | shared | 1 | #14016 (SSR off) | 808 ms | 808 ms | 0.8 s | 67 ms | 67 ms | 0 | – |
| many_tabs | shared | 10 | 7.0-dev (CSR, default) | 1,657 ms | 2,370 ms | 2.4 s | 143 ms | 230 ms | 0 | – |
| many_tabs | shared | 10 | 7.0-dev (SSR opt-in) | 1,212 ms | 1,793 ms | 1.8 s | 166 ms | 205 ms | 0 | – |
| many_tabs | shared | 10 | **#14016 (default → SSR)** | 1,225 ms | 1,826 ms | 1.8 s | 156 ms | 221 ms | 0 | – |
| many_tabs | shared | 10 | #14016 (SSR off) | 2,213 ms | 2,402 ms | 2.4 s | 141 ms | 183 ms | 0 | – |
| many_tabs | shared | 25 | 7.0-dev (CSR, default) | 1,666 ms | 2,802 ms | 2.8 s | 287 ms | 446 ms | 0 | – |
| many_tabs | shared | 25 | 7.0-dev (SSR opt-in) | 2,293 ms | 3,944 ms | 4.0 s | 257 ms | 396 ms | 0 | – |
| many_tabs | shared | 25 | **#14016 (default → SSR)** | 2,453 ms | 4,190 ms | 4.2 s | 344 ms | 564 ms | 0 | – |
| many_tabs | shared | 25 | #14016 (SSR off) | 1,673 ms | 2,714 ms | 2.7 s | 244 ms | 337 ms | 0 | – |
| many_tabs | isolated | 1 | 7.0-dev (CSR, default) | 861 ms | 861 ms | 0.9 s | 70 ms | 70 ms | 0 | – |
| many_tabs | isolated | 1 | 7.0-dev (SSR opt-in) | 705 ms | 705 ms | 0.7 s | 76 ms | 76 ms | 0 | – |
| many_tabs | isolated | 1 | **#14016 (default → SSR)** | 663 ms | 663 ms | 0.7 s | 70 ms | 70 ms | 0 | – |
| many_tabs | isolated | 1 | #14016 (SSR off) | 1,205 ms | 1,205 ms | 1.2 s | 106 ms | 106 ms | 0 | – |
| many_tabs | isolated | 10 | 7.0-dev (CSR, default) | 3,693 ms | 4,115 ms | 4.1 s | 596 ms | 665 ms | 0 | – |
| many_tabs | isolated | 10 | 7.0-dev (SSR opt-in) | 2,258 ms | 2,358 ms | 2.4 s | 228 ms | 275 ms | 0 | – |
| many_tabs | isolated | 10 | **#14016 (default → SSR)** | 1,991 ms | 2,197 ms | 2.2 s | 258 ms | 314 ms | 0 | – |
| many_tabs | isolated | 10 | #14016 (SSR off) | 4,120 ms | 4,724 ms | 4.7 s | 387 ms | 422 ms | 0 | – |
| many_tabs | isolated | 25 | 7.0-dev (CSR, default) | 7,829 ms | 9,517 ms | 9.5 s | 958 ms | 1,114 ms | 0 | – |
| many_tabs | isolated | 25 | 7.0-dev (SSR opt-in) | 3,789 ms | 4,314 ms | 4.3 s | 334 ms | 451 ms | 0 | – |
| many_tabs | isolated | 25 | **#14016 (default → SSR)** | 4,954 ms | 5,195 ms | 5.2 s | 571 ms | 800 ms | 0 | – |
| many_tabs | isolated | 25 | #14016 (SSR off) | 8,542 ms | 10,077 ms | 10 s | 1,150 ms | 1,307 ms | 0 | – |

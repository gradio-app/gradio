# Experimental Metal hardware preview

This prototype slows **real Metal execution** inside persistent Gradio queue workers.
It works below the Python framework. It has been exercised with PyTorch's MPS backend
and llama.cpp's Metal backend on an Apple M5 Mac. It does not delay or replay SSE to
manufacture benchmark results.

## Run

Use an Apple Silicon Mac, Xcode Command Line Tools, and a normal Gradio development
installation (including its frontend assets). Install PyTorch into the same Python
environment as Gradio for the tensor demo. The native governor is compiled and cached
under `~/.cache/gradio/hardware`; no system settings or GPU clocks are changed.

From this directory:

```sh
gradio app.py
gradio app.py --hardware "MacBook Pro M3"
gradio app.py --hardware "iPhone 18 Pro"
```

Open **Settings** to change the profile. Active jobs retain their profile; switching
is rejected while a job is executing. Switching retires the old worker, so the next
simulated request pays initialization costs. Subsequent requests reuse the worker
and its lazy resources. Normal mode executes in the HTTP process without injecting
the native library.

To enable real language generation, install llama.cpp and supply any compatible
local GGUF model:

```sh
export GRADIO_DEMO_GGUF=/absolute/path/to/model.gguf
gradio app.py --hardware "iPhone 18 Pro"
```

Choose **llama.cpp · text generation** in the demo. The demo uses a child executable,
which inherits the governor. The parent's submission counter does not aggregate
child-process counters; each instrumented process prints its own count on exit.

## API

```python
app = gr.App()  # Alias of gr.Server

@app.resource()
def model():
    return load_model()

@app.queue()
def predict(prompt: str):
    yield from model().generate(prompt)
```

`queue()` is a convenience for `api(queue=True)`; existing `api()` endpoints also use
the worker when hardware preview is selected. `api(queue=False)`, GET, and POST
callbacks are not dispatched into the hardware worker. `resource()` caches initialization
once per process and requires no model/hardware metadata.

Custom frontends can include `/__gradio_hardware/overlay.js` to display the shimmering
border and Settings link. The standard Gradio Settings panel includes the hardware
settings when the CLI exposes the controls. The controls only accept local clients,
validate Host and mutation Origin, and require a per-server token for changes.

## What is enforced versus estimated

- **Actual:** Metal command submission pacing using measured completed GPU time.
  A completed interval `t` adds approximately `t * (1/rate - 1)` seconds of idle debt.
  Later submissions and intercepted completion waits pay that debt. Queue workers
  also drain outstanding recorded debt at job completion.
- **Actual, partial coverage:** allocation rejection at selected Metal device buffer
  and heap creation methods using `currentAllocatedSize` and the requested size.
  This is not a universal RAM/VRAM quota or a security boundary. Other allocation
  paths and simultaneous allocation races can escape these checks.
- **Measured:** a framework-independent native copy probe reports host bandwidth,
  effective wall-clock throughput, and Metal's recommended working-set size.
- **Estimated:** the device-to-budget mapping. The M3 preset uses 65% GPU time and a
  10 GiB allocation budget; the iPhone preset uses 35% and 4 GiB. These are experimental
  policy values, **not calibrated predictions of those devices' performance**.
  M3's published 100 GB/s bandwidth is stored as source data, not claimed as an
  enforced physical bandwidth limit. The iPhone's absolute bandwidth is unknown in
  this registry. Settings exposes these distinctions.

Apple Silicon uses unified memory; the simulated allocation budget is not a separate
VRAM pool. Rejecting an allocation may produce a runtime error or terminate the native
runtime. The supervisor reports worker failure and starts a fresh worker next time.

## Measured feasibility result

`measurements.json` contains the host-local measurements and the repeat samples.
On the test M5, the 40-matmul PyTorch workload had median durations of approximately:

| Governor | Time | Native copy effective throughput | Tiny llama.cpp generation |
|---|---:|---:|---:|
| Not loaded | 0.198 s | 92.2 GB/s | 1657 tokens/s |
| 100% | 0.198 s | 91.5 GB/s | 1799 tokens/s |
| 65% | 0.324 s | 63.0 GB/s | 1324 tokens/s |
| 35% | 0.748 s | 34.5 GB/s | 403 tokens/s |

These short microbenchmarks establish working interception and slowdown across two
independent runtimes. Timing variability, compilation, caches, and the tiny 15M-parameter
llama test model mean they do not establish real-device equivalence or production overhead.
A 1 MiB allocation budget also rejected the native probe's 64 MiB buffer allocation.

Reproduce (GGUF is optional):

```sh
python benchmark.py --gguf "$GRADIO_DEMO_GGUF" --output /tmp/measurements.json
```

## Architecture and limits

The CLI supplies the application path. In simulated mode a fresh Python interpreter
loads the native library before importing the app. An authenticated loopback IPC
connection carries jobs, outputs, errors, and telemetry; stdout/stderr remain usable.
Each worker handles one job at a time. The worker owns generators and model objects.
Async cancellation joins the IPC reader and terminates the worker's process group.
No automatic retry of user callbacks occurs.

- Requires macOS/Apple Silicon for simulated profiles. Actual-host mode retains the
  ordinary execution path. CUDA, CPU throttling, and Neural Engine controls are not implemented.
- The hook currently targets the concrete legacy Metal command-buffer/device classes
  discovered at startup. Alternate classes, Metal 4-specific submission paths, and
  some native libraries may bypass it. A zero submission count is not proof of slowdown.
- Already-submitted work is not preempted. The governor uses completed-work feedback;
  short or highly asynchronous bursts can run ahead. Concurrent GPU intervals can be
  overcounted. It does not impose a strict bandwidth ceiling or exact utilization quota.
- No deliberate synchronous wait is inserted into every commit: that would risk
  deadlocking applications that submit cross-queue dependencies later.
- Device presets do not emulate architecture, thermal throttling, CPU speed, model
  conversion, iOS execution compatibility, or a faster target.
- Only `gr.Server`/`gr.App` is supported in this PoC, with exactly one app per module.
  Worker-safe module initialization is required. Global eager models can be loaded in
  both processes; use `resource()` to avoid that. Switching from host mode after loading
  a resource there can leave the host's resource resident until the app restarts.
- Live HTTP request objects, GPU tensors as endpoint payloads, custom unpicklable
  session objects, and shared mutable globals across processes are not supported.
- The authenticated IPC uses Python serialization between trusted same-user processes.
  Do not expose it or use it as an untrusted-code sandbox.
- Large payloads currently use the connection's bounded transport, not zero-copy shared
  memory. Remote workers, general Blocks compatibility, and more complete memory
  accounting are subsequent work.

## End-to-end demo verification

The actual three CLI launches were tested through their HTTP/SSE endpoints with
20 predictions each. A second request measured warm execution:

| Launch | Cold request | Warm request |
|---|---:|---:|
| `gradio app.py` | 1.80 s | 0.84 s |
| `--hardware "MacBook Pro M3"` | 2.90 s | 1.05 s |
| `--hardware "iPhone 18 Pro"` | 3.98 s | 2.23 s |

See `end_to_end_measurements.json`. Both simulated runs executed in a different PID
from the HTTP server and intercepted 60 Metal submissions on the warm request.
These numbers describe this test host and the explicit experimental budgets.

## Published M3 benchmark validation (2026-10-20)

**Outcome: useful approximate slowdown, not validated device equivalence.** The
current 0.65 rate was 3–23% faster than the published M3 results across these cases.
A candidate 0.615 rate did not consistently improve the match, so neither the
demo preset nor its experimental status was changed.

The original [M3 submission](https://github.com/ggml-org/llama.cpp/discussions/4167/pages?after=DC_kwDOJH_K4M4AdQN2&before=DC_kwDOJH_K4M4AeOEZ)
reports a 14-inch M3 MacBook Pro with 10 GPU cores and 16 GB memory. Its actual
runtime revision is **f3b269813f6147c5b5cda082e6b45cf04a932e0d**, not the
`8e672ef` shown beside the values in the summary table. We built that unmodified
revision with Apple clang 21 on this M5 / macOS 26.6.2.

We downloaded Llama-2-7B Q4_0 and Q8_0 from `TheBloke/Llama-2-7B-GGUF`, pinned to
revision `b4e04e128f421c93a5f1e34ac4d7ca9b0af47b80`, and verified both against the
publisher's SHA-256 hashes. The original submitter provides no model hashes, OS,
or complete command line, so this is a close reproduction, not a byte-identical
replication. We explicitly used four CPU threads, batch size 512, 99 GPU layers,
512 prompt tokens, 128 generated tokens, and five timed repetitions per case.
These are separate synthetic `llama-bench` prompt/decode phases, not a chat request
whose 128 generated tokens follow a 512-token prompt. Model loading is outside the
timed regions. Native warmup behavior is unchanged from the pinned runtime.

All values below are tokens/second. Ranges show the means from two independent
process runs, not confidence intervals. Each mean contains five repetitions.

| Case | Published M3 | Actual M5 | Current 0.65 governor | Error vs M3 | Candidate 0.615 |
|---|---:|---:|---:|---:|---:|
| Q4_0 prompt, 512 tokens | 186.75 | 234.42–242.47 | 202.35–215.92 | +8.4–15.6% | 205.89–210.98 |
| Q4_0 generation, 128 tokens | 21.34 | 26.52–26.89 | 22.03–23.36 | +3.2–9.4% | 22.98–24.29 |
| Q8_0 prompt, 512 tokens | 187.52 | 263.66 | 230.17 | +22.7% | 222.77 |
| Q8_0 generation, 128 tokens | 12.27 | 16.24 | 13.49 | +9.9% | 13.16 |

The candidate was selected only from the initial Q4_0 sweep, by approximately
balancing relative prompt/decode errors between rates 0.35 and 0.65. It was fixed
before any Q8_0 results were observed. Its Q8_0 errors were +18.8% for prompt
processing and +7.3% for generation: it does not establish general device
accuracy. Smaller requested rates also did not always produce lower measured
throughput across runs. Host conditions and the governor's asynchronous feedback
can affect measurements; this experiment does not isolate their contributions.
No accuracy threshold was preregistered, and no statistical confidence interval
for target-device accuracy is claimed.

The matched historical runtime also matters: the M5/M3 generation and prompt
ratios here differ from comparisons mixing old M3 submissions with modern M5
builds. These results cannot validate the current demo's newer llama.cpp runtime,
other models/frameworks, or the iPhone preset. A repeatable calibration needs
multiple runtime/workload holdouts and repeated host baselines before selecting
or automatically applying a device rate. No application model metadata or
framework-specific hooks were introduced.

### Reproducing the measurements

Build the reference runtime separately from Gradio:

```sh
git clone https://github.com/ggml-org/llama.cpp.git /tmp/gradio-llama-calibration
cd /tmp/gradio-llama-calibration
git checkout f3b269813f6147c5b5cda082e6b45cf04a932e0d
make -j4 llama-bench
```

With the two pinned GGUF files downloaded, run from this Gradio checkout:

```sh
python demo/hardware_preview/validate_calibration.py \
  --binary /tmp/gradio-llama-calibration/llama-bench \
  --q4 /tmp/gradio-calibration-models/llama-2-7b.Q4_0.gguf \
  --q8 /tmp/gradio-calibration-models/llama-2-7b.Q8_0.gguf \
  --rates host,0.65,0.615 \
  --output /tmp/gradio-calibration.json
```

`--only Q4_0` or `--only Q8_0` runs one quantization. The harness rejects a binary
that reports a different runtime commit. The sweep's 10 GiB Metal allocation
budget is held constant; the 0.35 sweep point is not an iPhone simulation.

Artifacts include complete commands, file and binary hashes, individual samples,
means, standard deviations, and native submission-count logs:

- `calibration-q4.json`: baseline, current rate, and 0.35 sweep point.
- `calibration-q4-fit.json`: first candidate measurement.
- `calibration-q4-repeat.json`: repeated current/candidate/baseline measurements.
- `calibration-q8.json`: holdout quantization at baseline/current/candidate rates.
- Matching `calibration-*.log` files: native governor initialization and submission counts.

Model weights and the compiled reference runtime remain outside the repository.

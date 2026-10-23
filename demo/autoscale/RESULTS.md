# Autoscaling results — 2026-10-22

Each table compares, on one machine:
- today's thread executor with `concurrency_limit` 1 and 2;
- the gateway executor of #14003 with one process and with two fixed replicas;
- the previous per-endpoint version of this PR (one worker vs auto, up to two), run on the same machine in the same session.

Every run uses PR #13998's request pattern: 3 warm calls, then two bursts from 12 concurrent clients. The tables show the second burst, in seconds; lower is better. The ratio in parentheses compares with thread / 1 at a time, today's default. Each configuration was run once.

## A100 80 GB (Hugging Face Jobs `a100-large`, 12 vCPU)

| Workload (requests) | thread, 1 at a time | thread, 2 at a time | gateway, 1 process | gateway, 2 replicas | per-endpoint, 1 worker | per-endpoint, auto |
|---|---:|---:|---:|---:|---:|---:|
| Pure Python (12) | 14.55 | 14.58 (1.00×) | 14.18 (1.03×) | **7.10 (2.05×)** | 13.96 | **6.95** (2 workers) |
| Kokoro, CUDA (128) | 13.62 | 9.58 (1.42×) | 11.58 (1.18×) | **6.30 (2.16×)** | 11.05 | **6.23** (2 workers) |
| Qwen2.5 7B FP16 (12) | 24.40 | 21.34 (1.14×) | 22.12 (1.10×) | **12.76 (1.91×)** | 21.94 | **12.56** (2 workers) |
| Qwen2.5 32B FP16 (6) | 24.77 | 22.01 (1.13×) | 24.09 (1.03×) | does not fit | not rerun | kept 1 worker earlier |

Peak memory, one process vs two replicas:

| Workload | Process RAM | GPU memory |
|---|---|---|
| Kokoro | 2.3 → 4.5 GB | 1.3 → 2.5 GB |
| Qwen 7B | 1.9 → 3.6 GB | 15.1 → 30.1 GB |
| Qwen 32B | — | 63 GB (one copy), so two can't fit in 80 GB |

## Apple M5, 32 GB unified memory

| Workload (requests) | thread, 1 at a time | thread, 2 at a time | gateway, 1 process | gateway, 2 replicas | per-endpoint, 1 worker | per-endpoint, auto |
|---|---:|---:|---:|---:|---:|---:|
| Pure Python (12) | 2.86 | 2.88 (0.99×) | 2.96 (0.97×) | **1.69 (1.69×)** | 3.01 | **1.46** (2 workers) |
| Kokoro, CPU (64) | 33.17 | **19.31 (1.72×)** | 32.80 (1.01×) | **19.93 (1.66×)** | 33.59 | **18.76** (2 workers) |
| Llama 2 7B Q4, Metal (6) | 13.45 | crashed | 13.69 (0.98×) | 13.60 (0.99×) | 13.80 | 13.78 (kept 1) |
| Llama 2 7B Q8, Metal (6) | 22.41 | every request failed | 22.68 (0.99×) | 24.20 (0.93×) | 23.82 | 23.36 (kept 1) |

The new `replicas="auto"` autoscaler was also run locally on pure Python:
- one process: 3.21 s;
- auto: 1.66 s, after adding a replica, measuring it and keeping it.

## What the numbers say

- **On the A100, a second process roughly doubles throughput** for every workload whose model fits twice (1.9–2.2×). Threads help much less (1.0–1.4×), even for CUDA work, because the Python side of each request still contends for the GIL. The gateway and the per-endpoint pool reach the same throughput.
- **Moving the server out of the app's process helps by itself.** With one process, the gateway is 1.18× faster on Kokoro and 1.10× on Qwen 7B than thread mode. The per-endpoint pool's single worker shows the same effect.
- **On the M5, a second copy of an LLM brings nothing**, since the GPU is the bottleneck, and it doubles memory. For Kokoro on the CPU, two threads match two processes with half the extra memory.
- **llama.cpp can't serve concurrent requests from threads sharing one model**: it crashed or returned errors. Separate processes are the safe option.
- **Two copies of the 32B model can't fit in 80 GB.** The admission check is there to refuse such a second replica.

## Caveats

- The two-replica columns use a fixed replica count, which is what `replicas="auto"` reaches once a replica is retained. Only Mac pure Python was rerun with the ported autoscaler.
- The per-endpoint columns are this PR's previous code: the same policy, but driving per-endpoint worker processes.
- Mac LLM runs use llama.cpp/Metal and the A100 runs use transformers/CUDA, so compare each row only with itself.
- Raw results and logs are in the private dataset `abidlabs/gradio-gateway-a100-bench`.

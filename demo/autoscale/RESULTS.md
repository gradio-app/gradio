# Autoscaling results — 2026-10-29

Each table compares, on one machine and in one session:
- `7.0-dev`'s thread executor with `concurrency_limit` 1 and 2;
- `7.0-dev`'s process executor (#14014) with one process and with two fixed replicas;
- `replicas="auto"` (this PR), which starts with one process.

Every run makes 3 warm calls, then two bursts of N requests from 12 concurrent
clients, each request its own session. The tables show the second burst, in
seconds; lower is better. With `auto`, the second burst starts once no replica
is starting, and "auto, first burst" is the burst during which it scaled. The
ratio in parentheses compares with thread / 1 at a time. Each configuration
ran once.

## A100 80 GB (Hugging Face Jobs `a100-large`)

| Workload (requests) | thread, 1 at a time | thread, 2 at a time | process, 1 | process, 2 replicas | auto | auto, first burst |
|---|---:|---:|---:|---:|---:|---:|
| Pure Python (12) | 12.50 | 12.49 (1.00×) | 12.32 (1.01×) | 6.18 (2.02×) | **6.17 (2.03×)**, 2 processes | 8.52 |
| Kokoro, CUDA (128) | 9.50 | 7.18 (1.32×) | 9.24 (1.03×) | **5.12 (1.86×)** | 5.72 (1.66×), 2 processes | 9.69 |
| Qwen2.5 7B FP16 (12) | 20.40 | 16.96 (1.20×) | 19.67 (1.04×) | 13.23 (1.54×) | **12.38 (1.65×)**, 2 processes | 19.13 |
| Qwen2.5 32B FP16 (6) | pending | | | does not fit | | |

## Apple M5, 32 GB unified memory

| Workload (requests) | thread, 1 at a time | thread, 2 at a time | process, 1 | process, 2 replicas | auto | auto, first burst |
|---|---:|---:|---:|---:|---:|---:|
| Pure Python (12) | 3.06 | 3.17 (0.97×) | 3.03 (1.01×) | 1.60 (1.91×) | **1.56 (1.96×)**, 2 processes | 3.17 |
| Kokoro, CPU (64) | 34.25 | 19.66 (1.74×) | 32.28 (1.06×) | **18.66 (1.84×)** | 19.33 (1.77×), 2 processes | 23.52 |
| Llama 2 7B Q4, Metal (6) | **15.12** | crashed | 16.81 (0.90×) | 16.81 (0.90×) | 18.23 (0.83×), kept 1: not enough memory | 18.44 |
| Llama 2 7B Q8, Metal (6) | 24.39 | crashed | 23.60 (1.03×) | **23.07 (1.06×)** | 25.47 (0.96×), kept 1: not enough memory | 25.11 |

- **`auto` scales to two processes where the model fits twice** (Python, Kokoro), within 4% of two fixed replicas.
- **For the LLMs it declines to add a replica,** since a second copy plus the reserve doesn't fit in 32 GB of unified memory. A second copy brings nothing there anyway, since the GPU is the bottleneck. Two threads sharing one llama.cpp model crash, as before.
- **`auto` with one process was 8% slower than `process, 1` on these two LLM rows.** I haven't checked whether that's noise or the autoscaler's memory sampling every 0.25 s; each configuration ran once.

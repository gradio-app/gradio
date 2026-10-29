# Autoscaling the process executor

`launch(executor="process")` (the default in 7.0) runs Gradio's server in a
gateway process while the process that built the app runs every event, and
`launch(replicas=N)` runs N copies of that process. `replicas="auto"` lets the
gateway decide:

```python
app.launch(replicas="auto")   # or GRADIO_PROCESS_REPLICAS=auto
```

- **`replicas="auto"`** (at most two by default, `GRADIO_AUTOSCALE_MAX_REPLICAS`)
  is run by the gateway. It
  starts with one process and records its service times. When events keep
  waiting for 0.5 s while every process is busy, it checks memory headroom:
  the first process's observed peak plus 25%, plus a 15% reserve (at least
  1 GiB) of system/unified memory and, on NVIDIA, of GPU memory. If that
  fits, it asks the app's process to start a replica. It keeps the replica
  only if sustained throughput improves by at least 10% without median
  latency exceeding 2.5× the baseline. It retires the replica after 60 s
  idle or when the memory reserve runs low. Real events are never replayed.
- `GET /gradio_api/processes` lists the processes, and under `autoscale` their
  peak memory and every scaling decision.
- A replica re-runs the app script, so it loads its own copy of the models at
  import. A session stays on the process that first served it, and
  `concurrency_limit` applies per process, as with fixed replicas.

## Try it on Spaces

Each Space shows its processes and the autoscaler's decisions live. Open one in
several tabs and send requests from all of them at once:
[pure Python on CPU](https://huggingface.co/spaces/abidlabs/autoscale-python),
[Kokoro TTS on an L4](https://huggingface.co/spaces/abidlabs/autoscale-kokoro),
[Qwen2.5 7B on an A100](https://huggingface.co/spaces/abidlabs/autoscale-qwen).

## Running the benchmark

```bash
python benchmark.py --workload python --requests 12 --output python.json
python benchmark.py --workload kokoro --requests 128 --output kokoro.json
python benchmark.py --workload medium --requests 12 --output medium.json
```

`AUTOSCALE_WORKLOAD` selects pure-Python work, Kokoro TTS, or an LLM
(Qwen2.5 7B / 32B with transformers on CUDA, Llama 2 7B Q4 / Q8 with
llama.cpp on Metal). Results are in [RESULTS.md](RESULTS.md).

## Limits

- One machine and one GPU (every replica uses GPU 0).
- Replicas need the app to be run as a script (`python app.py`).
- Server-side state of a session whose replica retires is lost. Browser-held
  `gr.State` survives, since every process shares the signing secret.
- Memory is observed, not enforced, so unseen inputs can still run out of
  memory.

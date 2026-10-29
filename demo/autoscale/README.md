# Autoscaling the process executor

`launch(executor="process")` (#14003) runs Gradio's server in a gateway
process while the process that built the app runs every event. This demo adds
copies of that process:

```python
app.launch(executor="process", replicas="auto")   # or replicas=2, or GRADIO_PROCESS_REPLICAS
```

- **Replicas** re-run the app script, so each loads its own copy of the
  models at import. No `resource()` decorator is needed. A session stays on
  the replica that first served it, since its `gr.State` and generators live
  there, while new sessions go to the least busy replica.
- **`concurrency_limit` applies per replica.** The gateway's queue admits
  that many events per serving replica.
- **`replicas="auto"`** (at most two for now) is run by the gateway. It
  starts with one process and records its service times. When events keep
  waiting for 0.5 s while every process is busy, it checks memory headroom:
  the first process's observed peak plus 25%, plus a 15% reserve (at least
  1 GiB) of system/unified memory and, on NVIDIA, of GPU memory. If that
  fits, it asks the app's process to start a replica. It keeps the replica
  only if sustained throughput improves by at least 10% without median
  latency exceeding 2.5× the baseline. It retires the replica after 60 s
  idle or when the memory reserve runs low. Real events are never replayed.
- `GET /gradio_api/processes` lists the processes, their peak memory and
  every scaling decision.

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

- At most two replicas, one machine and one GPU.
- Replicas need the app to be run as a script (`python app.py`).
- Server-side state of a session whose replica retires is lost. Browser-held
  `gr.State` survives, since every process shares the signing secret.
- Memory is observed, not enforced, so unseen inputs can still run out of
  memory.

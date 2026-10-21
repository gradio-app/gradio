"""Live Metal prediction demo. Run with `gradio app.py --hardware 'iPhone 18 Pro'`."""

import os
import subprocess
from collections.abc import Iterator
from pathlib import Path

import gradio as gr
from fastapi.responses import HTMLResponse

app = gr.App()


@app.resource()
def matrices():
    import torch

    if not torch.backends.mps.is_available():
        raise RuntimeError("This demo requires Apple Silicon with Metal support.")
    generator = torch.Generator().manual_seed(42)
    return torch.randn(2048, 2048, generator=generator).to("mps"), torch.eye(
        2048, device="mps"
    )


@app.queue(stream_every=0.02)
def predict(steps: int = 60) -> Iterator[str]:
    """Repeated real tensor predictions; no artificial Python sleeps."""
    import torch

    x, weights = matrices()
    for step in range(max(1, min(steps, 300))):
        # Multiple operations make GPU execution dominate IPC and UI overhead.
        for _ in range(8):
            result = x @ weights
        torch.mps.synchronize()
        yield f"Prediction {step + 1}/{steps} · score {result[0, 0].item():.6f}"


@app.queue(stream_every=0.02)
def generate(prompt: str) -> Iterator[str]:
    """Independent llama.cpp stack; native governor is inherited by its process."""
    model = os.environ.get("GRADIO_DEMO_GGUF")
    if not model:
        raise RuntimeError(
            "Set GRADIO_DEMO_GGUF to a local GGUF model to enable llama.cpp."
        )
    process = subprocess.Popen(
        [
            "llama-completion",
            "-m",
            model,
            "-p",
            prompt,
            "-n",
            "256",
            "-c",
            "512",
            "--no-display-prompt",
            "--simple-io",
            # Fixed work across presets: do not stop at a sampled end token.
            "--ignore-eos",
            "--temp",
            "0",
            "--seed",
            "42",
        ],
        stdout=subprocess.PIPE,
        text=True,
    )
    text = ""
    try:
        while chunk := process.stdout.read(1):
            text += chunk
            yield text
        if process.wait() != 0:
            raise RuntimeError("llama.cpp exited unsuccessfully; check worker stderr.")
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


@app.get("/", response_class=HTMLResponse)
def index():
    return (Path(__file__).parent / "index.html").read_text()


@app.get("/health")
def health():
    return {"ok": True, "pid": os.getpid()}


if __name__ == "__main__":
    app.launch(
        server_name="127.0.0.1",
        server_port=int(os.environ.get("GRADIO_SERVER_PORT", "7860")),
    )

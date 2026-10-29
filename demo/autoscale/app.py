"""Autoscaling demo: python app.py. The model loads at import, as in any app.

AUTOSCALE_WORKLOAD picks the work (python, kokoro, medium, large) and
GRADIO_PROCESS_REPLICAS how many copies of this process serve it (1, 2 or
"auto"). GET /gradio_api/processes shows the processes and scaling decisions.
"""

import hashlib
import os
import platform
import time
from collections.abc import Iterator
from pathlib import Path

import gradio as gr

WORKLOAD = os.environ.get("AUTOSCALE_WORKLOAD", "python")


def load():
    if WORKLOAD == "python":
        return {"created": time.time()}
    import torch

    torch.set_num_threads(1)
    if WORKLOAD == "kokoro":
        from kokoro import KPipeline  # ty: ignore[unresolved-import]

        return KPipeline(
            lang_code="a", device="cuda" if torch.cuda.is_available() else "cpu"
        )
    if torch.cuda.is_available():
        # Same models and revisions as PR #13998's A100 runs
        from transformers import AutoModelForCausalLM, AutoTokenizer

        name, revision = {
            "medium": (
                "Qwen/Qwen2.5-7B-Instruct",
                "a09a35458c702b33eeacc393d103063234e8bc28",
            ),
            "large": (
                "Qwen/Qwen2.5-32B-Instruct",
                "5ede1c97bbab6ce5cda5812749b4c0bdf79b18dd",
            ),
        }[WORKLOAD]
        tokenizer = AutoTokenizer.from_pretrained(name, revision=revision)
        loaded = AutoModelForCausalLM.from_pretrained(
            name, revision=revision, dtype=torch.float16, device_map={"": "cuda"}
        )
        loaded.eval()
        return {
            "runtime": "transformers/cuda",
            "loaded": loaded,
            "tokenizer": tokenizer,
            "name": name,
        }
    import llama_cpp  # ty: ignore[unresolved-import]

    models = Path(
        os.environ.get("AUTOSCALE_GGUF_DIR", "/tmp/gradio-calibration-models")
    )
    filename = (
        "llama-2-7b.Q4_0.gguf" if WORKLOAD == "medium" else "llama-2-7b.Q8_0.gguf"
    )
    if platform.system() != "Darwin" or not llama_cpp.llama_supports_gpu_offload():
        raise RuntimeError("Without CUDA, the LLM workloads need llama.cpp with Metal")
    loaded = llama_cpp.Llama(
        model_path=str(models / filename),
        n_gpu_layers=-1,
        n_ctx=512,
        n_threads=2,
        use_mmap=False,
        verbose=False,
    )
    return {"runtime": "llama.cpp/Metal", "loaded": loaded, "name": filename}


MODEL = load()
app = gr.App()


@app.queue(stream_every=0.1)
def predict(text: str = "Explain why the sky is blue.") -> Iterator[dict]:
    started = time.monotonic()
    yield {"pid": os.getpid(), "phase": "running", "workload": WORKLOAD}
    if WORKLOAD == "python":
        result = 0
        for i in range(8_000_000):
            result = (result + i * i) % 1_000_000_007
        output = {"checksum": result}
    elif WORKLOAD == "kokoro":
        import numpy as np

        audio = np.concatenate([a.numpy() for _, _, a in MODEL(text, voice="af_heart")])
        output = {
            "samples": len(audio),
            "audio_sha256": hashlib.sha256(audio.tobytes()).hexdigest(),
        }
    elif MODEL["runtime"] == "transformers/cuda":
        import torch

        loaded, tokenizer = MODEL["loaded"], MODEL["tokenizer"]
        inputs = tokenizer(text, return_tensors="pt").to("cuda")
        with torch.inference_mode():
            ids = loaded.generate(
                **inputs,
                max_new_tokens=64,
                min_new_tokens=64,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id,
            )
        torch.cuda.synchronize()
        output = {
            "model": MODEL["name"],
            "tokens": int(ids.shape[1] - inputs.input_ids.shape[1]),
        }
    else:
        loaded = MODEL["loaded"]
        loaded.reset()
        result = loaded.create_completion(
            text,
            max_tokens=64,
            temperature=0,
            logit_bias={str(loaded.token_eos()): -1000},
        )
        output = {
            "model": MODEL["name"],
            "tokens": result["usage"]["completion_tokens"],
            "text": result["choices"][0]["text"],
        }
        if output["tokens"] != 64:
            raise RuntimeError("Benchmark requires exactly 64 generated tokens")
    yield {
        "pid": os.getpid(),
        "phase": "complete",
        "workload": WORKLOAD,
        "seconds": time.monotonic() - started,
        **output,
    }


if __name__ == "__main__":
    app.launch(
        server_name=os.environ.get("GRADIO_SERVER_NAME", "127.0.0.1"),
        server_port=int(os.environ.get("PORT", "7869")),
        ssr_mode=False,
        show_error=True,
        executor="process",
    )

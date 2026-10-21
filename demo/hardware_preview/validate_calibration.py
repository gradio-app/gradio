"""Compare a pinned llama-bench build against published M3 measurements.

Requires separately downloaded Llama-2-7B Q4_0 and Q8_0 GGUFs. No model
introspection or framework hooks are added to the Gradio runtime.
"""

import argparse
import hashlib
import json
import os
import platform
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from gradio.hardware.native import build

REFERENCE = {
    "source": "https://github.com/ggml-org/llama.cpp/discussions/4167",
    "device": "M3 MacBook Pro 14, 10 GPU cores, 16 GB RAM",
    "submission": "https://github.com/ggml-org/llama.cpp/discussions/4167/pages?after=DC_kwDOJH_K4M4AdQN2&before=DC_kwDOJH_K4M4AeOEZ",
    "commit": "f3b269813f6147c5b5cda082e6b45cf04a932e0d",
    "Q4_0": {"pp512": 186.75, "tg128": 21.34},
    "Q8_0": {"pp512": 187.52, "tg128": 12.27},
    "limitations": "Published model hashes, OS, and all invocation flags are unavailable. Model identity is not byte-verified against the original run.",
}


MODEL_HASHES = {
    "Q4_0": "78b8f9777dd620ad29cd2cffb6653b17fa8a5b1fddc1b8821180d60eedd24d48",
    "Q8_0": "f1415d117f94261fd9869ac5dabd98b3dc36648cfb7c6d84e5b473aca74ab64d",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", type=Path, required=True)
    parser.add_argument("--q4", type=Path, required=True)
    parser.add_argument("--q8", type=Path, required=True)
    parser.add_argument("--rates", default="host,0.65,0.35")
    parser.add_argument("--only", choices=["Q4_0", "Q8_0"])
    parser.add_argument("--repeats", type=int, default=5)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    with args.binary.open("rb") as file:
        binary_hash = hashlib.file_digest(file, "sha256").hexdigest()
    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "platform": platform.platform(),
        "reference": REFERENCE,
        "binary_sha256": binary_hash,
        "model_repository": "TheBloke/Llama-2-7B-GGUF",
        "model_revision": "b4e04e128f421c93a5f1e34ac4d7ca9b0af47b80",
        "memory_budget_gib": 10,
        "models": {},
        "runs": [],
    }
    library = build()
    models = [
        (q, p)
        for q, p in (("Q4_0", args.q4), ("Q8_0", args.q8))
        if args.only is None or q == args.only
    ]
    for quant, model in models:
        with model.open("rb") as file:
            result["models"][quant] = {
                "filename": model.name,
                "sha256": hashlib.file_digest(file, "sha256").hexdigest(),
            }
        if result["models"][quant]["sha256"] != MODEL_HASHES[quant]:
            raise RuntimeError(f"{quant} does not match the pinned model artifact")
    for rate in args.rates.split(","):
        for quant, model in models:
            env = {
                k: v
                for k, v in os.environ.items()
                if not k.startswith("GRADIO_METAL_") and k != "DYLD_INSERT_LIBRARIES"
            }
            if rate != "host":
                env.update(
                    DYLD_INSERT_LIBRARIES=str(library),
                    GRADIO_METAL_RATE=rate,
                    GRADIO_METAL_MEMORY_BYTES=str(10 * 1024**3),
                )
            command = [
                str(args.binary),
                "-m",
                str(model),
                "-p",
                "512",
                "-n",
                "128",
                "-ngl",
                "99",
                "-t",
                "4",
                "-b",
                "512",
                "-r",
                str(args.repeats),
                "-o",
                "json",
            ]
            completed = subprocess.run(
                command,
                check=False,
                env=env,
                capture_output=True,
                text=True,
                timeout=600,
                cwd=args.binary.parent,
            )
            log = args.output.with_name(f"{args.output.stem}-{quant}-{rate}.log")
            log.write_text(completed.stderr)
            completed.check_returncode()
            rows = json.loads(completed.stdout)
            if not rows or any(
                not REFERENCE["commit"].startswith(row["build_commit"]) for row in rows
            ):
                raise RuntimeError(
                    "Benchmark binary does not match the published runtime revision"
                )
            comparisons = []
            for row in rows:
                task = "pp512" if row["n_prompt"] else "tg128"
                target = REFERENCE[quant][task]
                comparisons.append(
                    {
                        "task": task,
                        "measured_tps": row["avg_ts"],
                        "target_tps": target,
                        "error_percent": 100 * (row["avg_ts"] / target - 1),
                    }
                )
            run = {
                "rate": rate,
                "quantization": quant,
                "command": command,
                "raw": rows,
                "comparison": comparisons,
            }
            result["runs"].append(run)
            args.output.write_text(json.dumps(result, indent=2) + "\n")
            print(
                json.dumps(
                    {"rate": rate, "quantization": quant, "comparison": comparisons}
                ),
                flush=True,
            )


if __name__ == "__main__":
    main()

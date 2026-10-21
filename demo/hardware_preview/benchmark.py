"""Reproduce native/torch/llama.cpp measurements; writes no device-equivalence claims."""

import argparse
import json
import os
import platform
import statistics
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from gradio.hardware.native import build, calibrate

TORCH = """
import time,json,torch
x=torch.randn(2048,2048,device='mps'); y=torch.randn_like(x)
for _ in range(5): z=x@y; torch.mps.synchronize()
t=time.perf_counter()
for _ in range(40): z=x@y; torch.mps.synchronize()
print(json.dumps({'seconds':time.perf_counter()-t,'finite':bool(torch.isfinite(z).all().item())}))
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gguf", type=Path)
    parser.add_argument(
        "--output", type=Path, default=Path("/tmp/gradio-metal-measurements.json")
    )
    parser.add_argument("--repeats", type=int, default=3)
    args = parser.parse_args()
    library = build()
    host = calibrate()
    probe = next((library.parent).glob("probe-*"))
    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "platform": platform.platform(),
        "host": host,
        "note": "Host-local throttling measurements. Not measurements on the named target devices.",
        "runs": [],
    }
    for rate in (None, 1.0, 0.65, 0.35):
        env = {
            k: v
            for k, v in os.environ.items()
            if not k.startswith("GRADIO_METAL_") and k != "DYLD_INSERT_LIBRARIES"
        }
        if rate is not None:
            env.update(GRADIO_METAL_RATE=str(rate), DYLD_INSERT_LIBRARIES=str(library))
        row = {
            "rate": rate,
            "torch_seconds": [],
            "copy_seconds": [],
            "copy_effective_gbs": [],
        }
        for _ in range(args.repeats):
            measured = subprocess.run(
                [sys.executable, "-c", TORCH],
                env=env,
                capture_output=True,
                text=True,
                check=True,
                timeout=60,
            )
            data = json.loads(measured.stdout)
            if not data["finite"]:
                raise RuntimeError("Tensor prediction produced non-finite results")
            row["torch_seconds"].append(data["seconds"])
            measured = subprocess.run(
                [str(probe)],
                env=env,
                capture_output=True,
                text=True,
                check=True,
                timeout=60,
            )
            data = json.loads(measured.stdout)
            if not data["valid"]:
                raise RuntimeError("Metal copy produced incorrect results")
            row["copy_seconds"].append(data["wall_seconds"])
            row["copy_effective_gbs"].append(data["effective_bandwidth_gbs"])
        row["torch_median_seconds"] = statistics.median(row["torch_seconds"])
        row["copy_median_effective_gbs"] = statistics.median(row["copy_effective_gbs"])
        if args.gguf:
            measured = subprocess.run(
                [
                    "llama-bench",
                    "-m",
                    str(args.gguf),
                    "-p",
                    "128",
                    "-n",
                    "64",
                    "-r",
                    str(args.repeats),
                    "-o",
                    "json",
                ],
                env=env,
                capture_output=True,
                text=True,
                check=True,
                timeout=120,
            )
            row["llama"] = [
                {
                    "prompt_tokens": r["n_prompt"],
                    "generated_tokens": r["n_gen"],
                    "tokens_per_second": r["avg_ts"],
                }
                for r in json.loads(measured.stdout)
            ]
        result["runs"].append(row)
        args.output.write_text(json.dumps(result, indent=2) + "\n")
        print(json.dumps(row), flush=True)
    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()

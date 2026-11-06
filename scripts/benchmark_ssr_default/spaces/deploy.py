"""Creates one private Docker Space per benchmark arm, and switches the app they run.

python spaces/deploy.py deploy --owner dawood
python spaces/deploy.py set-app --owner dawood --app many_tabs
python spaces/deploy.py startup --owner dawood --reps 3 --out results/spaces.json
python spaces/deploy.py urls --owner dawood --app simple   # --remote flags for bench.py
"""

from __future__ import annotations

import argparse
import json
import shutil
import tempfile
import time
from pathlib import Path

import requests
from huggingface_hub import HfApi, get_token

HERE = Path(__file__).parent
BASE_SHA = "e6f0dd47471bb459dac110d38f5e61f62c64f498"  # 7.0-dev, merge base of #14016
PR_SHA = "e297d03bd0005012343511ef9cc3ba3fd5a6a900"  # head of #14016
ARMS = {
    "fastapi": (BASE_SHA, ""),
    "base-csr": (BASE_SHA, ""),
    "base-ssr": (BASE_SHA, "GRADIO_SSR_MODE=true"),
    "pr-default": (PR_SHA, ""),
    "pr-csr": (PR_SHA, "GRADIO_SSR_MODE=false"),
}
APP_SCRIPTS = {"simple": "simple_gradio", "many_tabs": "many_tabs"}


def repo_id(owner, arm):
    return f"{owner}/bench-14016-{arm}"


def space_url(owner, arm):
    return f"https://{owner}-bench-14016-{arm}.hf.space"


def deploy(api: HfApi, owner: str):
    template = (HERE / "Dockerfile").read_text()
    for arm, (sha, env) in ARMS.items():
        rid = repo_id(owner, arm)
        api.create_repo(
            rid, repo_type="space", space_sdk="docker", private=True, exist_ok=True
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            (tmp / "Dockerfile").write_text(template.format(sha=sha, env=env))
            (tmp / "README.md").write_text(
                f"---\ntitle: bench-14016 {arm}\nsdk: docker\napp_port: 7860\n---\n\n"
                f"Benchmark arm `{arm}` for gradio-app/gradio#14016 (gradio@{sha[:7]} {env}).\n"
            )
            shutil.copy(HERE.parent / "constraints.txt", tmp / "constraints.txt")
            shutil.copytree(
                HERE.parent / "apps",
                tmp / "apps",
                ignore=shutil.ignore_patterns("__pycache__"),
            )
            api.upload_folder(
                repo_id=rid,
                repo_type="space",
                folder_path=tmp,
                commit_message=f"Deploy benchmark arm {arm}",
            )
        api.add_space_variable(
            rid, "APP", "simple_fastapi" if arm == "fastapi" else "simple_gradio"
        )
        print("deployed", rid)


def set_app(api: HfApi, owner: str, app: str):
    for arm in ARMS:
        if arm == "fastapi":
            continue
        api.add_space_variable(repo_id(owner, arm), "APP", APP_SCRIPTS[app])
        print("set", arm, app)


def wait_ready(api, owner, arm, timeout=1800) -> float:
    rid, url = repo_id(owner, arm), space_url(owner, arm)
    headers = {"Authorization": f"Bearer {get_token()}"}
    deadline = time.time() + timeout
    while time.time() < deadline:
        stage = api.get_space_runtime(rid).stage
        if stage in ("BUILD_ERROR", "RUNTIME_ERROR", "CONFIG_ERROR"):
            raise RuntimeError(f"{rid}: {stage}")
        if stage == "RUNNING":
            try:
                if (
                    requests.get(url + "/", headers=headers, timeout=10).status_code
                    == 200
                ):
                    return time.time()
            except requests.RequestException:
                pass
        time.sleep(0.5)
    raise RuntimeError(f"{rid} not ready")


def startup_stamps(owner, arm) -> dict | None:
    """Reads the last BENCH_STARTUP line from the Space's run logs."""
    headers = {"Authorization": f"Bearer {get_token()}"}
    url = f"https://huggingface.co/api/spaces/{repo_id(owner, arm)}/logs/run"
    last = None
    try:
        with requests.get(url, headers=headers, stream=True, timeout=(10, 5)) as r:
            for raw in r.iter_lines():
                line = raw.decode(errors="replace")
                if line.startswith("data:"):
                    try:
                        data = json.loads(line[5:]).get("data", "")
                    except json.JSONDecodeError:
                        continue
                    if "BENCH_STARTUP " in data:
                        last = json.loads(data.split("BENCH_STARTUP ", 1)[1])
    except requests.exceptions.ConnectionError:
        pass  # the stream stays open; the read timeout ends it
    return last


def startup(api: HfApi, owner: str, reps: int, app: str) -> list[dict]:
    rows = []
    for rep in range(reps):
        for arm in ARMS:
            if arm == "fastapi" and app != "simple":
                continue
            t = time.time()
            api.restart_space(repo_id(owner, arm))
            time.sleep(5)  # the runtime still reports RUNNING for a moment
            ready = wait_ready(api, owner, arm)
            s = startup_stamps(owner, arm) or {}
            row = {"arm": arm, "app": app, "rep": rep, "restart_to_ready_s": ready - t}
            if s:
                row.update(
                    import_ms=(s["t_import"] - s["t0"]) * 1000,
                    build_ms=(s["t_build"] - s["t_import"]) * 1000,
                    launch_ms=(s["t_launch"] - s["t_build"]) * 1000,
                    in_container_ms=(s["t_launch"] - s["t0"]) * 1000,
                    ssr=s.get("ssr", False),
                )
            rows.append(row)
            print(row, flush=True)
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("command", choices=["deploy", "set-app", "startup", "urls", "wait"])
    ap.add_argument("--owner", required=True)
    ap.add_argument("--app", default="simple")
    ap.add_argument("--reps", type=int, default=3)
    ap.add_argument("--out")
    args = ap.parse_args()
    api = HfApi()
    if args.command == "deploy":
        deploy(api, args.owner)
    elif args.command == "set-app":
        set_app(api, args.owner, args.app)
    elif args.command == "wait":
        for arm in ARMS:
            wait_ready(api, args.owner, arm)
            print("ready", arm, flush=True)
    elif args.command == "urls":
        print(
            " ".join(
                f"--remote {arm}/{args.app}={space_url(args.owner, arm)}"
                for arm in ARMS
                if arm != "fastapi" or args.app == "simple"
            )
        )
    else:
        out = Path(args.out)
        results = json.loads(out.read_text()) if out.exists() else {}
        results.setdefault("startup_spaces", [])
        results["startup_spaces"] = [
            r for r in results["startup_spaces"] if r["app"] != args.app
        ]
        results["startup_spaces"] += startup(api, args.owner, args.reps, args.app)
        out.write_text(json.dumps(results, indent=1))


if __name__ == "__main__":
    main()

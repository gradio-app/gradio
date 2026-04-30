"""Remote benchmark runner that submits jobs to HF Jobs infrastructure.

Runs local Gradio app benchmarks on fresh HF Jobs containers for reproducible,
comparable results. Results are uploaded to the gradio/backend-benchmarks HF bucket.

Usage:
    # Single branch
    python scripts/benchmark/remote_runner.py run \
        --apps scripts/benchmark/apps/echo_text.py \
        --branch main \
        --tiers 1,10,100 \
        --requests-per-user 10

    # A/B test two branches
    python scripts/benchmark/remote_runner.py ab \
        --apps scripts/benchmark/apps/echo_text.py \
        --base main \
        --branch avoid-asyncio-sleep-sse \
        --tiers 1,10,100 \
        --requests-per-user 50

    # Profile an existing HF Space with a specific gradio branch
    python scripts/benchmark/remote_runner.py run \
        --apps mrfakename/z-image-turbo \
        --branch my-fix-branch \
        --tiers 1,10,100

    # Dry run
    python scripts/benchmark/remote_runner.py run \
        --apps scripts/benchmark/apps/echo_text.py \
        --dry-run
"""

from __future__ import annotations

import argparse
import base64
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def resolve_commit_sha(branch: str) -> str:
    """Resolve a branch name to a commit SHA via git ls-remote."""
    result = subprocess.run(
        [
            "git",
            "ls-remote",
            "https://github.com/gradio-app/gradio.git",
            f"refs/heads/{branch}",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    output = result.stdout.strip()
    if not output:
        print(f"ERROR: Branch '{branch}' not found on remote", file=sys.stderr)
        sys.exit(1)
    sha = output.split()[0]
    return sha


def resolve_wheel_url(commit_sha: str) -> str:
    """Find the wheel URL for a given commit SHA in the HF pypi-previews bucket."""
    from huggingface_hub import HfFileSystem

    fs = HfFileSystem()
    bucket_path = f"hf://buckets/gradio/pypi-previews/{commit_sha}"
    try:
        files = fs.ls(bucket_path, detail=False)
    except FileNotFoundError:
        print(
            f"ERROR: No wheel found for commit {commit_sha[:12]}.\n"
            f"Not every commit has a preview wheel — only CI-built ones do.\n"
            f"Looked in: {bucket_path}",
            file=sys.stderr,
        )
        sys.exit(1)

    wheel_files = [f for f in files if f.endswith(".whl")]
    if not wheel_files:
        print(
            f"ERROR: No .whl file found in {bucket_path}\nFiles found: {files}",
            file=sys.stderr,
        )
        sys.exit(1)

    wheel_filename = Path(wheel_files[0]).name
    return f"https://huggingface.co/buckets/gradio/pypi-previews/resolve/{commit_sha}/{wheel_filename}"


def is_space_id(app: str) -> bool:
    """Check if an app argument is a HF Space ID (e.g. 'mrfakename/z-image-turbo')."""
    return "/" in app and not app.endswith(".py") and not Path(app).exists()


def space_id_to_image(space_id: str) -> str:
    """Convert a HF Space ID to its Docker image URL.

    Example: 'mrfakename/z-image-turbo' -> 'registry.hf.space/mrfakename-z-image-turbo:latest'
    """
    return f"registry.hf.space/{space_id.replace('/', '-')}:latest"


def encode_file(path: str) -> tuple[str, str]:
    """Read and base64-encode a file. Returns (stem, b64_content)."""
    p = Path(path)
    content = p.read_bytes()
    b64 = base64.b64encode(content).decode("ascii")
    return p.stem, b64


def build_script(
    *,
    wheel_url: str,
    app_files: list[tuple[str, str]],
    sidecar_files: list[tuple[str, str]],
    runner_b64: str,
    tiers: str,
    requests_per_user: int,
    mode: str,
    concurrency_limit: str,
    port: int,
    api_name: str | None,
    run_name: str,
    branch: str,
    commit_sha: str,
    timestamp: str,
    max_threads: int,
    mixed_traffic: bool = False,
    num_workers: int = 1,
    use_nginx: bool = False,
) -> str:
    """Build the bash script that runs inside the HF Jobs container."""
    bucket_dest = f"hf://buckets/gradio/backend-benchmarks/{run_name}/{branch}"
    outputs_bucket_dest = f"hf://buckets/gradio/backend-benchmark-outputs/{run_name}/{branch}"

    lines = [
        "#!/bin/bash",
        "set -e",
        "",
        "# Disable Python output buffering so logs stream in real-time",
        "export PYTHONUNBUFFERED=1",
        "",
        "# Increase file descriptor limit for mixed traffic benchmarks",
        "ulimit -n 65536 2>/dev/null || true",
        "",
        "# Install system dependencies",
        "apt-get update && apt-get install -y --no-install-recommends ffmpeg nginx && rm -rf /var/lib/apt/lists/*",
        "",
        "# Install Python dependencies",
        f"pip install '{wheel_url}' httpx tqdm numpy 'huggingface-hub[hf_xet]'",
        "",
        "# Decode runner",
        f"echo '{runner_b64}' | base64 -d > /tmp/runner.py",
        "",
        "# Decode app files",
        "mkdir -p /tmp/apps",
    ]

    for stem, b64 in app_files:
        lines.append(f"echo '{b64}' | base64 -d > /tmp/apps/{stem}.py")

    # Decode sidecar prompt files (if any)
    for stem, b64 in sidecar_files:
        lines.append(f"echo '{b64}' | base64 -d > /tmp/apps/{stem}")

    app_names = [stem for stem, _ in app_files]
    run_params = json.dumps(
        {
            "run_name": run_name,
            "branch": branch,
            "commit_sha": commit_sha,
            "wheel_url": wheel_url,
            "apps": app_names,
            "tiers": tiers,
            "requests_per_user": requests_per_user,
            "mode": mode,
            "concurrency_limit": concurrency_limit,
            "port": port,
            "api_name": api_name,
            "timestamp": timestamp,
            "max_threads": max_threads,
            "mixed_traffic": mixed_traffic,
            "num_workers": num_workers,
            "nginx": use_nginx,
        },
        indent=2,
    )
    lines.extend(
        [
            "",
            "# Save runner script and run parameters to results for reproducibility",
            "mkdir -p /tmp/results",
            "cp /tmp/runner.py /tmp/results/runner.py",
            "cat << 'PARAMS_EOF' > /tmp/results/run_params.json",
            run_params,
            "PARAMS_EOF",
            "",
            "# Write upload helper script",
            "cat << 'UPLOAD_SCRIPT_EOF' > /tmp/upload.py",
            "import sys, os",
            "from huggingface_hub import HfFileSystem",
            "src_dir, bucket = sys.argv[1], sys.argv[2]",
            "fs = HfFileSystem()",
            "for root, dirs, files in os.walk(src_dir):",
            "    for f in files:",
            "        local = os.path.join(root, f)",
            "        remote = local.replace('/tmp/results', bucket)",
            "        print(f'Uploading {local} -> {remote}')",
            "        fs.put_file(local, remote)",
            "UPLOAD_SCRIPT_EOF",
            "",
            "# Upload a directory to the bucket",
            "upload_dir() {",
            f'    python /tmp/upload.py "$1" "{bucket_dest}"',
            "}",
            "",
            "# Upload only samples/ subdirs to a separate bucket",
            "upload_outputs() {",
            '    for d in $(find "$1" -type d -name samples 2>/dev/null); do',
            f'        python /tmp/upload.py "$d" "{outputs_bucket_dest}"',
            "    done",
            "}",
            "",
            "# Upload run metadata (params + runner script) immediately",
            "upload_dir /tmp/results",
            "",
            "# Run benchmarks sequentially (disable set -e so partial results are kept)",
            "set +e",
            "benchmark_exit=0",
        ]
    )

    for stem, _ in app_files:
        cmd_lines = [
            f'echo "=== Benchmarking {stem} ==="',
            f"python -u /tmp/runner.py \\",
            f"    --app /tmp/apps/{stem}.py \\",
            f"    --tiers {tiers} \\",
            f"    --requests-per-user {requests_per_user} \\",
            f"    --mode {mode} \\",
            f"    --concurrency-limit {concurrency_limit} \\",
            f"    --max-threads {max_threads} \\",
            f"    --port {port} \\",
        ]
        if api_name:
            cmd_lines.append(f"    --api-name {api_name} \\")
        if mixed_traffic:
            cmd_lines.append(f"    --mixed-traffic \\")
        if num_workers > 1:
            cmd_lines.append(f"    --num-workers {num_workers} \\")
        if use_nginx:
            cmd_lines.append(f"    --nginx \\")
        cmd_lines.extend(
            [
                f"    --output-dir /tmp/results/{stem}",
                f'if [ $? -ne 0 ]; then echo "WARNING: {stem} benchmark failed"; benchmark_exit=1; fi',
                f'echo "Uploading {stem} results..."',
                f"upload_dir /tmp/results/{stem}",
                f'echo "Uploading {stem} sample outputs..."',
                f"upload_outputs /tmp/results/{stem}",
                "",
            ]
        )
        lines.extend(cmd_lines)

    lines.extend(
        [
            f'echo "All results uploaded to {bucket_dest}/"',
            "exit $benchmark_exit",
        ]
    )

    return "\n".join(lines)


def build_space_script(
    *,
    wheel_url: str,
    space_id: str,
    runner_b64: str,
    sidecar_files: list[tuple[str, str]],
    tiers: str,
    requests_per_user: int,
    mode: str,
    concurrency_limit: str,
    port: int,
    api_name: str | None,
    run_name: str,
    branch: str,
    commit_sha: str,
    timestamp: str,
    max_threads: int,
    mixed_traffic: bool = False,
    num_workers: int = 1,
    use_nginx: bool = False,
    app_path: str = "app.py",
) -> str:
    """Build the bash script for benchmarking a HF Space with a custom gradio wheel."""
    bucket_dest = f"hf://buckets/gradio/backend-benchmarks/{run_name}/{branch}"
    outputs_bucket_dest = f"hf://buckets/gradio/backend-benchmark-outputs/{run_name}/{branch}"
    app_stem = space_id.replace("/", "_")

    run_params = json.dumps(
        {
            "run_name": run_name,
            "branch": branch,
            "commit_sha": commit_sha,
            "wheel_url": wheel_url,
            "space_id": space_id,
            "app_path": app_path,
            "tiers": tiers,
            "requests_per_user": requests_per_user,
            "mode": mode,
            "concurrency_limit": concurrency_limit,
            "port": port,
            "api_name": api_name,
            "timestamp": timestamp,
            "max_threads": max_threads,
            "mixed_traffic": mixed_traffic,
            "num_workers": num_workers,
            "nginx": use_nginx,
        },
        indent=2,
    )

    lines = [
        "#!/bin/bash",
        "set -e",
        "",
        "# Disable Python output buffering so logs stream in real-time",
        "export PYTHONUNBUFFERED=1",
        "",
        "# Increase file descriptor limit for mixed traffic benchmarks",
        "ulimit -n 65536 2>/dev/null || true",
        "",
        "# Install the gradio wheel under test (overrides the version baked into the space)",
        "# Force upgrade huggingface-hub since the space image may have an old version without bucket support",
        f"pip install --upgrade '{wheel_url}' httpx tqdm numpy 'huggingface-hub[hf_xet]'",
        "",
        "# Decode runner",
        f"echo '{runner_b64}' | base64 -d > /tmp/runner.py",
        "",
    ]

    # Decode sidecar files into the app's working directory, renamed to match app_path
    sidecar_dest = Path(app_path).with_suffix(".prompts.json").name
    if sidecar_files:
        lines.append("# Decode sidecar prompt files")
        for _, b64 in sidecar_files:
            lines.append(f"echo '{b64}' | base64 -d > /home/user/app/{sidecar_dest}")
        lines.append("")

    lines.extend(
        [
            "# Save run parameters for reproducibility",
            "mkdir -p /tmp/results",
            "cp /tmp/runner.py /tmp/results/runner.py",
            "cat << 'PARAMS_EOF' > /tmp/results/run_params.json",
            run_params,
            "PARAMS_EOF",
            "",
            "# Write upload helper script",
            "cat << 'UPLOAD_SCRIPT_EOF' > /tmp/upload.py",
            "import sys, os",
            "from huggingface_hub import HfFileSystem",
            "src_dir, bucket = sys.argv[1], sys.argv[2]",
            "fs = HfFileSystem()",
            "for root, dirs, files in os.walk(src_dir):",
            "    for f in files:",
            "        local = os.path.join(root, f)",
            "        remote = local.replace('/tmp/results', bucket)",
            "        print(f'Uploading {local} -> {remote}')",
            "        fs.put_file(local, remote)",
            "UPLOAD_SCRIPT_EOF",
            "",
            "# Upload a directory to the bucket",
            "upload_dir() {",
            f'    python /tmp/upload.py "$1" "{bucket_dest}"',
            "}",
            "",
            "# Upload only samples/ subdirs to a separate bucket",
            "upload_outputs() {",
            '    for d in $(find "$1" -type d -name samples 2>/dev/null); do',
            f'        python /tmp/upload.py "$d" "{outputs_bucket_dest}"',
            "    done",
            "}",
            "",
            "# Upload run metadata immediately",
            "upload_dir /tmp/results",
            "",
            f"# Run benchmark against the space app (working dir is /home/user/app)",
            "set +e",
            "benchmark_exit=0",
            "",
            f'echo "=== Benchmarking space {space_id} ==="',
        ]
    )

    cmd_lines = [
        f"python -u /tmp/runner.py \\",
        f"    --app {app_path} \\",
        f"    --tiers {tiers} \\",
        f"    --requests-per-user {requests_per_user} \\",
        f"    --mode {mode} \\",
        f"    --concurrency-limit {concurrency_limit} \\",
        f"    --max-threads {max_threads} \\",
        f"    --port {port} \\",
    ]
    if api_name:
        cmd_lines.append(f"    --api-name {api_name} \\")
    if mixed_traffic:
        cmd_lines.append(f"    --mixed-traffic \\")
    if use_nginx:
        cmd_lines.append(f"    --nginx \\")
    cmd_lines.extend(
        [
            f"    --output-dir /tmp/results/{app_stem}",
            f'if [ $? -ne 0 ]; then echo "WARNING: {app_stem} benchmark failed"; benchmark_exit=1; fi',
            f'echo "Uploading {app_stem} results..."',
            f"upload_dir /tmp/results/{app_stem}",
            f'echo "Uploading {app_stem} sample outputs..."',
            f"upload_outputs /tmp/results/{app_stem}",
            "",
        ]
    )
    lines.extend(cmd_lines)

    lines.extend(
        [
            f'echo "All results uploaded to {bucket_dest}/"',
            "exit $benchmark_exit",
        ]
    )

    return "\n".join(lines)


def parse_timeout(timeout_str: str) -> int:
    """Parse a timeout string like '30m', '1h', '90s' into seconds."""
    timeout_str = timeout_str.strip().lower()
    if timeout_str.endswith("m"):
        return int(timeout_str[:-1]) * 60
    elif timeout_str.endswith("h"):
        return int(timeout_str[:-1]) * 3600
    elif timeout_str.endswith("s"):
        return int(timeout_str[:-1])
    else:
        return int(timeout_str)


def prepare_job(
    *,
    apps: list[str],
    branch: str,
    commit: str | None,
    hardware: str,
    tiers: str,
    requests_per_user: int,
    mode: str,
    concurrency_limit: str,
    timeout: str,
    run_name: str,
    port: int,
    api_name: str | None,
    dry_run: bool,
    max_threads: int,
    sidecar: list[str] | None = None,
    mixed_traffic: bool = False,
    num_workers: int = 1,
    use_nginx: bool = False,
) -> dict | None:
    """Resolve inputs, build script, and submit a single benchmark job.

    Returns a dict with job info, or None for dry runs.
    """
    # Resolve commit SHA
    if commit:
        commit_sha = commit
        print(f"[{branch}] Using provided commit SHA: {commit_sha[:12]}")
    else:
        print(f"[{branch}] Resolving to commit SHA...")
        commit_sha = resolve_commit_sha(branch)
        print(f"[{branch}]   -> {commit_sha[:12]}")

    # Resolve wheel URL
    print(f"[{branch}] Looking up wheel...")
    wheel_url = resolve_wheel_url(commit_sha)
    print(f"[{branch}]   -> {wheel_url}")

    # Encode runner
    runner_path = Path(__file__).parent / "runner.py"
    if not runner_path.exists():
        print(f"ERROR: runner.py not found at {runner_path}", file=sys.stderr)
        sys.exit(1)
    _, runner_b64 = encode_file(str(runner_path))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Determine if we're benchmarking space IDs or local app files
    space_ids = [a for a in apps if is_space_id(a)]
    local_apps = [a for a in apps if not is_space_id(a)]

    if space_ids and local_apps:
        print(
            "ERROR: Cannot mix space IDs and local app files in --apps",
            file=sys.stderr,
        )
        sys.exit(1)

    # Encode explicit --sidecar files
    explicit_sidecar_files = []
    if sidecar:
        for sc_path in sidecar:
            p = Path(sc_path)
            if not p.exists():
                print(f"ERROR: Sidecar file not found: {sc_path}", file=sys.stderr)
                sys.exit(1)
            b64 = base64.b64encode(p.read_bytes()).decode("ascii")
            explicit_sidecar_files.append((p.name, b64))

    if space_ids:
        if len(space_ids) > 1:
            print(
                "ERROR: Only one space ID is supported per job (each space needs its own Docker image)",
                file=sys.stderr,
            )
            sys.exit(1)
        space_id = space_ids[0]
        image = space_id_to_image(space_id)
        script = build_space_script(
            wheel_url=wheel_url,
            space_id=space_id,
            runner_b64=runner_b64,
            sidecar_files=explicit_sidecar_files,
            tiers=tiers,
            requests_per_user=requests_per_user,
            mode=mode,
            concurrency_limit=concurrency_limit,
            port=port,
            api_name=api_name,
            run_name=run_name,
            branch=branch,
            commit_sha=commit_sha,
            timestamp=timestamp,
            max_threads=max_threads,
            mixed_traffic=mixed_traffic,
            num_workers=num_workers,
            use_nginx=use_nginx,
        )
    else:
        image = "python:3.12"
        app_files = []
        auto_sidecar_files = []
        for app_path in local_apps:
            stem, b64 = encode_file(app_path)
            app_files.append((stem, b64))
            # Auto-detect sidecar prompt file
            sidecar_path = Path(app_path).with_suffix(".prompts.json")
            if sidecar_path.exists():
                sc_b64 = base64.b64encode(sidecar_path.read_bytes()).decode("ascii")
                auto_sidecar_files.append((sidecar_path.name, sc_b64))

        script = build_script(
            wheel_url=wheel_url,
            app_files=app_files,
            sidecar_files=auto_sidecar_files + explicit_sidecar_files,
            runner_b64=runner_b64,
            tiers=tiers,
            requests_per_user=requests_per_user,
            mode=mode,
            concurrency_limit=concurrency_limit,
            port=port,
            api_name=api_name,
            run_name=run_name,
            branch=branch,
            commit_sha=commit_sha,
            timestamp=timestamp,
            max_threads=max_threads,
            mixed_traffic=mixed_traffic,
            num_workers=num_workers,
            use_nginx=use_nginx,
        )

    timeout_secs = parse_timeout(timeout)
    bucket_dest = f"hf://buckets/gradio/backend-benchmarks/{run_name}/{branch}"

    if dry_run:
        print(f"\n{'=' * 60}")
        print(f"DRY RUN [{branch}] — Generated bash script:")
        print(f"{'=' * 60}")
        print(script)
        print(f"{'=' * 60}")
        print(f"  Image: {image}")
        print(f"  Hardware: {hardware}")
        print(f"  Timeout: {timeout_secs}s ({timeout})")
        print(f"  Bucket dest: {bucket_dest}/")
        return None

    from huggingface_hub import get_token, run_job, whoami
    from huggingface_hub.errors import HfHubHTTPError

    token = get_token()
    use_gradio_namespace = False
    if not token:
        print(
            "ERROR: No HF token found. Run `huggingface-cli login` first.",
            file=sys.stderr,
        )
        sys.exit(1)
    try:
        use_gradio_namespace = any(o['name'] == "gradio" for o in whoami()['orgs'])
    except HfHubHTTPError:
        use_gradio_namespace = False

    print(f"[{branch}] Submitting job (hardware={hardware}, image={image})...")
    job = run_job(
        image=image,
        command=["bash", "-c", script],
        flavor=hardware,
        timeout=timeout_secs,
        secrets={"HF_TOKEN": token},
        namespace="gradio" if use_gradio_namespace else None
    )

    return {
        "branch": branch,
        "commit_sha": commit_sha[:12],
        "job_id": job.id,
        "job_url": job.url,
        "hardware": hardware,
        "timeout": timeout,
        "bucket": bucket_dest,
    }


def add_common_args(parser: argparse.ArgumentParser):
    """Add arguments shared by both 'run' and 'ab' subcommands."""
    parser.add_argument(
        "--apps",
        nargs="+",
        required=True,
        help="Paths to local Gradio app files or a HF Space ID (e.g. mrfakename/z-image-turbo)",
    )
    parser.add_argument(
        "--hardware",
        default="cpu-basic",
        help="HF Jobs hardware flavor. Default: cpu-basic",
    )
    parser.add_argument(
        "--tiers",
        default="1,10,100",
        help="Comma-separated concurrency tiers. Default: 1,10,100",
    )
    parser.add_argument(
        "--requests-per-user",
        type=int,
        default=10,
        help="Rounds per tier. Default: 10",
    )
    parser.add_argument(
        "--mode",
        choices=["burst", "wave"],
        default="burst",
        help="Load pattern. Default: burst",
    )
    parser.add_argument(
        "--concurrency-limit",
        default="1",
        help="App concurrency limit ('none' for unlimited). Default: 1",
    )
    parser.add_argument(
        "--max-threads",
        default="40",
        help="Max threads in the starlette thread pool. Default: 40",
    )
    parser.add_argument(
        "--timeout",
        default="90m",
        help="Job timeout (e.g. 30m, 1h, 90s). Default: 90m",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=7860,
        help="App port. Default: 7860",
    )
    parser.add_argument(
        "--api-name",
        default=None,
        help="API endpoint name (auto-detected if not specified)",
    )
    parser.add_argument(
        "--sidecar",
        nargs="+",
        default=None,
        help="Sidecar prompt files (.prompts.json) to upload alongside apps",
    )
    parser.add_argument(
        "--mixed-traffic",
        action="store_true",
        help="Run background traffic (page loads, uploads, downloads, heartbeats) alongside predictions",
    )
    parser.add_argument(
        "--num-workers",
        type=int,
        default=1,
        help="Number of Gradio workers (sets GRADIO_NUM_WORKERS). Default: 1",
    )
    parser.add_argument(
        "--nginx",
        action="store_true",
        help="Put nginx in front to route static traffic to workers (requires --num-workers > 1)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the Docker command and job config without submitting",
    )


def cmd_run(args):
    """Handle the 'run' subcommand."""
    for app_path in args.apps:
        if not is_space_id(app_path) and not Path(app_path).exists():
            print(f"ERROR: App file not found: {app_path}", file=sys.stderr)
            sys.exit(1)

    branch = args.branch
    run_name = args.run_name or f"bench_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    result = prepare_job(
        apps=args.apps,
        branch=branch,
        commit=args.commit,
        hardware=args.hardware,
        tiers=args.tiers,
        requests_per_user=args.requests_per_user,
        mode=args.mode,
        concurrency_limit=args.concurrency_limit,
        timeout=args.timeout,
        run_name=run_name,
        port=args.port,
        api_name=args.api_name,
        dry_run=args.dry_run,
        max_threads=args.max_threads,
        sidecar=args.sidecar,
        mixed_traffic=args.mixed_traffic,
        num_workers=args.num_workers,
        use_nginx=args.nginx,
    )

    if result:
        print(f"\nJob submitted!")
        print(f"  Job ID:  {result['job_id']}")
        print(f"  URL:     {result['job_url']}")
        print(f"  Results: {result['bucket']}/")


def cmd_ab(args):
    """Handle the 'ab' subcommand — submit two jobs for A/B comparison."""
    for app_path in args.apps:
        if not is_space_id(app_path) and not Path(app_path).exists():
            print(f"ERROR: App file not found: {app_path}", file=sys.stderr)
            sys.exit(1)

    run_name = args.run_name or f"ab_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    app_names = [a if is_space_id(a) else Path(a).stem for a in args.apps]

    print(f"A/B Test: {args.base} vs {args.branch}")
    print(f"  Run name: {run_name}")
    print(f"  Apps: {', '.join(app_names)}")
    print(f"  Tiers: {args.tiers}")
    print(f"  Requests/user: {args.requests_per_user}")
    print(f"  Hardware: {args.hardware}")
    print()

    common = dict(
        apps=args.apps,
        commit=None,
        hardware=args.hardware,
        tiers=args.tiers,
        requests_per_user=args.requests_per_user,
        mode=args.mode,
        concurrency_limit=args.concurrency_limit,
        timeout=args.timeout,
        run_name=run_name,
        port=args.port,
        api_name=args.api_name,
        dry_run=args.dry_run,
        max_threads=args.max_threads,
        sidecar=args.sidecar,
        mixed_traffic=args.mixed_traffic,
        num_workers=args.num_workers,
        use_nginx=args.nginx,
    )

    result_a = prepare_job(branch=args.base, **common)
    result_b = prepare_job(branch=args.branch, **common)

    if args.dry_run:
        return

    print()
    print("=" * 60)
    print(f"A/B Test submitted: {run_name}")
    print("=" * 60)
    print()
    print(f"  Base ({args.base}):")
    print(f"    Commit:  {result_a['commit_sha']}")
    print(f"    Job ID:  {result_a['job_id']}")
    print(f"    URL:     {result_a['job_url']}")
    print(f"    Results: {result_a['bucket']}/")
    print()
    print(f"  Branch ({args.branch}):")
    print(f"    Commit:  {result_b['commit_sha']}")
    print(f"    Job ID:  {result_b['job_id']}")
    print(f"    URL:     {result_b['job_url']}")
    print(f"    Results: {result_b['bucket']}/")
    print()
    print(f"  Both results under: hf://buckets/gradio/backend-benchmarks/{run_name}/")
    print()
    print("Monitor:")
    print(f"  hf jobs logs {result_a['job_id']}")
    print(f"  hf jobs logs {result_b['job_id']}")


def main():
    parser = argparse.ArgumentParser(
        description="Submit Gradio benchmarks to HF Jobs for reproducible results"
    )
    subparsers = parser.add_subparsers(dest="command")

    # --- run subcommand ---
    run_parser = subparsers.add_parser("run", help="Run benchmarks on a single branch")
    add_common_args(run_parser)
    run_parser.add_argument(
        "--branch",
        default="main",
        help="Git branch to benchmark. Default: main",
    )
    run_parser.add_argument(
        "--commit",
        default=None,
        help="Direct commit SHA (overrides --branch)",
    )
    run_parser.add_argument(
        "--run-name",
        default=None,
        help="Human-readable label. Default: auto-generated",
    )

    # --- ab subcommand ---
    ab_parser = subparsers.add_parser(
        "ab", help="A/B test two branches with identical settings"
    )
    add_common_args(ab_parser)
    ab_parser.add_argument(
        "--base",
        default="main",
        help="Base branch (A). Default: main",
    )
    ab_parser.add_argument(
        "--branch",
        required=True,
        help="Branch to compare (B)",
    )
    ab_parser.add_argument(
        "--run-name",
        default=None,
        help="Shared label for both jobs. Default: auto-generated",
    )

    args = parser.parse_args()

    if args.command == "run":
        cmd_run(args)
    elif args.command == "ab":
        cmd_ab(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

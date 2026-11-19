"""Device telemetry, independent of the model's ML framework."""

import ctypes
import os
import platform
import shutil
import subprocess
import time
from pathlib import Path
from typing import Any

import psutil

GPU_SECONDS = 2


def nvidia_smi(query: str, fields: str) -> list[list[str]]:
    output = subprocess.run(
        ["nvidia-smi", f"--query-{query}={fields}", "--format=csv,noheader,nounits"],
        capture_output=True,
        text=True,
        timeout=10,
        check=True,
    ).stdout
    return [
        [field.strip() for field in line.split(",")]
        for line in output.splitlines()
        if line.strip()
    ]


def megabytes(value: str) -> int:
    return int(value) * 2**20 if value.isdigit() else 0


class Memory:
    def __init__(self):
        self.kind = "cpu"
        self.telemetry_error = None
        self.gpu: tuple[float, dict[str, Any]] | None = None
        if platform.system() == "Darwin":
            self.kind = "unified"
            self.libproc = ctypes.CDLL("/usr/lib/libproc.dylib")
        elif shutil.which("nvidia-smi"):
            self.kind = "cuda"
        elif os.path.exists("/dev/nvidiactl"):
            self.kind = "cuda"
            self.telemetry_error = "nvidia-smi was not found"

    def gpu_sample(self, pids) -> dict[str, Any]:
        """Free memory on the GPUs the app's processes use, and how much each
        uses, from nvidia-smi. It's read every GPU_SECONDS, as it takes about
        100 ms."""
        if self.gpu is not None and time.monotonic() - self.gpu[0] < GPU_SECONDS:
            return self.gpu[1]
        gpus = {
            uuid: (int(index), megabytes(total), megabytes(free))
            for index, uuid, total, free in nvidia_smi(
                "gpu", "index,uuid,memory.total,memory.free"
            )
        }
        used: dict[str, dict[int, int]] = {}
        for pid, uuid, memory in nvidia_smi("compute-apps", "pid,gpu_uuid,used_memory"):
            if pid.isdigit() and int(pid) in pids:
                used.setdefault(uuid, {})[int(pid)] = megabytes(memory)
        app_gpus = [uuid for uuid in gpus if uuid in used] or self.visible(gpus)
        result: dict[str, Any] = {"processes": {}}
        if app_gpus:
            # With several GPUs, the one with the least free memory decides
            _, total, free = min((gpus[uuid] for uuid in app_gpus), key=lambda g: g[2])
            result.update(gpu_total=total, gpu_available=free)
        for per_process in used.values():
            for pid, memory in per_process.items():
                current = result["processes"].get(pid, 0)
                result["processes"][pid] = max(current, memory)
        self.gpu = (time.monotonic(), result)
        return result

    @staticmethod
    def visible(gpus: dict[str, tuple[int, int, int]]) -> list[str]:
        """The app's first GPU before it has used any: the first of
        CUDA_VISIBLE_DEVICES, by UUID or index, or else GPU 0."""
        first = os.environ.get("CUDA_VISIBLE_DEVICES", "0").split(",")[0].strip()
        for uuid, (index, _, _) in gpus.items():
            if first in (uuid, str(index)) or (first and uuid.startswith(first)):
                return [uuid]
        return []

    def sample(self, pids):
        vm = psutil.virtual_memory()
        result: dict[str, Any] = {
            "kind": self.kind,
            "total": vm.total,
            "available": vm.available,
            "processes": {},
        }
        if self.telemetry_error:
            result["error"] = self.telemetry_error
        # A container's memory limit, which psutil doesn't see
        if platform.system() == "Linux":
            for limit_path, usage_path in [
                ("/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory.current"),
                (
                    "/sys/fs/cgroup/memory/memory.limit_in_bytes",
                    "/sys/fs/cgroup/memory/memory.usage_in_bytes",
                ),
            ]:
                try:
                    limit = int(Path(limit_path).read_text().strip())
                    usage = int(Path(usage_path).read_text().strip())
                except (OSError, ValueError):
                    continue
                if 0 < limit < result["total"]:
                    result["total"] = limit
                    result["available"] = min(
                        result["available"], max(0, limit - usage)
                    )
                break
        for pid in pids:
            try:
                rss = psutil.Process(pid).memory_info().rss
                if self.kind == "unified":
                    # rusage_info_v2: UUID (16 bytes), then eight uint64 fields;
                    # phys_footprint is the eighth uint64 (offset 72).
                    buf = ctypes.create_string_buffer(512)
                    if self.libproc.proc_pid_rusage(pid, 2, ctypes.byref(buf)) == 0:
                        rss = max(rss, ctypes.c_uint64.from_buffer(buf, 72).value)
                result["processes"][pid] = {"ram": rss, "gpu": 0}
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        if self.kind == "cuda" and not self.telemetry_error:
            try:
                gpu = self.gpu_sample(set(pids))
            except (OSError, subprocess.SubprocessError, ValueError) as exc:
                result["error"] = f"nvidia-smi failed: {exc}"
                return result
            if "gpu_total" in gpu:
                result.update(
                    gpu_total=gpu["gpu_total"], gpu_available=gpu["gpu_available"]
                )
            else:
                result["kind"] = "cpu"
            for pid, memory in gpu["processes"].items():
                if pid in result["processes"]:
                    result["processes"][pid]["gpu"] = memory
        return result


def admission(snapshot, ram_peak, gpu_peak, reserve_fraction=0.15):
    """Require a complete extra replica plus a global reserve, never double-count UMA."""
    if snapshot.get("error") or ram_peak <= 0:
        return False, "Memory telemetry unavailable"
    reserve = max(1024**3, snapshot["total"] * reserve_fraction)
    if snapshot["available"] < ram_peak * 1.25 + reserve:
        return False, "Insufficient system/unified memory headroom"
    if snapshot["kind"] == "cuda":
        if "gpu_available" not in snapshot:
            return False, "GPU telemetry unavailable"
        reserve = max(1024**3, snapshot["gpu_total"] * reserve_fraction)
        if snapshot["gpu_available"] < gpu_peak * 1.25 + reserve:
            return False, "Insufficient GPU memory headroom"
    return True, "Observed replica peak plus 25% margin and 15% device reserve fits"

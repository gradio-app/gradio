"""Device telemetry, independent of the model's ML framework."""

import ctypes
import os
import platform
from pathlib import Path
from typing import Any

import psutil


class Memory:
    def __init__(self):
        self.nvml = None
        self.device = None
        self.kind = "cpu"
        self.telemetry_error = None
        if platform.system() == "Darwin":
            self.kind = "unified"
            self.libproc = ctypes.CDLL("/usr/lib/libproc.dylib")
        try:
            import pynvml  # ty: ignore[unresolved-import]

            pynvml.nvmlInit()
            if pynvml.nvmlDeviceGetCount():
                self.nvml = pynvml
                self.device = pynvml.nvmlDeviceGetHandleByIndex(0)
                self.kind = "cuda"
        except Exception as exc:  # noqa: BLE001 -- optional device telemetry
            if os.path.exists("/dev/nvidiactl"):
                self.kind = "cuda"
                self.telemetry_error = str(exc)

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
        if self.nvml:
            try:
                mem = self.nvml.nvmlDeviceGetMemoryInfo(self.device)
                result.update(gpu_total=mem.total, gpu_available=mem.free)
                for p in self.nvml.nvmlDeviceGetComputeRunningProcesses(self.device):
                    if p.pid in result["processes"] and p.usedGpuMemory is not None:
                        result["processes"][p.pid]["gpu"] = p.usedGpuMemory
            except Exception as exc:  # noqa: BLE001 -- disable expansion on provider failure
                result["error"] = str(exc)
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

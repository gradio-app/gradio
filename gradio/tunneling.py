import atexit
import hashlib
import os
import platform
import re
import stat
import subprocess
import sys
import time
from pathlib import Path

import httpx
from huggingface_hub.constants import HF_HOME

from gradio.exceptions import ChecksumMismatchError

VERSION = "0.3"
CURRENT_TUNNELS: list["Tunnel"] = []

machine = platform.machine()
if machine == "x86_64":
    machine = "amd64"
elif machine == "aarch64":
    machine = "arm64"

BINARY_REMOTE_NAME = f"frpc_{platform.system().lower()}_{machine.lower()}"
EXTENSION = ".exe" if os.name == "nt" else ""
BINARY_URL = f"https://cdn-media.huggingface.co/frpc-gradio-{VERSION}/{BINARY_REMOTE_NAME}{EXTENSION}"

CHECKSUMS = {
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_windows_amd64.exe": "14bc0ea470be5d67d79a07412bd21de8a0a179c6ac1116d7764f68e942dc9ceb",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_amd64": "c791d1f047b41ff5885772fc4bf20b797c6059bbd82abb9e31de15e55d6a57c4",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_arm64": "823ced25104de6dc3c9f4798dbb43f20e681207279e6ab89c40e2176ccbf70cd",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_darwin_amd64": "930f8face3365810ce16689da81b7d1941fda4466225a7bbcbced9a2916a6e15",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_darwin_arm64": "dfac50c690aca459ed5158fad8bfbe99f9282baf4166cf7c410a6673fbc1f327",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_arm": "4b563beb2e36c448cc688174e20b53af38dc1ff2b5e362d4ddd1401f2affbfb7",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_freebsd_386": "cb0a56c764ecf96dd54ed601d240c564f060ee4e58202d65ffca17c1a51ce19c",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_freebsd_amd64": "516d9e6903513869a011ddcd1ec206167ad1eb5dd6640d21057acc258edecbbb",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_386": "4c2f2a48cd71571498c0ac8a4d42a055f22cb7f14b4b5a2b0d584220fd60a283",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_mips": "b309ecd594d4f0f7f33e556a80d4b67aef9319c00a8334648a618e56b23cb9e0",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_mips64": "0372ef5505baa6f3b64c6295a86541b24b7b0dbe4ef28b344992e21f47624b7b",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_riscv64": "1658eed7e8c14ea76e1d95749d58441ce24147c3d559381832c725c29cfc3df3",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_mipsle": "a2aaba16961d3372b79bd7a28976fcd0f0bbaebc2b50d5a7a71af2240747960f",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_windows_386.exe": "721b90550195a83e15f2176d8f85a48d5a25822757cb872e9723d4bccc4e5bb6",
    "https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_linux_mips64le": "796481edd609f31962b45cc0ab4c9798d040205ae3bf354ed1b72fb432d796b8",
}

CHUNK_SIZE = 128

BINARY_FILENAME = f"{BINARY_REMOTE_NAME}_v{VERSION}"
BINARY_FOLDER = Path(HF_HOME) / "gradio" / "frpc"
BINARY_PATH = str(BINARY_FOLDER / BINARY_FILENAME)

TUNNEL_TIMEOUT_SECONDS = 30
TUNNEL_ERROR_MESSAGE = (
    "Could not create share URL. "
    "Please check the appended log from frpc for more information:"
)

CERTIFICATE_PATH = ".gradio/certificate.pem"


class Tunnel:
    def __init__(
        self,
        remote_host: str,
        remote_port: int,
        local_host: str,
        local_port: int,
        share_token: str,
        share_server_tls_certificate: str | None,
    ):
        self.proc = None
        self.url = None
        self.remote_host = remote_host
        self.remote_port = remote_port
        self.local_host = local_host
        self.local_port = local_port
        self.share_token = share_token
        self.share_server_tls_certificate = share_server_tls_certificate

    @staticmethod
    def download_binary():
        if not Path(BINARY_PATH).exists():
            Path(BINARY_FOLDER).mkdir(parents=True, exist_ok=True)
            resp = httpx.get(BINARY_URL, timeout=30)

            if resp.status_code == 403:
                raise OSError(
                    f"Cannot set up a share link as this platform is incompatible. Please "
                    f"create a GitHub issue with information about your platform: {platform.uname()}"
                )

            resp.raise_for_status()

            # Save file data to local copy
            with open(BINARY_PATH, "wb") as file:
                file.write(resp.content)
            st = os.stat(BINARY_PATH)
            os.chmod(BINARY_PATH, st.st_mode | stat.S_IEXEC)

            if BINARY_URL in CHECKSUMS:
                sha = hashlib.sha256()
                with open(BINARY_PATH, "rb") as f:
                    for chunk in iter(lambda: f.read(CHUNK_SIZE * sha.block_size), b""):
                        sha.update(chunk)
                calculated_hash = sha.hexdigest()

                if calculated_hash != CHECKSUMS[BINARY_URL]:
                    raise ChecksumMismatchError()

    def start_tunnel(self) -> str:
        self.download_binary()
        self.url = self._start_tunnel(BINARY_PATH)
        return self.url

    def kill(self):
        if self.proc is not None:
            print(f"Killing tunnel {self.local_host}:{self.local_port} <> {self.url}")
            self.proc.terminate()
            self.proc = None

    def _start_tunnel(self, binary: str) -> str:
        CURRENT_TUNNELS.append(self)
        command = [
            binary,
            "http",
            "-n",
            self.share_token,
            "-l",
            str(self.local_port),
            "-i",
            self.local_host,
            "--uc",
            "--sd",
            "random",
            "--ue",
            "--server_addr",
            f"{self.remote_host}:{self.remote_port}",
            "--disable_log_color",
        ]
        if self.share_server_tls_certificate is not None:
            command.extend(
                [
                    "--tls_enable",
                    "--tls_trusted_ca_file",
                    self.share_server_tls_certificate,
                ]
            )
        self.proc = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        atexit.register(self.kill)
        return self._read_url_from_tunnel_stream()

    def _read_url_from_tunnel_stream(self) -> str:
        start_timestamp = time.time()

        log = []
        url = ""

        def _raise_tunnel_error():
            log_text = "\n".join(log)
            print(log_text, file=sys.stderr)
            raise ValueError(f"{TUNNEL_ERROR_MESSAGE}\n{log_text}")

        while url == "":
            # check for timeout and log
            if time.time() - start_timestamp >= TUNNEL_TIMEOUT_SECONDS:
                _raise_tunnel_error()

            assert self.proc is not None  # noqa: S101
            if self.proc.stdout is None:
                continue

            line = self.proc.stdout.readline()
            line = line.decode("utf-8")

            if line == "":
                continue

            log.append(line.strip())

            if "start proxy success" in line:
                result = re.search("start proxy success: (.+)\n", line)
                if result is None:
                    _raise_tunnel_error()
                else:
                    url = result.group(1)
            elif "login to server failed" in line:
                _raise_tunnel_error()

        return url

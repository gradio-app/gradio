import asyncio
import os
import platform
import re
import threading
from typing import Optional

VERSION = "0.1"
CURRENT_TUNNEL: Optional["Tunnel"] = None


class Tunnel:
    def __init__(self, remote_host, remote_port, local_host, local_port):
        self.thread = None
        self.proc = None
        self.remote_host = remote_host
        self.remote_port = remote_port
        self.local_host = local_host
        self.local_port = local_port

    @staticmethod
    def download_binary():
        machine = platform.machine()
        if machine == "x86_64":
            machine = "amd64"

        # Check if the file exist
        binary_name = f"frpc_{platform.system().lower()}_{machine.lower()}"
        binary_path = os.path.join(os.path.dirname(__file__), binary_name)

        extension = ".exe" if os.name == "nt" else ""

        if not os.path.exists(binary_path):
            import stat

            import requests

            binary_url = f"https://cdn-media.huggingface.co/frpc-gradio-{VERSION}/{binary_name}{extension}"
            resp = requests.get(binary_url)

            if resp.status_code == 403:
                raise OSError(
                    f"Incompatible platform, please contact us {platform.uname()}"
                )

            resp.raise_for_status()

            # Save file data to local copy
            with open(binary_path, "wb") as file:
                file.write(resp.content)
            st = os.stat(binary_path)
            os.chmod(binary_path, st.st_mode | stat.S_IEXEC)

        return binary_path

    def start_tunnel(self) -> str:
        binary_path = self.download_binary()

        loop = asyncio.new_event_loop()
        url = loop.run_until_complete(self._start_tunnel(binary_path))

        def _inner_target():
            try:
                loop.run_forever()
            except Exception as e:
                print(e)

        self.thread = threading.Thread(target=_inner_target, daemon=True).start()

        return url

    def kill(self):
        self.proc.terminate()

    async def _start_tunnel(self, binary: str) -> str:
        global CURRENT_TUNNEL
        CURRENT_TUNNEL = self
        command = [
            binary,
            "http",
            "-n",
            "random",
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

        self.proc = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        url = ""
        while url == "":
            line = await self.proc.stdout.readline()
            line = line.decode("utf-8")
            if "start proxy success" in line:
                url = re.search("start proxy success: (.+)\n", line).group(1)
        return url

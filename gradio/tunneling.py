import asyncio
import os
import platform
import re
from asyncio import AbstractEventLoop

VERSION = "0.1"

def create_tunnel(
        remote_host, remote_port, local_host, local_port
) -> tuple[str, AbstractEventLoop]:
    loop = asyncio.new_event_loop()

    machine = platform.machine()
    if machine == "x86_64":
        machine = "amd64"

    # Check if the file exist
    binary_name = f"frpc_{platform.system().lower()}_{machine}"
    binary_path = f"{os.path.dirname(__file__)}/{binary_name}"

    if not os.path.exists(binary_path):
        import requests
        import stat

        print(f"Downloading tunnel binary {binary_name}")
        binary_url = f"https://cdn-media.huggingface.co/frpc-gradio-{VERSION}/{binary_name}"
        data = requests.get(binary_url)

        # Save file data to local copy
        with open(binary_path, 'wb') as file:
            file.write(data.content)
        st = os.stat(binary_path)
        os.chmod(binary_path, st.st_mode | stat.S_IEXEC)

    binary_url = loop.run_until_complete(start_tunnel(binary_path, remote_host, remote_port, local_host, local_port))

    return binary_url, loop


async def start_tunnel(binary: str, remote_host, remote_port, local_host, local_port):
    # ./frpc http -n test1 -l 7860 --uc --sd test1 --ue --server_addr 127.0.0.1:7000
    command = [
        binary,
        "http",
        "-n"
        "random",
        "-l",
        str(local_port),
        "-i",
        local_host,
        "-uc",
        "-sd",
        "random",
        "-ue",
        "--server_addr",
        f"{remote_host}:{remote_port}",
        "--disable_log_color"
    ]

    proc = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE)
    url = ""
    while url == "":
        line = await proc.stdout.readline()
        line = line.decode("utf-8")
        if "start proxy success" in line:
            url = re.search('start proxy success: (.+)\n', line).group(1)
    return url

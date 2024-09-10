"""
Defines helper methods useful for setting up ports, launching servers, and
creating tunnels.
"""

from __future__ import annotations

import os
import time
import warnings
from pathlib import Path

import httpx

from gradio.routes import App  # HACK: to avoid circular import # noqa: F401
from gradio.tunneling import CERTIFICATE_PATH, Tunnel

GRADIO_API_SERVER = "https://api.gradio.app/v3/tunnel-request"
GRADIO_SHARE_SERVER_ADDRESS = os.getenv("GRADIO_SHARE_SERVER_ADDRESS")


def setup_tunnel(
    local_host: str, local_port: int, share_token: str, share_server_address: str | None
) -> str:
    share_server_address = (
        GRADIO_SHARE_SERVER_ADDRESS
        if share_server_address is None
        else share_server_address
    )
    if share_server_address is None:
        try:
            response = httpx.get(GRADIO_API_SERVER, timeout=30)
            payload = response.json()[0]
            remote_host, remote_port = payload["host"], int(payload["port"])
            certificate = payload["root_ca"]
            Path(CERTIFICATE_PATH).parent.mkdir(parents=True, exist_ok=True)
            with open(CERTIFICATE_PATH, "w") as f:
                f.write(certificate)
        except Exception as e:
            raise RuntimeError(
                "Could not get share link from Gradio API Server."
            ) from e
    else:
        remote_host, remote_port = share_server_address.split(":")
        remote_port = int(remote_port)
    tunnel = Tunnel(remote_host, remote_port, local_host, local_port, share_token)
    address = tunnel.start_tunnel()
    return address


def url_ok(url: str) -> bool:
    try:
        for _ in range(5):
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore")
                r = httpx.head(url, timeout=3, verify=False)
            if r.status_code in (200, 401, 302):  # 401 or 302 if auth is set
                return True
            time.sleep(0.500)
    except (ConnectionError, httpx.ConnectError, httpx.TimeoutException):
        return False
    return False

"""
This file provides remote port forwarding functionality using paramiko package,
Inspired by: https://github.com/paramiko/paramiko/blob/master/demos/rforward.py
"""

import select
import socket
import sys
import threading
import warnings
from io import StringIO

from cryptography.utils import CryptographyDeprecationWarning

with warnings.catch_warnings():
    warnings.filterwarnings("ignore", category=CryptographyDeprecationWarning)
    import paramiko


def handler(chan, host, port):
    sock = socket.socket()
    try:
        sock.connect((host, port))
    except Exception as e:
        verbose(f"Forwarding request to {host}:{port} failed: {e}")
        return

    verbose(
        "Connected! Tunnel open "
        f"{chan.origin_addr} -> {chan.getpeername()} -> {(host, port)}"
    )

    while True:
        r, w, x = select.select([sock, chan], [], [])
        if sock in r:
            data = sock.recv(1024)
            if len(data) == 0:
                break
            chan.send(data)
        if chan in r:
            data = chan.recv(1024)
            if len(data) == 0:
                break
            sock.send(data)
    chan.close()
    sock.close()
    verbose(f"Tunnel closed from {chan.origin_addr}")


def reverse_forward_tunnel(server_port, remote_host, remote_port, transport):
    transport.request_port_forward("", server_port)
    while True:
        chan = transport.accept(1000)
        if chan is None:
            continue
        thr = threading.Thread(target=handler, args=(chan, remote_host, remote_port))
        thr.setDaemon(True)
        thr.start()


def verbose(s, debug_mode=False):
    if debug_mode:
        print(s)


def create_tunnel(payload, local_server, local_server_port):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.WarningPolicy())

    verbose(f'Conecting to ssh host {payload["host"]}:{payload["port"]} ...')
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            client.connect(
                hostname=payload["host"],
                port=int(payload["port"]),
                username=payload["user"],
                pkey=paramiko.RSAKey.from_private_key(StringIO(payload["key"])),
            )
    except Exception as e:
        print(f'*** Failed to connect to {payload["host"]}:{payload["port"]}: {e}')
        sys.exit(1)

    verbose(
        f'Now forwarding remote port {payload["remote_port"]}'
        f"to {local_server}:{local_server_port} ..."
    )

    thread = threading.Thread(
        target=reverse_forward_tunnel,
        args=(
            int(payload["remote_port"]),
            local_server,
            local_server_port,
            client.get_transport(),
        ),
        daemon=True,
    )
    thread.start()

    return payload["share_url"]

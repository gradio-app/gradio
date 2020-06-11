"""
This file provides remote port forwarding functionality using paramiko package,
Inspired by: https://github.com/paramiko/paramiko/blob/master/demos/rforward.py
"""

import select
import socket
import sys
import threading
from io import StringIO
import warnings
import paramiko

DEBUG_MODE = False


def handler(chan, host, port):
    sock = socket.socket()
    try:
        sock.connect((host, port))
    except Exception as e:
        verbose("Forwarding request to {}:{} failed: {}".format(host, port, e))
        return

    verbose(
        "Connected!  Tunnel open {} -> {} -> {}".format(chan.origin_addr,
                                                        chan.getpeername(),
                                                        (host, port))
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
    verbose("Tunnel closed from {}".format(chan.origin_addr,))


def reverse_forward_tunnel(server_port, remote_host, remote_port, transport):
    transport.request_port_forward("", server_port)
    while True:
        chan = transport.accept(1000)
        if chan is None:
            continue
        thr = threading.Thread(target=handler, args=(chan, remote_host, remote_port))
        thr.setDaemon(True)
        thr.start()


def verbose(s):
    if DEBUG_MODE:
        print(s)


def create_tunnel(payload, local_server, local_server_port):
    client = paramiko.SSHClient()
    # client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.set_missing_host_key_policy(paramiko.WarningPolicy())

    verbose(
        "Connecting to ssh host {}:{} ...".format(payload["host"], int(payload[
                                                                     "port"]))
    )
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
        print(
            "*** Failed to connect to {}:{}: {}}".format(payload["host"],
                                                    int(payload["port"]), e)
        )
        sys.exit(1)

    verbose(
        "Now forwarding remote port {} to {}:{} ...".format(int(payload[
                                                              "remote_port"]),
                                                            local_server,
                                                            local_server_port)
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

import asyncio
from asyncio import AbstractEventLoop

from gradio.tunneling.tunneling import _create_tunnel


def create_tunnel(
        remote_host, remote_port, local_host, local_port
) -> tuple[str, AbstractEventLoop]:
    loop = asyncio.new_event_loop()
    address = loop.run_until_complete(_create_tunnel(remote_host, remote_port, local_host, local_port))
    return address, loop

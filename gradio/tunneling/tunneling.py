"""Defines methods used internally to set up the share links for the Gradio app."""
import asyncio
import hashlib
import json
import struct
from time import time

from gradio.tunneling.pyyamux import Conn, Session, Stream


class Tunnel:
    def __init__(
            self, remote_host: str, remote_port: int, local_host: str, local_port: int
    ):
        self.running_worker = 0
        self.remote_host = remote_host
        self.remote_port = remote_port
        self.local_host = local_host
        self.local_port = local_port
        self.url = ""
        self.run_id = None
        self.expiry = time() + 60 * 60 * 72
        self.session = None
        self.control_stream = None

    async def start(self) -> str:
        reader, writer = await asyncio.open_connection(
            self.remote_host, self.remote_port
        )
        conn = Conn(reader, writer)
        self.session = Session(conn)

        asyncio.create_task(self.session.init())
        self.control_stream = self.session.open()

        # Send `TypeLogin`
        timestamp, privilege_key = self._generate_privilege_key()

        self._send(
            self.control_stream,
            {
                "version": "0.44.0",
                "pool_count": 1,
                "privilege_key": privilege_key,
                "timestamp": timestamp,
            },
            111,
        )

        asyncio.create_task(self.loop())

        # Sending proxy information `TypeNewProxy`
        self._send(self.control_stream, {"proxy_type": "http"}, 112)

        while self.url == "":
            await asyncio.sleep(0)

        return self.url

    @staticmethod
    def _generate_privilege_key() -> tuple[int, str]:
        """Generate and return a (timestamp, privilege_key) hash.

        Privilege Key and Timestamp should be generate like:
        https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/util/util/util.go#L46-L46
        """
        timestamp = round(time())
        return timestamp, hashlib.md5(f"{timestamp}".encode()).hexdigest()

    async def handle_req_work_conn(self):
        stream = self.session.open()

        # Send the run id (TypeNewWorkConn)
        self._send(stream, {"run_id": self.run_id}, 119)

        # Wait for the server to ask to connect
        # We don't use the message as we don't need his content
        # Useful if the client implement multiple proxy
        # In our use case only one that we know
        await self._read(stream)

        # Cleanup the reader that contains previous data
        stream.reset_reader()

        # Connect to the running app
        reader, writer = await asyncio.open_connection(self.local_host, self.local_port)
        pipe2 = self.pipe(reader, stream)
        pipe1 = self.pipe(stream.reader, writer)
        await asyncio.gather(pipe1, pipe2, return_exceptions=True)
        self.running_worker -= 1

    @staticmethod
    async def pipe(reader, writer):
        while not reader.at_eof():
            await asyncio.sleep(0)
            read_ = await reader.read(1024)
            writer.write(read_)
            await writer.drain()
        writer.close()

    @staticmethod
    def _send(stream: Stream, msg: dict, type: int):
        """Send a message to frps.

        First byte is the message type
        https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
        8 next bytes are the message length.
        Then it's the json body.
        """
        binary_message = bytearray(0)
        binary_message.extend([type])
        json_raw = json.dumps(msg).encode("utf-8")
        binary_message.extend(struct.pack(">q", len(json_raw)))
        binary_message.extend(json_raw)
        return stream.write(binary_message)

    @staticmethod
    async def _read(stream: Stream):
        """Read message from frps

        First byte is the message type
        https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
        8 next bytes are the message length.
        Then it's the json body.
        """
        data = await stream.reader.read(1)
        if not data:
            return None, None
        binary_type = list(data)[0]

        size = await stream.reader.read(8)
        if not size:
            return None, None
        size = struct.unpack(">Q", size)[0]
        json_raw = await stream.reader.read(size)
        return json.loads(json_raw), binary_type

    async def loop(self):
        while True:
            await asyncio.sleep(0)
            data, type = await self._read(self.control_stream)
            if not type or time() > self.expiry:
                break
            if type == 50:
                self.url = data["remote_addr"]
                continue
            # TypeLoginResp
            if type == 49:
                self.run_id = data["run_id"]
                continue
            # TypeReqWorkConn
            if type == 114:
                if self.running_worker < 32:
                    self.running_worker += 1
                    asyncio.create_task(self.handle_req_work_conn())
                continue
        self.control_stream.close()


async def _create_tunnel(
        remote_host: str, remote_port: int, local_host: str, local_port: int
) -> str:
    tunnel = Tunnel(remote_host, remote_port, local_host, local_port)
    return await tunnel.start()

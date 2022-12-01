import struct
import time
import asyncio
from asyncio import StreamReader
from typing import Optional

PROTO_VERSION = 0

TYPE_DATA = 0
TYPE_WINDOW_UPDATE = 1
TYPE_PING = 2
TYPE_GO_AWAY = 3

INITIAL_STREAM_WINDOW = 256 * 1024
CONNECTION_WRITE_TIMEOUT = 10  # sec
KEEP_ALIVE_INTERVAL = 30  # sec

FLAG_SYNC = 1
FLAG_ACK = 2
FLAG_FIN = 4
FLAG_RST = 8

GO_AWAY_NORMAL = 0
GO_AWAY_PROTO_ERROR = 1
GO_AWAY_INTERNAL_ERROR = 2

HEADER_SIZE = 12

STREAM_INIT = 0
STREAM_SYN_SENT = 1
STREAM_SYN_RECEIVED = 2
STREAM_ESTABLISHED = 3
STREAM_LOCAL_CLOSE = 4
STREAM_REMOTE_CLOSE = 5
STREAM_CLOSED = 6
STREAM_RESET = 7


class Header:
    def __init__(self):
        self.h = b""

    def version(self) -> int:
        return self.h[0]

    def msg_type(self) -> int:
        return self.h[1]

    def flags(self) -> int:
        return struct.unpack("!H", self.h[2:4])[0]

    def stream_id(self) -> int:
        return struct.unpack("!I", self.h[4:8])[0]

    def length(self) -> int:
        return struct.unpack("!I", self.h[8:12])[0]

    def encode(self, msg_type: int, flags: int, stream_id: int, length: int) -> None:
        self.h = struct.pack(
            "!BBHII", PROTO_VERSION, msg_type, flags, stream_id, length
        )


class Conn:
    def __init__(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        self.reader = reader
        self.writer = writer

    def close(self):
        self.writer.close()


class Message:
    def __init__(self, header: bytes, body: Optional[bytes] = None):
        self.header = header
        self.body = body


class Session:
    def __init__(self, conn: Conn):
        self.remote_go_away = 0
        self.local_go_away = 0
        self.shutdown = False
        self.next_stream_id = 0
        self.pings = {}
        self.ping_id = 0
        self.streams: dict[int, 'Stream'] = {}
        self.conn = conn
        self.send_channel: list[Message] = []
        self.next_stream_id = 1
        self.handlers = {
            TYPE_DATA: self.handle_stream_message,
            TYPE_WINDOW_UPDATE: self.handle_stream_message,
            TYPE_PING: self.handle_ping,
            TYPE_GO_AWAY: self.handle_go_away,
        }

    async def init(self):
        await asyncio.gather(self._recv(), self._send(), self.keepalive(), return_exceptions=True)

    def open(self) -> 'Stream':
        if self.shutdown:
            raise IOError("ErrSessionShutdown")
        if self.remote_go_away == 1:
            raise IOError("ErrRemoteGoAway")
        if self.shutdown:
            raise IOError("ErrSessionShutdown")
        sid = self.next_stream_id
        if sid >= 4294967295 - 1:  # max uint32
            raise ValueError("ErrStreamsExhausted")
        self.next_stream_id += 2
        stream = Stream(self, sid, STREAM_INIT)
        self.streams[sid] = stream
        stream.send_window_update()
        return stream

    async def close(self):
        if self.shutdown:
            return
        self.shutdown = True
        for _, s in self.streams.items():
            s.close()
        self.conn.close()

    async def _send(self):
        while True:
            await asyncio.sleep(0)
            if self.shutdown:
                return
            if len(self.send_channel) > 0:
                message = self.send_channel.pop(0)

                if message.header is not None:
                    self.conn.writer.write(message.header)
                if message.body is not None:
                    self.conn.writer.write(message.body)

                await self.conn.writer.drain()

    async def _recv(self):
        header = Header()
        while True:
            await asyncio.sleep(0)

            data = await self.conn.reader.read(HEADER_SIZE)
            if len(data) < HEADER_SIZE:
                continue

            header.h = data
            if header.version() != PROTO_VERSION:
                raise IOError("[ERR] yamux: Invalid protocol version: %d" % header.version())
            message_type = header.msg_type()
            if message_type < TYPE_DATA or message_type > TYPE_GO_AWAY:
                raise IOError("[ERR] yamux: Invalid message type: %d" % message_type)

            await self.handlers[message_type](header)

    async def ping(self):
        pid = self.ping_id
        self.ping_id += 1
        self.pings[pid] = False

        header = Header()
        header.encode(TYPE_PING, FLAG_SYNC, 0, pid)
        self.write(header)
        now = int(time.time())
        try:
            await asyncio.wait_for(self.conn.writer.drain(), timeout=CONNECTION_WRITE_TIMEOUT)
        except asyncio.TimeoutError:
            del self.pings[pid]
        return time.time() - now

    async def handle_stream_message(self, header: Header):
        sid = header.stream_id()
        flags = header.flags()

        if flags & FLAG_RST == FLAG_RST or flags & FLAG_FIN == FLAG_FIN:
            self.close_stream(sid)
            return

        stream = self.streams.get(sid, None)
        if stream is None:
            if header.msg_type() == TYPE_DATA and header.length() > 0:
                await self.conn.reader.read(header.length())
            return

        try:
            if header.msg_type() == TYPE_WINDOW_UPDATE:
                stream.incr_send_window(header, flags)
                return

            await stream.read_data(header, flags, self.conn)
        except Exception as e:
            self.local_go_away = 1
            header = Header()
            header.encode(TYPE_GO_AWAY, 0, 0, GO_AWAY_PROTO_ERROR)
            self.write(header)
            raise e

    def close_stream(self, sid):
        if self.streams.get(sid, None) is not None:
            del self.streams[sid]

    async def handle_ping(self, header: Header):
        flags = header.flags()
        ping_id = header.length()
        if flags & FLAG_SYNC == FLAG_SYNC:
            self._pong(header)
        ps = self.pings.get(ping_id, None)
        if ps is not None:
            del self.pings[ping_id]

    def _pong(self, ping_header: Header):
        header = Header()
        header.encode(TYPE_PING, FLAG_ACK, 0, ping_header.length())
        self.write(header)

    async def handle_go_away(self, header: Header):
        code = header.length()
        if code == GO_AWAY_NORMAL:
            self.remote_go_away = 1
        elif code == GO_AWAY_PROTO_ERROR:
            raise IOError("[ERR] yamux: received protocol error go away")
        elif code == GO_AWAY_INTERNAL_ERROR:
            raise IOError("[ERR] yamux: received internal error go away")
        else:
            raise IOError("[ERR] yamux: received unexpected go away")

    def write(self, header: Header, body: Optional[bytes] = None):
        self.send_channel.append(Message(header.h, body))

    async def keepalive(self):
        while not self.shutdown:
            await asyncio.sleep(KEEP_ALIVE_INTERVAL)
            await self.ping()


class Stream:
    def __init__(self, session: Session, sid: int, state: int):
        self.session = session
        self.sid = sid
        self.state = state
        self.recv_window = INITIAL_STREAM_WINDOW
        self.send_window = INITIAL_STREAM_WINDOW
        self.control_header = Header()
        self.send_header = Header()
        self.reader = StreamReader()

    def get_flags(self) -> int:
        flags = 0
        if self.state == STREAM_INIT:
            flags |= FLAG_SYNC
            self.state = STREAM_SYN_SENT
        elif self.state == STREAM_SYN_RECEIVED:
            flags |= FLAG_ACK
            self.state = STREAM_ESTABLISHED
        elif self.state == STREAM_LOCAL_CLOSE:
            flags |= FLAG_FIN
        return flags

    def send_window_update(self):
        _max = INITIAL_STREAM_WINDOW
        delta = _max - self.recv_window
        flags = self.get_flags()
        if delta < (_max / 2) and flags == 0:
            return
        self.recv_window += delta
        self.control_header.encode(TYPE_WINDOW_UPDATE, flags, self.sid, delta)
        self.session.write(self.control_header)

    def close(self):
        self.state = STREAM_LOCAL_CLOSE
        # Close the reader
        self.reader.feed_eof()
        # Remove the stream from the session
        self.session.close_stream(self.sid)
        # Send update to server to remove the stream
        self.send_window_update()

    def read_flags(self, flags: int):
        close_stream = False
        if flags & FLAG_ACK == FLAG_ACK:
            if self.state == STREAM_SYN_SENT:
                self.state = STREAM_ESTABLISHED
        if flags & FLAG_FIN == FLAG_FIN:
            if self.state in (STREAM_ESTABLISHED, STREAM_SYN_SENT, STREAM_SYN_RECEIVED):
                self.state = STREAM_REMOTE_CLOSE
            elif self.state == STREAM_LOCAL_CLOSE:
                self.state = STREAM_CLOSED
                close_stream = True
            else:
                raise IOError("[ERR] yamux: unexpected FIN flag in state %d" % self.state)
        if flags & FLAG_RST == FLAG_RST:
            self.state = STREAM_RESET
            close_stream = True
        if close_stream:
            self.session.close_stream(self.sid)

    def incr_send_window(self, header: Header, flags: int):
        self.read_flags(flags)
        self.send_window += header.length()

    async def read_data(self, header: Header, flags: int, conn: Conn):
        self.read_flags(flags)
        recv_data = await conn.reader.read(header.length())
        self.recv_window -= header.length()
        self.reader.feed_data(recv_data)

    def write(self, b: bytes) -> int:
        if self.state in (STREAM_LOCAL_CLOSE, STREAM_CLOSED):
            raise IOError("ErrStreamClosed")
        elif self.state == STREAM_RESET:
            raise IOError("ErrConnectionReset")
        window = self.send_window
        flags = self.get_flags()
        _max = min(window, len(b))
        body = b[:_max]
        self.send_header.encode(TYPE_DATA, flags, self.sid, _max)
        self.session.write(self.send_header, body)
        self.send_window -= _max
        return _max

    async def drain(self):
        pass

    def reset_reader(self):
        self.reader = StreamReader()

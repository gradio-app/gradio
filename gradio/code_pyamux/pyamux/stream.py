# coding:utf-8
import asyncio
import time
from asyncio import StreamReader, StreamWriter

from . import consts, header

streamInit = 0
streamSYNSent = 1
streamSYNReceived = 2
streamEstablished = 3
streamLocalClose = 4
streamRemoteClose = 5
streamClosed = 6
streamReset = 7


class Conn:
    def __init__(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        self.reader = reader
        self.writer = writer

    def close(self):
        self.writer.close()

    async def wait_closed(self):
        await self.writer.wait_closed()


async def asyncNotify(ch):
    while True:
        await asyncio.sleep(0)
        if len(ch) == 0:
            ch.append(None)
            break


class Stream:
    def __init__(self, session, sid: int, state: int):
        self.session = session
        self.sid = sid
        self.state = state
        self.buf = b""
        self.recvWindow = consts.initialStreamWindow
        self.sendWindow = consts.initialStreamWindow
        self.writeDeadline = 0
        self.readDeadline = 0
        self.controlHdr = header.Header()
        self.sendHdr = header.Header()
        # sendNotifyCh len 1
        self.sendNotifyCh = []
        self.recvNotifyCh = []
        self.reader = StreamReader()

    def streamID(self) -> int:
        return self.sid

    async def read(self, n: int) -> (bytes, Exception):
        return await self.read_start(n)

    async def read_start(self, n: int) -> (bytes, Exception):
        if self.state in (streamLocalClose, streamRemoteClose, streamClosed):
            if not len(self.buf):
                return b"", IOError()
        elif self.state == streamReset:
            return b"", IOError("ErrConnectionReset")
        if len(self.buf) < n:
            return await self.read_wait(n)
        b = self.buf[:n]
        self.buf = self.buf[n:]
        self.sendWindowUpdate()
        return b, None

    async def read_wait(self, n: int) -> (bytes, Exception):
        while True:
            await asyncio.sleep(0)
            if len(self.recvNotifyCh) > 0:
                self.recvNotifyCh.pop(0)
                return await self.read_start(n)
            if self.readDeadline > 0:
                delay = self.readDeadline - time.time()
                if delay > 0:
                    await asyncio.sleep(delay)
                else:
                    return 0, IOError("ErrReadTimeout")

    def sendFlags(self) -> int:
        flags = 0
        if self.state == streamInit:
            flags |= consts.flagSYN
            self.state = streamSYNSent
        elif self.state == streamSYNReceived:
            flags |= consts.flagACK
            self.state = streamEstablished
        return flags

    def sendWindowUpdate(self):
        _max = self.session.config.maxStreamWindowSize
        bufLen = len(self.buf)
        delta = (_max - bufLen) - self.recvWindow
        flags = self.sendFlags()
        if delta < (_max / 2) and flags == 0:
            return
        self.recvWindow += delta
        self.controlHdr.encode(consts.typeWindowUpdate, flags, self.sid, delta)
        self.session.sendNoWait(self.controlHdr)

    async def forceClose(self):
        self.state = streamClosed
        await self.notifyWaiting()

    async def notifyWaiting(self):
        await asyncNotify(self.recvNotifyCh)
        await asyncNotify(self.sendNotifyCh)

    async def processFlags(self, flags: int):
        closeStream = False
        if flags & consts.flagACK == consts.flagACK:
            if self.state == streamSYNSent:
                self.state = streamEstablished
            self.session.establishStream(self.sid)
        if flags & consts.flagFIN == consts.flagFIN:
            if self.state in (streamEstablished, streamSYNSent, streamSYNReceived):
                self.state = streamRemoteClose
                await self.notifyWaiting()
            elif self.state == streamLocalClose:
                self.state = streamClosed
                closeStream = True
                await self.notifyWaiting()
            else:
                raise IOError(
                    "[ERR] yamux: unexpected FIN flag in state %d" % self.state
                )
        if flags & consts.flagRST == consts.flagRST:
            self.state = streamReset
            closeStream = True
            await self.notifyWaiting()
        if closeStream:
            self.session.closeStream(self.sid)

    async def incrSendWindow(self, hdr: header.Header, flags: int):
        await self.processFlags(flags)

    async def readData(self, hdr: header.Header, flags: int, conn: Conn):
        await self.processFlags(flags)

        recv_data = await conn.reader.read(hdr.length())
        print("{%d}" % hdr.length(), "<=<", recv_data)
        self.buf += recv_data
        self.recvWindow -= hdr.length()
        await asyncNotify(self.recvNotifyCh)
        self.reader.feed_data(recv_data)

    async def write(self, b: bytes) -> (int, Exception):
        return await self._write_start(b)

    async def _write_start(self, b: bytes) -> (int, Exception):
        if self.state in (streamLocalClose, streamClosed):
            return 0, IOError("ErrStreamClosed")
        elif self.state == streamReset:
            return 0, IOError("ErrConnectionReset")
        window = self.sendWindow
        if window == 0:
            return await self._write_wait(b)
        flags = self.sendFlags()
        _max = min(window, len(b))
        body = b[:_max]
        self.sendHdr.encode(consts.typeData, flags, self.sid, _max)
        try:
            self.session.waitForSendErr(self.sendHdr, body)
        except Exception as e:
            return 0, e
        self.sendWindow -= _max
        return _max, None

    async def _write_wait(self, b: bytes) -> (int, Exception):
        while True:
            await asyncio.sleep(0)
            if len(self.sendNotifyCh) > 0:
                self.sendNotifyCh = []
                return await self._write_start(b)
            if self.writeDeadline > 0:
                delay = self.writeDeadline - time.time()
                if delay > 0:
                    await asyncio.sleep(delay)
                else:
                    return 0, IOError("ErrWriteTimeout")

    def reset_reader(self):
        self.reader = StreamReader()

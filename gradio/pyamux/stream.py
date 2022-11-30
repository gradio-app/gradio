# coding:utf-8
import time
import asyncio
from asyncio import StreamReader, StreamWriter

from . import consts
from . import header


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

class Stream:
    def __init__(self, session, sid: int, state: int):
        self.session = session
        self.sid = sid
        self.state = state
        self.recvWindow = consts.initialStreamWindow
        self.sendWindow = consts.initialStreamWindow
        self.writeDeadline = 0
        self.readDeadline = 0
        self.controlHdr = header.Header()
        self.sendHdr = header.Header()
        self.reader = StreamReader()

    def streamID(self) -> int:
        return self.sid

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
        delta = _max - self.recvWindow
        flags = self.sendFlags()
        if delta < (_max / 2) and flags == 0:
            return
        self.recvWindow += delta
        self.controlHdr.encode(consts.typeWindowUpdate, flags, self.sid, delta)
        self.session.sendNoWait(self.controlHdr)

    def close(self):
        self.state = streamLocalClose

    async def processFlags(self, flags: int):
        closeStream = False
        if flags & consts.flagACK == consts.flagACK:
            if self.state == streamSYNSent:
                self.state = streamEstablished
        if flags & consts.flagFIN == consts.flagFIN:
            if self.state in (streamEstablished, streamSYNSent, streamSYNReceived):
                self.state = streamRemoteClose
            elif self.state == streamLocalClose:
                self.state = streamClosed
                closeStream = True
            else:
                raise IOError(
                    "[ERR] yamux: unexpected FIN flag in state %d" % self.state
                )
        if flags & consts.flagRST == consts.flagRST:
            self.state = streamReset
            closeStream = True
        if closeStream:
            self.session.closeStream(self.sid)

    async def incrSendWindow(self, hdr: header.Header, flags: int):
        await self.processFlags(flags)

    async def readData(self, hdr: header.Header, flags: int, conn: Conn):
        await self.processFlags(flags)
        recv_data = await conn.reader.read(hdr.length())
        self.recvWindow -= hdr.length()
        self.reader.feed_data(recv_data)

    def write(self, b: bytes) -> (int, Exception):
        if self.state in (streamLocalClose, streamClosed):
            raise IOError("ErrStreamClosed")
        elif self.state == streamReset:
            raise IOError("ErrConnectionReset")
        window = self.sendWindow
        flags = self.sendFlags()
        _max = min(window, len(b))
        body = b[:_max]
        self.sendHdr.encode(consts.typeData, flags, self.sid, _max)
        self.session.waitForSendErr(self.sendHdr, body)
        self.sendWindow -= _max
        return _max

    async def drain(self):
        pass

    def reset_reader(self):
        self.reader = StreamReader()

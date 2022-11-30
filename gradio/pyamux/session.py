# coding:utf-8

import time
import asyncio

from . import stream
from . import consts
from . import header


class Session:
    def __init__(self, config, conn: stream.Conn, client: bool):
        self.remoteGoAway = 0
        self.config = config
        self.localGoAway = 0
        self.nextStreamID = 0
        self.pings = {}
        self.pingID = 0
        self.streams = {}  # int-> stream
        self.inflight = {}  # int->object
        self.shutdown = False
        self.acceptCh = []
        self.conn = conn
        self.sendCh = []
        if client:
            self.nextStreamID = 1
        else:
            self.nextStreamID = 2
        self.handlers = {
            consts.typeData: self.handleStreamMessage,
            consts.typeWindowUpdate: self.handleStreamMessage,
            consts.typePing: self.handlePing,
            consts.typeGoAway: self.handleGoAway,
        }
        # asyncio.ensure_future(self.recv())
        # asyncio.ensure_future(self.send())

    async def init(self):
        tasks = [self.recv(), self.send()]
        if self.config.enableKeepAlive:
            tasks.append(self.keepalive())
        await asyncio.gather(*tasks, return_exceptions=True)

    def isClosed(self) -> bool:
        return self.shutdown

    def numStreams(self) -> int:
        return len(self.streams)

    def Open(self) -> (stream.Stream, Exception):
        s, err = self.openStream()
        if err is not None:
            return None, err
        return s, None

    def openStream(self) -> (stream.Stream, Exception):
        if self.isClosed():
            return None, IOError("ErrSessionShutdown")
        if self.remoteGoAway == 1:
            return None, IOError("ErrRemoteGoAway")
        if self.shutdown:
            return None, IOError("ErrSessionShutdown")
        return self._openStreamGetID()

    def _openStreamGetID(self) -> (stream.Stream, Exception):
        sid = self.nextStreamID
        if sid >= 4294967295 - 1:  # max uint32
            return None, ValueError("ErrStreamsExhausted")
        self.nextStreamID += 2
        _stream = stream.Stream(self, sid, stream.streamInit)
        self.streams[sid] = _stream
        self.inflight[sid] = {}
        try:
            _stream.sendWindowUpdate()
        except Exception as e:
            return None, e
        return _stream, None

    async def accept(self) -> (stream.Stream, Exception):
        return await self.acceptStream()

    async def acceptStream(self) -> (stream.Stream, Exception):
        while True:
            await asyncio.sleep(0)
            if len(self.acceptCh) > 0:
                _stream = self.acceptCh.pop(0)
                _stream.sendWindowUpdate()
                return _stream, None
            elif self.shutdown:
                return None, IOError("shutdownErr")

    async def close(self):
        if self.shutdown:
            return
        self.shutdown = True
        self.conn.close()
        for _, s in self.streams.items():
            await s.forceClose()

    def goAway(self, reason: int):
        self.localGoAway = 1
        hdr = header.Header()
        hdr.encode(consts.typeGoAway, 0, 0, reason)
        return hdr

    # def waitForSend(self,

    async def send(self):
        while True:
            await asyncio.sleep(0)
            if len(self.sendCh) > 0:
                ready = self.sendCh.pop(0)
                if ready.get("Hdr", None) is not None:
                    self.conn.writer.write(ready["Hdr"].h)
                if ready.get("Body", None) is not None:
                    self.conn.writer.write(ready["Body"])
                await self.conn.writer.drain()
            elif self.shutdown:
                return

    async def recv(self):
        try:
            await self.recvLoop()
        except Exception as e:
            raise e

    async def readBuf(self, size: int) -> bytes:
        buf = await self.conn.reader.read(size)
        return buf

    async def recvLoop(self):
        hdr = header.Header()
        while True:
            await asyncio.sleep(0)
            try:
                ret = await self.readBuf(consts.headerSize)
            except Exception as e:
                exit(e)

            if len(ret) < consts.headerSize:
                continue
            # raise IOError("[ERR] yamux: Failed to read header")
            hdr.h = ret  # self.readBuf(consts.headerSize)
            if hdr.version() != consts.protoVersion:
                raise IOError(
                    "[ERR] yamux: Invalid protocol version: %d" % hdr.version()
                )
            mt = hdr.msgType()
            if mt < consts.typeData or mt > consts.typeGoAway:
                raise IOError("[ERR] yamux: Invalid message type: %d" % mt)
            try:
                await self.handlers[mt](hdr)
            except Exception as e:
                raise e

    async def ping(self):
        pid = self.pingID
        self.pingID += 1
        self.pings[pid] = False

        hdr = header.Header()
        hdr.encode(consts.typePing, consts.flagSYN, 0, pid)
        self.sendNoWait(hdr)
        now = int(time.time())
        try:
            await asyncio.wait_for(
                self.conn.writer.drain(), timeout=self.config.connectionWriteTimeout
            )
        except asyncio.TimeoutError:
            del self.pings[pid]
        return time.time() - now

    async def handleStreamMessage(self, hdr: header.Header):
        sid = hdr.streamID()
        flags = hdr.flags()
        if flags & consts.flagSYN == consts.flagSYN:
            self.incomingStream(sid)
        _stream = self.streams.get(sid, None)
        if _stream is None:
            if hdr.msgType() == consts.typeData and hdr.length() > 0:
                # if len(self.buf) < hdr.length():
                #     raise IOError("[ERR] yamux: Failed to discard data")
                # discard data
                await self.readBuf(hdr.length())
                # self.buf = self.buf[hdr.length() :]
            return
        if hdr.msgType() == consts.typeWindowUpdate:
            try:
                await _stream.incrSendWindow(hdr, flags)
            except:
                self.sendNoWait(self.goAway(consts.goAwayProtoErr))
            return
        try:
            await _stream.readData(hdr, flags, self.conn)
        except Exception as e:
            self.sendNoWait(self.goAway(consts.goAwayProtoErr))

    def incomingStream(self, sid):
        if self.localGoAway == 1:
            hdr = header.Header()
            hdr.encode(consts.typeWindowUpdate, consts.flagRST, sid, 0)
            return self.sendNoWait(hdr)
        _stream = stream.Stream(self, sid, stream.streamSYNReceived)
        if self.streams.get(sid, None) is not None:
            self.sendNoWait(self.goAway(consts.goAwayProtoErr))

        if len(self.acceptCh) < self.config.acceptBacklog:
            self.streams[sid] = _stream
            self.acceptCh.append(_stream)
        else:
            _stream.sendHdr.encode(consts.typeWindowUpdate, consts.flagRST, sid, 0)
            self.sendNoWait(_stream.sendHdr)

    def establishStream(self, sid):
        if self.inflight.get(sid, None) is not None:
            del self.inflight[sid]

    def closeStream(self, sid):
        if self.streams.get(sid, None) is not None:
            del self.streams[sid]

    async def handlePing(self, hdr: header.Header):
        flags = hdr.flags()
        pingID = hdr.length()
        if flags & consts.flagSYN == consts.flagSYN:
            # loop = asyncio.get_running_loop()
            # loop.call_soon_threadsafe(self._pong, hdr)
            self._pong(hdr)
        ps = self.pings.get(pingID, None)
        if ps is not None:
            del self.pings[pingID]

    def _pong(self, pingHdr: header.Header):
        hdr = header.Header()
        hdr.encode(consts.typePing, consts.flagACK, 0, pingHdr.length())
        self.sendNoWait(hdr)

    async def handleGoAway(self, hdr: header.Header):
        code = hdr.length()
        if code == consts.goAwayNormal:
            self.remoteGoAway = 1
        elif code == consts.goAwayProtoErr:
            raise IOError("[ERR] yamux: received protocol error go away")
        elif code == consts.goAwayInternalErr:
            raise IOError("[ERR] yamux: received internal error go away")
        else:
            raise IOError("[ERR] yamux: received unexpected go away")

    def sendNoWait(self, hdr: header.Header):
        hdrCopy = header.Header()
        hdrCopy.h = hdr.h
        self.sendCh.append({"Hdr": hdrCopy})

    def waitForSendErr(self, hdr: header.Header, body: bytes):
        hdrCopy = header.Header()
        hdrCopy.h = hdr.h
        ready = {"Hdr": hdrCopy, "Body": body, "Err": None}
        self.sendCh.append(ready)

    async def keepalive(self):
        while not self.shutdown:
            await asyncio.sleep(self.config.keepAliveInterval)
            await self.ping()

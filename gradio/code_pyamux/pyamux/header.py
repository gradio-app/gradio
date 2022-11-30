# coding:utf-8
import struct
from . import consts


class Header:
    def __init__(self):
        self.h = b""

    def version(self) -> int:
        # return struct.unpack("!B", self.h[0])[0]
        return self.h[0]

    def msgType(self) -> int:
        # return struct.unpack("!B", self.h[1])[0]
        return self.h[1]

    def flags(self) -> int:
        return struct.unpack("!H", self.h[2:4])[0]

    def streamID(self) -> int:
        return struct.unpack("!I", self.h[4:8])[0]

    def length(self) -> int:
        return struct.unpack("!I", self.h[8:12])[0]

    def encode(self, msgType: int, flags: int, streamID: int, length: int) -> None:
        self.h = struct.pack(
            "!BBHII", consts.protoVersion, msgType, flags, streamID, length
        )

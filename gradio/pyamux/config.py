# coding:utf-8
from . import consts


class Config:
    def __init__(self):
        self.acceptBacklog = 256
        self.enableKeepAlive = False
        self.keepAliveInterval = 30  # sec
        self.connectionWriteTimeout = 10  # sec
        self.maxStreamWindowSize = consts.initialStreamWindow


def VerifyConfig(config: Config):
    if config.acceptBacklog <= 0:
        raise AttributeError("backlog must be positive")
    if config.keepAliveInterval == 0:
        raise AttributeError("keep-alive interval must be positive")
    if config.maxStreamWindowSize < consts.initialStreamWindow:
        raise AttributeError(
            "MaxStreamWindowSize must be larger than %d", consts.initialStreamWindow
        )
    return None

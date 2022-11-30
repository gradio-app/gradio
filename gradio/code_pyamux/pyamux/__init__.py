# coding:utf-8
from . import config
from . import session
from . import stream


def Server(conn, cfg: config.Config):
    if cfg == None:
        cfg = config.Config()

    config.VerifyConfig(cfg)
    s = session.Session(cfg, conn, False)
    return s


# Client is used to initialize a new client-side connection.
# There must be at most one client-side connection.
def Client(conn, cfg: config.Config):
    if cfg == None:
        cfg = config.Config()
    config.VerifyConfig(cfg)
    s = session.Session(cfg, conn, True)
    return s

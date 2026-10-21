"""Lazy initialization keeps resources in the process which uses them."""

import functools
import threading


def resource(fn):
    sentinel = object()
    value = sentinel
    lock = threading.Lock()

    @functools.wraps(fn)
    def get():
        nonlocal value
        with lock:
            if value is sentinel:
                value = fn()
            return value

    return get

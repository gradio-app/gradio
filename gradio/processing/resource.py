import functools
import threading


def resource(fn):
    lock = threading.Lock()
    missing = object()
    value = missing

    @functools.wraps(fn)
    def get():
        nonlocal value
        with lock:
            if value is missing:
                value = fn()
                get.initializations += 1
            return value

    get.initializations = 0
    return get

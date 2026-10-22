import functools
import threading
from collections.abc import Callable
from typing import Generic, TypeVar, cast

T = TypeVar("T")


class Resource(Generic[T]):
    """A callable resource factory with a cache local to its worker process."""

    def __init__(self, fn: Callable[[], T]):
        functools.update_wrapper(self, fn)
        self._fn = fn
        self._lock = threading.Lock()
        self._missing = object()
        self._value: T | object = self._missing
        self.initializations = 0

    def __call__(self) -> T:
        with self._lock:
            if self._value is self._missing:
                self._value = self._fn()
                self.initializations += 1
            return cast(T, self._value)


def resource(fn: Callable[[], T]) -> Resource[T]:
    return Resource(fn)

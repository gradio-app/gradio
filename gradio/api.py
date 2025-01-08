from dataclasses import dataclass
from functools import wraps

from gradio.context import Context


@dataclass
class Route:
    path: str
    mode: str
    func: callable
    route_args: tuple
    route_kwargs: dict


def route(path: str, mode, *route_args, **route_kwargs):
    root_block = Context.root_block
    if root_block is None:
        raise ValueError("Cannot create get() route outside Block context.")

    def decorator(func):
        root_block.extra_api_routes.append(
            Route(path, mode, func, route_args, route_kwargs)
        )

        @wraps(func)
        def wrapper(*fn_args, **fn_kwargs):
            return func(*fn_args, **fn_kwargs)

        return wrapper

    return decorator


def get(path: str, *args, **kwargs):
    if not path.startswith("/"):
        path = "/" + path
    return route(path, "GET", *args, **kwargs)


def post(path: str, *args, **kwargs):
    if not path.startswith("/"):
        path = "/" + path
    return route(path, "POST", *args, **kwargs)


__all__ = ["get", "post"]

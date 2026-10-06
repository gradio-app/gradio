"""Serializes `gr.State` values so that they can be held by the browser.

The format is JSON with tagged objects for the types JSON cannot express
(tuples, sets, dicts with non-string keys, bytes, dates, NumPy arrays, pandas
objects, PIL images, dataclasses, pydantic models, enums and plain classes).
It is deliberately not pickle: decoding never calls an arbitrary callable, and
it only rebuilds classes defined in the app's own code, dataclasses, pydantic
models, named tuples and enums.

Values are only ever decoded from tokens that the server sealed itself (see
`gradio.client_state`), so this module does not need to defend against
malicious input on its own, but it keeps the decoder narrow anyway so that a
leaked secret key does not become remote code execution.
"""

from __future__ import annotations

import base64
import dataclasses
import datetime
import decimal
import enum
import functools
import importlib
import io
import math
import pathlib
import sys
import sysconfig
import uuid
from collections import Counter, OrderedDict
from typing import Any, cast

import orjson

TAG = "__gr__"


class StateSerializationError(TypeError):
    """Raised when a value cannot be serialized for browser storage."""


def dumps(value: Any) -> bytes:
    """Serializes a value to bytes. Raises StateSerializationError if it can't be."""
    try:
        return orjson.dumps(_encode(value, set()))
    except StateSerializationError:
        raise
    except RecursionError as err:
        raise StateSerializationError("the value is nested too deeply") from err
    except Exception as err:
        raise StateSerializationError(f"{type(err).__name__}: {err}") from err


def loads(data: bytes) -> Any:
    """Rebuilds a value serialized with `dumps`."""
    return _decode(orjson.loads(data))


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def _unb64(data: str) -> bytes:
    return base64.b64decode(data)


def _qualname(cls: type) -> str:
    return f"{cls.__module__}:{cls.__qualname__}"


def _import_class(path: str) -> type:
    module_name, _, qualname = path.partition(":")
    obj: Any = importlib.import_module(module_name)
    for part in qualname.split("."):
        obj = getattr(obj, part)
    if not isinstance(obj, type):
        raise StateSerializationError(f"{path} is not a class")
    return obj


@functools.lru_cache(maxsize=1)
def _library_paths() -> tuple[str, ...]:
    paths = sysconfig.get_paths()
    roots = {paths[key] for key in ("stdlib", "platstdlib", "purelib", "platlib")}
    roots.update(p for p in sys.path if "site-packages" in p or "dist-packages" in p)
    return tuple(str(pathlib.Path(r).resolve()) for r in roots if r)


def _is_app_class(cls: type) -> bool:
    """Whether a class is defined in the app's own code, rather than in the
    standard library or an installed package. Only these are rebuilt from
    their `__dict__`, since that skips `__init__` the way `copy.deepcopy` does."""
    module = sys.modules.get(cls.__module__)
    if module is None or cls.__module__ in sys.builtin_module_names:
        return False
    if cls.__module__.partition(".")[0] in ("gradio", "gradio_client"):
        return False
    if "<locals>" in cls.__qualname__:
        return False
    file = getattr(module, "__file__", None)
    if file is None:
        # e.g. a class defined in a notebook cell or `python -c`
        return cls.__module__ == "__main__"
    resolved = str(pathlib.Path(file).resolve())
    return not any(resolved.startswith(root) for root in _library_paths())


def _check_importable(cls: type) -> str:
    path = _qualname(cls)
    if "<locals>" in cls.__qualname__:
        raise StateSerializationError(
            f"{cls.__qualname__} is defined inside a function, so it cannot be "
            "rebuilt from browser storage"
        )
    try:
        if _import_class(path) is not cls:
            raise StateSerializationError(f"{path} does not name the same class")
    except (ImportError, AttributeError) as err:
        raise StateSerializationError(f"{path} cannot be imported") from err
    return path


def _encode(obj: Any, seen: set[int]) -> Any:
    t = type(obj)
    if obj is None or t is bool or t is str:
        return obj
    if t is int:
        if -(2**63) <= obj < 2**64:
            return obj
        return {TAG: "int", "v": str(obj)}
    if t is float:
        if math.isfinite(obj):
            return obj
        return {TAG: "float", "v": repr(obj)}

    # Containers: guard against reference cycles, which JSON cannot express.
    if t in (list, tuple, set, frozenset, dict):
        if id(obj) in seen:
            raise StateSerializationError("the value contains a reference cycle")
        seen.add(id(obj))
        try:
            if t is list:
                return [_encode(v, seen) for v in obj]
            if t is tuple:
                return {TAG: "tuple", "v": [_encode(v, seen) for v in obj]}
            if t is set or t is frozenset:
                return {
                    TAG: "set" if t is set else "frozenset",
                    "v": [_encode(v, seen) for v in obj],
                }
            return _encode_dict(obj, seen)
        finally:
            seen.discard(id(obj))

    if isinstance(obj, enum.Enum):
        return {
            TAG: "enum",
            "cls": _check_importable(t),
            "v": _encode(obj.value, seen),
        }
    if t is bytes or t is bytearray:
        return {TAG: t.__name__, "v": _b64(obj)}
    if t is complex:
        return {TAG: "complex", "v": [repr(obj.real), repr(obj.imag)]}
    if t is decimal.Decimal:
        return {TAG: "decimal", "v": str(obj)}
    if t is uuid.UUID:
        return {TAG: "uuid", "v": str(obj)}
    if isinstance(obj, pathlib.PurePath):
        return {TAG: "path", "cls": t.__name__, "v": str(obj)}
    if t is datetime.datetime:
        return {TAG: "datetime", "v": obj.isoformat()}
    if t is datetime.date:
        return {TAG: "date", "v": obj.isoformat()}
    if t is datetime.time:
        return {TAG: "time", "v": obj.isoformat()}
    if t is datetime.timedelta:
        return {
            TAG: "timedelta",
            "v": [obj.days, obj.seconds, obj.microseconds],
        }
    if t is OrderedDict or t is Counter:
        if id(obj) in seen:
            raise StateSerializationError("the value contains a reference cycle")
        seen.add(id(obj))
        try:
            return {
                TAG: t.__name__,
                "v": [[_encode(k, seen), _encode(v, seen)] for k, v in obj.items()],
            }
        finally:
            seen.discard(id(obj))

    module = t.__module__.partition(".")[0]
    if module == "numpy":
        return _encode_numpy(obj)
    if module == "pandas":
        return _encode_pandas(obj, seen)
    if module == "PIL":
        return _encode_pil(obj)

    if id(obj) in seen:
        raise StateSerializationError("the value contains a reference cycle")
    seen.add(id(obj))
    try:
        return _encode_object(obj, seen)
    finally:
        seen.discard(id(obj))


def _encode_dict(obj: dict, seen: set[int]) -> Any:
    if all(type(k) is str for k in obj) and TAG not in obj:
        return {k: _encode(v, seen) for k, v in obj.items()}
    return {
        TAG: "dict",
        "v": [[_encode(k, seen), _encode(v, seen)] for k, v in obj.items()],
    }


def _encode_object(obj: Any, seen: set[int]) -> Any:
    t = type(obj)
    component = _gradio_component_class()
    if component is not None and isinstance(obj, component):
        # e.g. a gr.File in a chat message: rebuilt from the arguments it
        # was created with, the way an update to a component is
        return {
            TAG: "component",
            "cls": _check_importable(t),
            "v": _encode_dict(
                {k: v for k, v in obj.constructor_args.items() if k != "render"},
                seen,
            ),
        }
    if isinstance(obj, tuple) and hasattr(t, "_fields"):
        return {
            TAG: "namedtuple",
            "cls": _check_importable(t),
            "v": [_encode(v, seen) for v in obj],
        }

    pydantic = sys.modules.get("pydantic")
    if pydantic is not None and isinstance(obj, pydantic.BaseModel):
        return {
            TAG: "pydantic",
            "cls": _check_importable(t),
            "v": _encode(obj.model_dump(mode="python"), seen),
        }

    if dataclasses.is_dataclass(obj) or _is_app_class(t):
        state = _object_state(obj)
        return {
            TAG: "object",
            "cls": _check_importable(t),
            "v": _encode_dict(state, seen),
        }

    raise StateSerializationError(
        f"values of type {t.__module__}.{t.__qualname__} cannot be stored in the browser"
    )


def _object_state(obj: Any) -> dict[str, Any]:
    t = type(obj)
    getstate = getattr(t, "__getstate__", None)
    if (
        t.__reduce_ex__ is not object.__reduce_ex__
        or t.__reduce__ is not object.__reduce__
        or (
            getstate is not None
            and getstate is not getattr(object, "__getstate__", None)
        )
    ):
        raise StateSerializationError(
            f"{t.__qualname__} customizes how it is copied or pickled"
        )
    state: dict[str, Any] = {}
    if hasattr(obj, "__dict__"):
        state.update(vars(obj))
    for klass in t.__mro__:
        for slot in getattr(klass, "__slots__", ()):
            if slot in ("__dict__", "__weakref__"):
                continue
            if hasattr(obj, slot):
                state[slot] = getattr(obj, slot)
    if not hasattr(obj, "__dict__") and not state:
        raise StateSerializationError(f"{t.__qualname__} has no attributes to store")
    return state


def _encode_numpy(obj: Any) -> Any:
    import numpy as np

    if isinstance(obj, np.ndarray):
        if obj.dtype.hasobject:
            raise StateSerializationError(
                "NumPy arrays with dtype=object cannot be stored in the browser"
            )
        return {
            TAG: "ndarray",
            "dtype": np.lib.format.dtype_to_descr(obj.dtype),
            "shape": list(obj.shape),
            "v": _b64(np.ascontiguousarray(obj).tobytes()),
        }
    if isinstance(obj, np.generic):
        if obj.dtype.hasobject:
            raise StateSerializationError("NumPy object scalars cannot be stored")
        return {
            TAG: "npscalar",
            "dtype": np.lib.format.dtype_to_descr(obj.dtype),
            "v": _b64(obj.tobytes()),
        }
    raise StateSerializationError(f"{type(obj).__qualname__} cannot be stored")


def _encode_column(values: Any, seen: set[int]) -> Any:
    """Encodes a pandas Series or Index's values, without its dtype."""
    import numpy as np
    import pandas as pd

    array = values.to_numpy() if hasattr(values, "to_numpy") else np.asarray(values)
    if not array.dtype.hasobject:
        return _encode_numpy(array)
    return [
        None if item is None or item is pd.NA else _encode(item, seen)
        for item in array.tolist()
    ]


def _decode_column(data: Any, dtype: str) -> Any:
    import pandas as pd

    series = pd.Series(_decode(data))
    if str(series.dtype) != dtype:
        series = series.astype(dtype)
    return series


def _encode_index(index: Any, seen: set[int]) -> Any:
    import pandas as pd

    if isinstance(index, pd.RangeIndex):
        return {
            "range": [index.start, index.stop, index.step],
            "name": _encode(index.name, seen),
        }
    if isinstance(index, pd.MultiIndex):
        return {
            "multi": [_encode(tuple(t), seen) for t in index.tolist()],
            "names": [_encode(n, seen) for n in index.names],
        }
    return {
        "values": _encode_column(index, seen),
        "dtype": str(index.dtype),
        "name": _encode(index.name, seen),
    }


def _decode_index(data: dict) -> Any:
    import pandas as pd

    if "range" in data:
        start, stop, step = data["range"]
        return pd.RangeIndex(start, stop, step, name=_decode(data["name"]))
    if "multi" in data:
        return pd.MultiIndex.from_tuples(
            [_decode(t) for t in data["multi"]],
            names=[_decode(n) for n in data["names"]],
        )
    return pd.Index(
        _decode_column(data["values"], data["dtype"]), name=_decode(data["name"])
    )


def _encode_pandas(obj: Any, seen: set[int]) -> Any:
    import pandas as pd

    if isinstance(obj, pd.DataFrame):
        return {
            TAG: "dataframe",
            "columns": _encode_index(obj.columns, seen),
            "index": _encode_index(obj.index, seen),
            "data": [
                {
                    "values": _encode_column(obj.iloc[:, i], seen),
                    "dtype": str(obj.dtypes.iloc[i]),
                }
                for i in range(obj.shape[1])
            ],
        }
    if isinstance(obj, pd.Series):
        return {
            TAG: "series",
            "values": _encode_column(obj, seen),
            "dtype": str(obj.dtype),
            "index": _encode_index(obj.index, seen),
            "name": _encode(obj.name, seen),
        }
    if obj is pd.NaT:
        return {TAG: "nat"}
    if isinstance(obj, pd.Timestamp):
        return {TAG: "timestamp", "v": obj.isoformat()}
    if isinstance(obj, pd.Timedelta):
        return {TAG: "pdtimedelta", "v": obj.value}
    raise StateSerializationError(
        f"pandas {type(obj).__qualname__} values cannot be stored in the browser"
    )


def _encode_pil(obj: Any) -> Any:
    from PIL import Image

    if not isinstance(obj, Image.Image):
        raise StateSerializationError(f"{type(obj).__qualname__} cannot be stored")
    buffer = io.BytesIO()
    try:
        obj.save(buffer, format="PNG")
    except OSError as err:
        raise StateSerializationError(
            f"PIL images in mode {obj.mode} cannot be stored in the browser"
        ) from err
    return {TAG: "image", "v": _b64(buffer.getvalue()), "mode": obj.mode}


def _decode(obj: Any) -> Any:
    if isinstance(obj, list):
        return [_decode(v) for v in obj]
    if not isinstance(obj, dict):
        return obj
    tag = obj.get(TAG)
    if tag is None:
        return {k: _decode(v) for k, v in obj.items()}
    decoder = _DECODERS.get(tag)
    if decoder is None:
        raise StateSerializationError(f"unknown tag {tag!r}")
    return decoder(obj)


def _decode_pairs(pairs: list) -> list[tuple[Any, Any]]:
    return [(_decode(k), _decode(v)) for k, v in pairs]


def _decode_ndarray(obj: dict) -> Any:
    import numpy as np

    dtype = np.lib.format.descr_to_dtype(_descr(obj["dtype"]))
    return np.frombuffer(_unb64(obj["v"]), dtype=dtype).reshape(obj["shape"]).copy()


def _decode_npscalar(obj: dict) -> Any:
    import numpy as np

    dtype = np.lib.format.descr_to_dtype(_descr(obj["dtype"]))
    return np.frombuffer(_unb64(obj["v"]), dtype=dtype)[0]


def _descr(descr: Any) -> Any:
    # Structured dtypes come back from JSON as lists of lists
    if isinstance(descr, list):
        return [
            tuple(_descr(d) if isinstance(d, list) else d for d in f) for f in descr
        ]
    return descr


def _decode_dataframe(obj: dict) -> Any:
    import pandas as pd

    columns = _decode_index(obj["columns"])
    index = _decode_index(obj["index"])
    data = {
        i: _decode_column(col["values"], col["dtype"]).set_axis(index)
        for i, col in enumerate(obj["data"])
    }
    frame = pd.DataFrame(data, index=index)
    frame.columns = columns
    return frame


def _decode_series(obj: dict) -> Any:
    series = _decode_column(obj["values"], obj["dtype"])
    series.index = _decode_index(obj["index"])
    series.name = _decode(obj["name"])
    return series


def _decode_image(obj: dict) -> Any:
    from PIL import Image

    image = Image.open(io.BytesIO(_unb64(obj["v"])))
    image.load()
    if image.mode != obj["mode"]:
        image = image.convert(obj["mode"])
    return image


def _decode_enum(obj: dict) -> Any:
    cls = _import_class(obj["cls"])
    if not issubclass(cls, enum.Enum):
        raise StateSerializationError(f"{obj['cls']} is not an Enum")
    return cls(_decode(obj["v"]))


def _decode_namedtuple(obj: dict) -> Any:
    cls = _import_class(obj["cls"])
    if not (issubclass(cls, tuple) and hasattr(cls, "_fields")):
        raise StateSerializationError(f"{obj['cls']} is not a named tuple")
    return cls(*_decode(obj["v"]))


def _decode_pydantic(obj: dict) -> Any:
    import pydantic

    cls = _import_class(obj["cls"])
    if not issubclass(cls, pydantic.BaseModel):
        raise StateSerializationError(f"{obj['cls']} is not a pydantic model")
    return cls.model_validate(_decode(obj["v"]))


def _gradio_component_class() -> type | None:
    module = sys.modules.get("gradio.components.base")
    return getattr(module, "Component", None) if module else None


def _decode_component(obj: dict) -> Any:
    cls = _import_class(obj["cls"])
    component = _gradio_component_class()
    if component is None or not issubclass(cls, component):
        raise StateSerializationError(f"{obj['cls']} is not a Gradio component")
    return cls(**_decode(obj["v"]), render=False)


def _decode_object(obj: dict) -> Any:
    cls = _import_class(obj["cls"])
    if not (dataclasses.is_dataclass(cls) or _is_app_class(cls)):
        raise StateSerializationError(
            f"{obj['cls']} is not a class that can be rebuilt from browser storage"
        )
    instance = cast(Any, cls).__new__(cls)
    for key, value in _decode(obj["v"]).items():
        object.__setattr__(instance, key, value)
    return instance


def _decode_path(obj: dict) -> Any:
    cls = {
        c.__name__: c
        for c in (
            pathlib.Path,
            pathlib.PosixPath,
            pathlib.WindowsPath,
            pathlib.PurePath,
            pathlib.PurePosixPath,
            pathlib.PureWindowsPath,
        )
    }.get(obj["cls"], pathlib.Path)
    if cls in (pathlib.PosixPath, pathlib.WindowsPath):
        cls = pathlib.Path
    return cls(obj["v"])


def _decode_timestamp(obj: dict) -> Any:
    import pandas as pd

    return pd.Timestamp(obj["v"])


def _decode_pdtimedelta(obj: dict) -> Any:
    import pandas as pd

    return pd.Timedelta(obj["v"], unit="ns")


def _decode_nat(_obj: dict) -> Any:
    import pandas as pd

    return pd.NaT


_DECODERS: dict[str, Any] = {
    "int": lambda o: int(o["v"]),
    "float": lambda o: float(o["v"]),
    "tuple": lambda o: tuple(_decode(v) for v in o["v"]),
    "set": lambda o: {_decode(v) for v in o["v"]},
    "frozenset": lambda o: frozenset(_decode(v) for v in o["v"]),
    "dict": lambda o: dict(_decode_pairs(o["v"])),
    "OrderedDict": lambda o: OrderedDict(_decode_pairs(o["v"])),
    "Counter": lambda o: Counter(dict(_decode_pairs(o["v"]))),
    "bytes": lambda o: _unb64(o["v"]),
    "bytearray": lambda o: bytearray(_unb64(o["v"])),
    "complex": lambda o: complex(float(o["v"][0]), float(o["v"][1])),
    "decimal": lambda o: decimal.Decimal(o["v"]),
    "uuid": lambda o: uuid.UUID(o["v"]),
    "path": _decode_path,
    "datetime": lambda o: datetime.datetime.fromisoformat(o["v"]),
    "date": lambda o: datetime.date.fromisoformat(o["v"]),
    "time": lambda o: datetime.time.fromisoformat(o["v"]),
    "timedelta": lambda o: datetime.timedelta(*o["v"]),
    "enum": _decode_enum,
    "namedtuple": _decode_namedtuple,
    "pydantic": _decode_pydantic,
    "object": _decode_object,
    "component": _decode_component,
    "ndarray": _decode_ndarray,
    "npscalar": _decode_npscalar,
    "dataframe": _decode_dataframe,
    "series": _decode_series,
    "timestamp": _decode_timestamp,
    "nat": _decode_nat,
    "pdtimedelta": _decode_pdtimedelta,
    "image": _decode_image,
}

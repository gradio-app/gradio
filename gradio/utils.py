"""Handy utility functions."""

from __future__ import annotations

import ast
import asyncio
import copy
import functools
import hashlib
import importlib
import importlib.util
import inspect
import json
import json.decoder
import os
import pkgutil
import posixpath
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import traceback
import typing
import urllib.parse
import uuid
import warnings
from abc import ABC, abstractmethod
from collections import OrderedDict
from collections.abc import (
    Callable,
    Hashable,
    Iterable,
    Iterator,
    MutableMapping,
    Sequence,
)
from contextlib import contextmanager
from functools import wraps
from io import BytesIO
from pathlib import Path
from types import ModuleType
from typing import (
    TYPE_CHECKING,
    Any,
    Generic,
    Literal,
    Optional,
    TypeVar,
)

import anyio
import gradio_client.utils as client_utils
import httpx
import orjson
from gradio_client.documentation import document
from typing_extensions import ParamSpec

import gradio
from gradio.context import get_blocks_context
from gradio.data_classes import (
    BlocksConfigDict,
    DeveloperPath,
    FileData,
    UserProvidedPath,
)
from gradio.exceptions import Error, InvalidPathError

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.blocks import BlockContext, Blocks
    from gradio.components import Component
    from gradio.routes import App, Request
    from gradio.state_holder import SessionState

P = ParamSpec("P")
T = TypeVar("T")


def get_package_version() -> str:
    try:
        package_json_data = (
            pkgutil.get_data(__name__, "package.json").decode("utf-8").strip()  # type: ignore
        )
        package_data = json.loads(package_json_data)
        version = package_data.get("version", "")
        return version
    except Exception:
        return ""


def safe_get_lock() -> asyncio.Lock:
    """Get asyncio.Lock() without fear of getting an Exception.

    Needed because in reload mode we import the Blocks object outside
    the main thread.
    """
    try:
        asyncio.get_event_loop()
        return asyncio.Lock()
    except RuntimeError:
        return None  # type: ignore


def safe_get_stop_event() -> asyncio.Event:
    try:
        asyncio.get_event_loop()
        return asyncio.Event()
    except RuntimeError:
        return None  # type: ignore


class BaseReloader(ABC):
    @property
    @abstractmethod
    def running_app(self) -> App:
        pass

    def swap_blocks(self, demo: Blocks):
        assert self.running_app.blocks  # noqa: S101
        # Copy over the blocks to get new components and events but
        # not a new queue
        demo._queue = self.running_app.blocks._queue
        demo.has_launched = True
        demo.max_file_size = self.running_app.blocks.max_file_size
        demo.is_running = True
        self.running_app.state_holder.reset(demo)
        self.running_app.blocks = demo


class SourceFileReloader(BaseReloader):
    def __init__(
        self,
        app: App,
        watch_dirs: list[str],
        watch_module_name: str,
        demo_file: str,
        stop_event: threading.Event,
        demo_name: str = "demo",
    ) -> None:
        super().__init__()
        self.app = app
        self.watch_dirs = watch_dirs
        self.watch_module_name = watch_module_name
        self.stop_event = stop_event
        self.demo_name = demo_name
        self.demo_file = Path(demo_file)

    @property
    def running_app(self) -> App:
        return self.app

    def should_watch(self) -> bool:
        return not self.stop_event.is_set()

    def stop(self) -> None:
        self.stop_event.set()

    def alert_change(self, change_type: Literal["reload", "error"] = "reload"):
        self.app.change_type = change_type
        self.app.change_count += 1

    def swap_blocks(self, demo: Blocks):
        old_blocks = self.running_app.blocks
        super().swap_blocks(demo)
        if old_blocks:
            reassign_keys(old_blocks, demo)
        demo.config = demo.get_config_file()
        self.alert_change("reload")


NO_RELOAD = True


def _remove_no_reload_codeblocks(file_path: str):
    """Parse the file, remove the gr.no_reload code blocks, and write the file back to disk.

    Parameters:
        file_path (str): The path to the file to remove the no_reload code blocks from.
    """

    with open(file_path, encoding="utf-8") as file:
        code = file.read()

    tree = ast.parse(code)

    def _is_gr_no_reload(expr: ast.AST) -> bool:
        """Find with gr.no_reload context managers."""
        return (
            isinstance(expr, ast.If)
            and isinstance(expr.test, ast.Attribute)
            and isinstance(expr.test.value, ast.Name)
            and expr.test.value.id == "gr"
            and expr.test.attr == "NO_RELOAD"
        )

    # Find the positions of the code blocks to load
    for node in ast.walk(tree):
        if _is_gr_no_reload(node):
            assert isinstance(node, ast.If)  # noqa: S101
            node.body = [ast.Pass(lineno=node.lineno, col_offset=node.col_offset)]

    # convert tree to string
    code_removed = compile(tree, filename=file_path, mode="exec")
    return code_removed


def _find_module(source_file: Path) -> ModuleType | None:
    for s, v in sys.modules.items():
        if s not in {"__main__", "__mp_main__"} and getattr(v, "__file__", None) == str(
            source_file
        ):
            return v
    return None


def watchfn(reloader: SourceFileReloader):
    """Watch python files in a given module.

    get_changes is taken from uvicorn's default file watcher.
    """

    # The thread running watchfn will be the thread reloading
    # the app. So we need to modify this thread_data attr here
    # so that subsequent calls to reload don't launch the app
    from gradio.cli.commands.reload import reload_thread

    reload_thread.running_reload = True

    def get_changes() -> Path | None:
        for file in iter_py_files():
            try:
                mtime = file.stat().st_mtime
            except OSError:  # pragma: nocover
                continue

            old_time = mtimes.get(file)
            if old_time is None:
                mtimes[file] = mtime
                continue
            elif mtime > old_time:
                return file
        return None

    def iter_py_files() -> Iterator[Path]:
        for reload_dir in reload_dirs:
            for path in list(reload_dir.rglob("*.py")):
                yield path.resolve()
            for path in list(reload_dir.rglob("*.css")):
                yield path.resolve()

    reload_dirs = [Path(dir_) for dir_ in reloader.watch_dirs]
    import sys

    for dir_ in reload_dirs:
        sys.path.insert(0, str(dir_))

    mtimes = {}
    # Need to import the module in this thread so that the
    # module is available in the namespace of this thread
    module = importlib.import_module(reloader.watch_module_name)
    while reloader.should_watch():
        changed = get_changes()
        if changed:
            print(f"Changes detected in: {changed}")
            try:
                # How source file reloading works
                # 1. Remove the gr.no_reload code blocks from the temp file
                # 2. Execute the changed source code in the original module's namespac
                # 3. Delete the package the module is in from sys.modules.
                # This is so that the updated module is available in the entire package
                # 4. Do 1-2 for the main demo file even if it did not change.
                # This is because the main demo file may import the changed file and we need the
                # changes to be reflected in the main demo file.

                if changed.suffix == ".py":
                    changed_in_copy = _remove_no_reload_codeblocks(str(changed))
                    if changed != reloader.demo_file:
                        changed_module = _find_module(changed)
                        if changed_module:
                            exec(changed_in_copy, changed_module.__dict__)
                            top_level_parent = sys.modules[
                                changed_module.__name__.split(".")[0]
                            ]
                            if top_level_parent != changed_module:
                                importlib.reload(top_level_parent)

                changed_demo_file = _remove_no_reload_codeblocks(
                    str(reloader.demo_file)
                )
                exec(changed_demo_file, module.__dict__)
            except Exception:
                print(
                    f"Reloading {reloader.watch_module_name} failed with the following exception: "
                )
                traceback.print_exc()
                mtimes = {}
                reloader.alert_change("error")
                reloader.app.reload_error_message = traceback.format_exc()
                continue
            demo = getattr(module, reloader.demo_name)
            reloader.swap_blocks(demo)
            mtimes = {}
        time.sleep(0.05)


def deep_equal(a: Any, b: Any) -> bool:
    """
    Deep equality check for component values.

    Prefer orjson for performance and compatibility with numpy arrays/dataframes/torch tensors.
    If objects are not serializable by orjson, fall back to regular equality check.
    """

    def _serialize(a: Any) -> bytes:
        return orjson.dumps(
            a,
            option=orjson.OPT_SERIALIZE_NUMPY | orjson.OPT_PASSTHROUGH_DATETIME,
        )

    try:
        return _serialize(a) == _serialize(b)
    except TypeError:
        try:
            return a == b
        except Exception:
            return False


def reassign_keys(old_blocks: Blocks, new_blocks: Blocks):
    from gradio.blocks import BlockContext

    assigned_keys = [
        block.key for block in new_blocks.children if block.key is not None
    ]

    def reassign_context_keys(
        old_context: BlockContext | None, new_context: BlockContext
    ):
        for i, new_block in enumerate(new_context.children):
            if old_context and i < len(old_context.children):
                old_block = old_context.children[i]
            else:
                old_block = None
            if new_block.key is None:
                if (
                    old_block.__class__ == new_block.__class__
                    and old_block is not None
                    and old_block.key not in assigned_keys
                    and deep_equal(
                        getattr(old_block, "value", None),
                        getattr(new_block, "value", None),
                    )
                ):
                    new_block.key = old_block.key
                else:
                    new_block.key = f"__{new_block._id}__"

            if isinstance(new_block, BlockContext):
                if (
                    isinstance(old_block, BlockContext)
                    and old_block.__class__ == new_block.__class__
                ):
                    reassign_context_keys(old_block, new_block)
                else:
                    reassign_context_keys(None, new_block)

    reassign_context_keys(old_blocks, new_blocks)


def colab_check() -> bool:
    """
    Check if interface is launching from Google Colab
    :return is_colab (bool): True or False
    """
    is_colab = False
    try:  # Check if running interactively using ipython.
        from IPython.core.getipython import get_ipython

        from_ipynb = get_ipython()
        if "google.colab" in str(from_ipynb):
            is_colab = True
    except (ImportError, NameError):
        pass
    return is_colab


def kaggle_check() -> bool:
    return bool(
        os.environ.get("KAGGLE_KERNEL_RUN_TYPE") or os.environ.get("GFOOTBALL_DATA_DIR")
    )


def sagemaker_check() -> bool:
    try:
        import boto3  # type: ignore

        client = boto3.client("sts")
        response = client.get_caller_identity()
        return "sagemaker" in response["Arn"].lower()
    except Exception:
        return False


def ipython_check() -> bool:
    """
    Check if interface is launching from iPython (not colab)
    :return is_ipython (bool): True or False
    """
    is_ipython = False
    try:  # Check if running interactively using ipython.
        from IPython.core.getipython import get_ipython

        if get_ipython() is not None:
            is_ipython = True
    except (ImportError, NameError):
        pass
    return is_ipython


def get_space() -> str | None:
    if os.getenv("SYSTEM") == "spaces":
        return os.getenv("SPACE_ID")
    return None


def is_zero_gpu_space() -> bool:
    return os.getenv("SPACES_ZERO_GPU") == "true"


def download_if_url(article: str) -> str:
    try:
        result = urllib.parse.urlparse(article)
        is_url = all([result.scheme, result.netloc, result.path])
        is_url = is_url and result.scheme in ["http", "https"]
    except ValueError:
        is_url = False

    if not is_url:
        return article

    try:
        response = httpx.get(article, timeout=3)
        if response.status_code == httpx.codes.OK:  # pylint: disable=no-member
            article = response.text
    except (httpx.InvalidURL, httpx.RequestError, httpx.TimeoutException):
        pass

    return article


HASH_SEED_PATH = os.path.join(os.path.dirname(gradio.__file__), "hash_seed.txt")


def get_hash_seed() -> str:
    try:
        if os.path.exists(HASH_SEED_PATH):
            with open(HASH_SEED_PATH) as j:
                return j.read().strip()
        else:
            with open(HASH_SEED_PATH, "w") as j:
                seed = uuid.uuid4().hex
                j.write(seed)
                return seed
    except Exception:
        return uuid.uuid4().hex


def get_default_args(func: Callable) -> list[Any]:
    signature = inspect.signature(func)
    return [
        v.default if v.default is not inspect.Parameter.empty else None
        for v in signature.parameters.values()
    ]


def safe_deepcopy(obj: Any) -> Any:
    try:
        return copy.deepcopy(obj)
    except Exception:
        if isinstance(obj, dict):
            return {
                safe_deepcopy(key): safe_deepcopy(value) for key, value in obj.items()
            }
        elif isinstance(obj, list):
            return [safe_deepcopy(item) for item in obj]
        elif isinstance(obj, tuple):
            return tuple(safe_deepcopy(item) for item in obj)
        elif isinstance(obj, set):
            return {safe_deepcopy(item) for item in obj}
        else:
            return copy.copy(obj)


def assert_configs_are_equivalent_besides_ids(
    config1: dict, config2: dict, root_keys: tuple = ("mode",)
):
    """Allows you to test if two different Blocks configs produce the same demo.

    Parameters:
    config1 (dict): nested dict with config from the first Blocks instance
    config2 (dict): nested dict with config from the second Blocks instance
    root_keys (Tuple): an interable consisting of which keys to test for equivalence at
        the root level of the config. By default, only "mode" is tested,
        so keys like "version" are ignored.
    """
    config1 = copy.deepcopy(config1)
    config2 = copy.deepcopy(config2)
    config1 = json.loads(json.dumps(config1))  # convert tuples to lists
    config2 = json.loads(json.dumps(config2))

    for key in root_keys:
        if config1[key] != config2[key]:
            raise ValueError(f"Configs have different: {key}")

    if len(config1["components"]) != len(config2["components"]):
        raise ValueError("# of components are different")

    def assert_same_components(config1_id, config2_id):
        c1 = list(filter(lambda c: c["id"] == config1_id, config1["components"]))
        if len(c1) == 0:
            raise ValueError(f"Could not find component with id {config1_id}")
        c1 = c1[0]
        c2 = list(filter(lambda c: c["id"] == config2_id, config2["components"]))
        if len(c2) == 0:
            raise ValueError(f"Could not find component with id {config2_id}")
        c2 = c2[0]
        c1 = copy.deepcopy(c1)
        c1.pop("id")
        c2 = copy.deepcopy(c2)
        c2.pop("id")
        if c1 != c2:
            raise ValueError(f"{c1} does not match {c2}")

    def same_children_recursive(children1, chidren2):
        for child1, child2 in zip(children1, chidren2, strict=False):
            assert_same_components(child1["id"], child2["id"])
            if "children" in child1 or "children" in child2:
                same_children_recursive(child1["children"], child2["children"])

    children1 = config1["layout"]["children"]
    children2 = config2["layout"]["children"]
    same_children_recursive(children1, children2)

    for d1, d2 in zip(config1["dependencies"], config2["dependencies"], strict=False):
        for t1, t2 in zip(d1.pop("targets"), d2.pop("targets"), strict=False):
            assert_same_components(t1[0], t2[0])
        for i1, i2 in zip(d1.pop("inputs"), d2.pop("inputs"), strict=False):
            assert_same_components(i1, i2)
        for o1, o2 in zip(d1.pop("outputs"), d2.pop("outputs"), strict=False):
            assert_same_components(o1, o2)

        if d1 != d2:
            raise ValueError(f"{d1} does not match {d2}")

    return True


def delete_none(_dict: dict, skip_value: bool = False) -> dict:
    """
    Delete keys whose values are None from a dictionary
    """
    for key, value in list(_dict.items()):
        if skip_value and key == "value":
            continue
        elif value is None:
            del _dict[key]
    return _dict


def resolve_singleton(_list: list[Any] | Any) -> Any:
    if len(_list) == 1:
        return _list[0]
    else:
        return _list


def get_all_components() -> list[type[Component] | type[BlockContext]]:
    import gradio as gr

    classes_to_check = (
        gr.components.Component.__subclasses__()
        + gr.blocks.BlockContext.__subclasses__()  # type: ignore
    )
    subclasses = []

    while classes_to_check:
        subclass = classes_to_check.pop()
        classes_to_check.extend(subclass.__subclasses__())
        subclasses.append(subclass)
    return [
        c
        for c in subclasses
        if c.__name__
        not in ["ChatInterface", "Interface", "Blocks", "TabbedInterface", "NativePlot"]
    ]


def core_gradio_components():
    return [
        class_
        for class_ in get_all_components()
        if class_.__module__.startswith("gradio.")
    ]


def component_or_layout_class(cls_name: str) -> type[Component] | type[BlockContext]:
    """
    Returns the component, template, or layout class with the given class name, or
    raises a ValueError if not found.

    Parameters:
    cls_name (str): lower-case string class name of a component
    Returns:
    cls: the component class
    """
    import gradio.components as components_module
    from gradio.components import Component

    components = {c.__name__.lower(): c for c in get_all_components()}
    # add aliases such as 'text'
    for name, cls in components_module.__dict__.items():
        if isinstance(cls, type) and issubclass(cls, Component):
            components[name.lower()] = cls

    if cls_name.replace("_", "") in components:
        return components[cls_name.replace("_", "")]

    raise ValueError(
        f"No such component or layout: {cls_name}. "
        "It is possible it is a custom component, "
        "in which case make sure it is installed and imported in your python session."
    )


def run_coro_in_background(func: Callable, *args, **kwargs):
    """
    Runs coroutines in background.

    Warning, be careful to not use this function in other than FastAPI scope, because the event_loop has not started yet.
    You can use it in any scope reached by FastAPI app.

    correct scope examples: endpoints in routes, Blocks.process_api
    incorrect scope examples: Blocks.launch

    Use startup_events in routes.py if you need to run a coro in background in Blocks.launch().


    Example:
        utils.run_coro_in_background(fn, *args, **kwargs)

    Args:
        func:
        *args:
        **kwargs:

    Returns:

    """
    event_loop = asyncio.get_event_loop()
    return event_loop.create_task(func(*args, **kwargs))


def run_sync_iterator_async(iterator):
    """Helper for yielding StopAsyncIteration from sync iterators."""
    try:
        return next(iterator)
    except StopIteration:
        # raise a ValueError here because co-routines can't raise StopIteration themselves
        raise StopAsyncIteration() from None


class SyncToAsyncIterator:
    """Treat a synchronous iterator as async one."""

    def __init__(self, iterator, limiter) -> None:
        self.iterator = iterator
        self.limiter = limiter

    def __aiter__(self):
        return self

    async def __anext__(self):
        return await anyio.to_thread.run_sync(
            run_sync_iterator_async, self.iterator, limiter=self.limiter
        )


async def async_iteration(iterator):
    return await anext(iterator)


@contextmanager
def set_directory(path: Path | str):
    """Context manager that sets the working directory to the given path."""
    origin = Path().absolute()
    try:
        os.chdir(path)
        yield
    finally:
        os.chdir(origin)


@contextmanager
def no_raise_exception():
    """Context manager that suppresses exceptions."""
    try:
        yield
    except Exception:
        pass


def sanitize_value_for_csv(value: str | float) -> str | float:
    """
    Sanitizes a value that is being written to a CSV file to prevent CSV injection attacks.
    Reference: https://owasp.org/www-community/attacks/CSV_Injection
    """
    if isinstance(value, (float, int)):
        return value
    unsafe_prefixes = ["=", "+", "-", "@", "\t", "\n"]
    unsafe_sequences = [",=", ",+", ",-", ",@", ",\t", ",\n"]
    if any(value.startswith(prefix) for prefix in unsafe_prefixes) or any(
        sequence in value for sequence in unsafe_sequences
    ):
        value = f"'{value}"
    return value


def sanitize_list_for_csv(values: list[Any]) -> list[Any]:
    """
    Sanitizes a list of values (or a list of list of values) that is being written to a
    CSV file to prevent CSV injection attacks.
    """
    sanitized_values = []
    for value in values:
        if isinstance(value, list):
            sanitized_value = [sanitize_value_for_csv(v) for v in value]
            sanitized_values.append(sanitized_value)
        else:
            sanitized_value = sanitize_value_for_csv(value)
            sanitized_values.append(sanitized_value)
    return sanitized_values


def append_unique_suffix(name: str, list_of_names: list[str]):
    """Appends a numerical suffix to `name` so that it does not appear in `list_of_names`."""
    set_of_names: set[str] = set(list_of_names)  # for O(1) lookup
    if name not in set_of_names:
        return name
    else:
        suffix_counter = 1
        new_name = f"{name}_{suffix_counter}"
        while new_name in set_of_names:
            suffix_counter += 1
            new_name = f"{name}_{suffix_counter}"
        return new_name


def validate_url(possible_url: str) -> bool:
    headers = {"User-Agent": "gradio (https://gradio.app/; gradio-team@huggingface.co)"}
    try:
        head_request = httpx.head(possible_url, headers=headers, follow_redirects=True)
        # some URLs, such as AWS S3 presigned URLs, return a 405 or a 403 for HEAD requests
        if head_request.status_code in (403, 405):
            return httpx.get(
                possible_url, headers=headers, follow_redirects=True
            ).is_success
        return head_request.is_success
    except Exception:
        return False


def is_prop_update(val):
    return isinstance(val, dict) and "update" in val.get("__type__", "")


def function_wrapper(
    f: Callable,
    before_fn: Callable | None = None,
    before_args: Iterable | None = None,
    after_fn: Callable | None = None,
    after_args: Iterable | None = None,
):
    before_args = [] if before_args is None else before_args
    after_args = [] if after_args is None else after_args
    if inspect.isasyncgenfunction(f):

        @functools.wraps(f)
        async def asyncgen_wrapper(*args, **kwargs):
            iterator = f(*args, **kwargs)
            while True:
                if before_fn:
                    before_fn(*before_args)
                try:
                    response = await iterator.__anext__()
                except StopAsyncIteration:
                    if after_fn:
                        after_fn(*after_args)
                    break
                if after_fn:
                    after_fn(*after_args)
                yield response

        return asyncgen_wrapper

    elif asyncio.iscoroutinefunction(f):

        @functools.wraps(f)
        async def async_wrapper(*args, **kwargs):
            if before_fn:
                before_fn(*before_args)
            response = await f(*args, **kwargs)
            if after_fn:
                after_fn(*after_args)
            return response

        return async_wrapper

    elif inspect.isgeneratorfunction(f):

        @functools.wraps(f)
        def gen_wrapper(*args, **kwargs):
            iterator = f(*args, **kwargs)
            while True:
                if before_fn:
                    before_fn(*before_args)
                try:
                    response = next(iterator)
                except StopIteration:
                    if after_fn:
                        after_fn(*after_args)
                    break
                if after_fn:
                    after_fn(*after_args)
                yield response

        return gen_wrapper

    else:

        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            if before_fn:
                before_fn(*before_args)
            response = f(*args, **kwargs)
            if after_fn:
                after_fn(*after_args)
            return response

        return wrapper


def get_function_with_locals(
    fn: Callable,
    blocks: Blocks,
    event_id: str | None,
    in_event_listener: bool,
    request: Request | None,
    state: SessionState | None,
):
    def before_fn(blocks, event_id):
        from gradio.context import LocalContext

        LocalContext.blocks.set(blocks)
        LocalContext.in_event_listener.set(in_event_listener)
        LocalContext.event_id.set(event_id)
        LocalContext.request.set(request)
        if state:
            LocalContext.blocks_config.set(state.blocks_config)

    def after_fn():
        from gradio.context import LocalContext

        LocalContext.in_event_listener.set(False)
        LocalContext.request.set(None)
        LocalContext.blocks_config.set(None)

    return function_wrapper(
        fn,
        before_fn=before_fn,
        before_args=(blocks, event_id),
        after_fn=after_fn,
    )


async def cancel_tasks(task_ids: set[str]) -> list[str]:
    tasks = [(task, task.get_name()) for task in asyncio.all_tasks()]
    event_ids: list[str] = []
    matching_tasks = []
    for task, name in tasks:
        if "<gradio-sep>" not in name:
            continue
        task_id, event_id = name.split("<gradio-sep>")
        if task_id in task_ids:
            matching_tasks.append(task)
            event_ids.append(event_id)
            task.cancel()
    await asyncio.gather(*matching_tasks, return_exceptions=True)
    return event_ids


def set_task_name(task, session_hash: str, fn_index: int, event_id: str, batch: bool):
    if not batch:
        task.set_name(f"{session_hash}_{fn_index}<gradio-sep>{event_id}")


def get_cancelled_fn_indices(
    dependencies: list[dict[str, Any]],
) -> list[int]:
    fn_indices = []
    for dep in dependencies:
        root_block = get_blocks_context()
        if root_block:
            fn_index = next(
                i for i, d in root_block.fns.items() if d.get_config() == dep
            )
            fn_indices.append(fn_index)

    return fn_indices


def get_type_hints(fn):
    if inspect.isfunction(fn) or inspect.ismethod(fn):
        pass
    elif callable(fn):
        fn = fn.__call__
    else:
        return {}
    return typing.get_type_hints(fn)


def is_special_typed_parameter(name, parameter_types):
    from gradio.helpers import EventData
    from gradio.oauth import OAuthProfile, OAuthToken
    from gradio.routes import Request

    """Checks if parameter has a type hint designating it as a gr.Request, gr.EventData, gr.OAuthProfile or gr.OAuthToken."""
    hint = parameter_types.get(name)
    if not hint:
        return False
    is_request = hint in (Request, Optional[Request])
    is_oauth_arg = hint in (
        OAuthProfile,
        Optional[OAuthProfile],
        OAuthToken,
        Optional[OAuthToken],
    )
    is_event_data = inspect.isclass(hint) and issubclass(hint, EventData)
    return is_request or is_event_data or is_oauth_arg


def check_function_inputs_match(fn: Callable, inputs: Sequence, inputs_as_dict: bool):
    """
    Checks if the input component set matches the function
    Returns: None if valid or if the function does not have a signature (e.g. is a built in),
    or a string error message if mismatch
    """
    try:
        signature = inspect.signature(fn)
    except ValueError:
        return None
    parameter_types = get_type_hints(fn)
    min_args = 0
    max_args = 0
    infinity = -1
    for name, param in signature.parameters.items():
        has_default = param.default != param.empty
        if param.kind in [param.POSITIONAL_ONLY, param.POSITIONAL_OR_KEYWORD]:
            if not is_special_typed_parameter(name, parameter_types):
                if not has_default:
                    min_args += 1
                max_args += 1
        elif param.kind == param.VAR_POSITIONAL:
            max_args = infinity
        elif param.kind == param.KEYWORD_ONLY and not has_default:
            return f"Keyword-only args must have default values for function {fn}"
    arg_count = 1 if inputs_as_dict else len(inputs)
    if min_args == max_args and max_args != arg_count:
        warnings.warn(
            f"Expected {max_args} arguments for function {fn}, received {arg_count}."
        )
    if arg_count < min_args:
        warnings.warn(
            f"Expected at least {min_args} arguments for function {fn}, received {arg_count}."
        )
    if max_args != infinity and arg_count > max_args:
        warnings.warn(
            f"Expected maximum {max_args} arguments for function {fn}, received {arg_count}."
        )


class TupleNoPrint(tuple):
    # To remove printing function return in notebook
    def __repr__(self):
        return ""

    def __str__(self):
        return ""


class MatplotlibBackendMananger:
    def __enter__(self):
        try:
            import matplotlib

            self._original_backend = matplotlib.get_backend()
            matplotlib.use("agg")
        except ImportError:
            pass

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            import matplotlib

            matplotlib.use(self._original_backend)
        except ImportError:
            pass


def tex2svg(formula, *_args):
    with MatplotlibBackendMananger():
        import matplotlib.pyplot as plt

        fontsize = 20
        dpi = 300
        plt.rc("mathtext", fontset="cm")
        fig = plt.figure(figsize=(0.01, 0.01))
        fig.text(0, 0, rf"${formula}$", fontsize=fontsize)
        output = BytesIO()
        fig.savefig(  # type: ignore
            output,
            dpi=dpi,
            transparent=True,
            format="svg",
            bbox_inches="tight",
            pad_inches=0.0,
        )
        plt.close(fig)
        output.seek(0)
        xml_code = output.read().decode("utf-8")
        svg_start = xml_code.index("<svg ")
        svg_code = xml_code[svg_start:]
        svg_code = re.sub(r"<metadata>.*<\/metadata>", "", svg_code, flags=re.DOTALL)
        svg_code = re.sub(r' width="[^"]+"', "", svg_code)
        height_match = re.search(r'height="([\d.]+)pt"', svg_code)
        if height_match:
            height = float(height_match.group(1))
            new_height = height / fontsize  # conversion from pt to em
            svg_code = re.sub(
                r'height="[\d.]+pt"', f'height="{new_height}em"', svg_code
            )
        copy_code = f"<span style='font-size: 0px'>{formula}</span>"
    return f"{copy_code}{svg_code}"


def abspath(path: str | Path) -> Path:
    return Path(os.path.abspath(str(path)))


def is_in_or_equal(path_1: str | Path, path_2: str | Path) -> bool:
    """
    True if path_1 is a descendant (i.e. located within) path_2 or if the paths are the
    same, returns False otherwise.
    Parameters:
        path_1: str or Path (to file or directory)
        path_2: str or Path (to file or directory)
    """
    path_1, path_2 = abspath(path_1).resolve(), abspath(path_2).resolve()
    try:
        path_1.relative_to(path_2)
        return True
    except ValueError:
        return False


@document()
def set_static_paths(paths: list[str | Path]) -> None:
    """
    Set the static paths to be served by the gradio app.

    Static files are are served directly from the file system instead of being copied. They are served to users with The Content-Disposition HTTP header set to "inline"
    when sending these files to users. This indicates that the file should be displayed directly in the browser window if possible.
    This function is useful when you want to serve files that you know will not be modified during the lifetime of the gradio app (like files used in gr.Examples).
    By setting static paths, your app will launch faster and it will consume less disk space.
    Calling this function will set the static paths for all gradio applications defined in the same interpreter session until it is called again or the session ends.

    Parameters:
        paths: List of filepaths or directory names to be served by the gradio app. If it is a directory name, ALL files located within that directory will be considered static and not moved to the gradio cache. This also means that ALL files in that directory will be accessible over the network.
    Example:
        import gradio as gr

        # Paths can be a list of strings or pathlib.Path objects
        # corresponding to filenames or directories.
        gr.set_static_paths(paths=["test/test_files/"])

        # The example files and the default value of the input
        # will not be copied to the gradio cache and will be served directly.
        demo = gr.Interface(
            lambda s: s.rotate(45),
            gr.Image(value="test/test_files/cheetah1.jpg", type="pil"),
            gr.Image(),
            examples=["test/test_files/bus.png"],
        )

        demo.launch()
    """
    from gradio.data_classes import _StaticFiles

    _StaticFiles.all_paths.extend([Path(p).resolve() for p in paths])


def is_static_file(file_path: Any):
    """Returns True if the file is a static file (and not moved to cache)"""
    from gradio.data_classes import _StaticFiles

    return _is_static_file(file_path, _StaticFiles.all_paths)


def _is_static_file(file_path: Any, static_files: list[Path]) -> bool:
    """
    Returns True if the file is a static file (i.e. is is in the static files list).
    """
    if not isinstance(file_path, (str, Path, FileData)):
        return False
    if isinstance(file_path, FileData):
        file_path = file_path.path
    if isinstance(file_path, str):
        file_path = Path(file_path)
        if not file_path.exists():
            return False
    return any(is_in_or_equal(file_path, static_file) for static_file in static_files)


HTML_TAG_RE = re.compile("<[^>]*?(?:\n[^>]*?)*>", re.DOTALL)


def remove_html_tags(raw_html: str | None) -> str:
    return re.sub(HTML_TAG_RE, "", raw_html or "")


def find_user_stack_level() -> int:
    """
    Find the first stack frame not inside Gradio.
    """
    frame = inspect.currentframe()
    n = 0
    while frame:
        fname = inspect.getfile(frame)
        if "/gradio/" not in fname.replace(os.sep, "/"):
            break
        frame = frame.f_back
        n += 1
    return n


class NamedString(str):
    """
    Subclass of str that includes a .name attribute equal to the value of the string itself. This class is used when returning
    a value from the `.preprocess()` methods of the File and UploadButton components. Before Gradio 4.0, these methods returned a file
    object which was then converted to a string filepath using the `.name` attribute. In Gradio 4.0, these methods now return a str
    filepath directly, but to maintain backwards compatibility, we use this class instead of a regular str.
    """

    def __init__(self, *args):
        super().__init__()
        self.name = str(self) if args else ""


def default_input_labels():
    """
    A generator that provides default input labels for components when the user's function
    does not have named parameters. The labels are of the form "input 0", "input 1", etc.
    """
    n = 0
    while True:
        yield f"input {n}"
        n += 1


def get_extension_from_file_path_or_url(file_path_or_url: str) -> str:
    """
    Returns the file extension (without the dot) from a file path or URL. If the file path or URL does not have a file extension, returns an empty string.
    For example, "https://example.com/avatar/xxxx.mp4?se=2023-11-16T06:51:23Z&sp=r" would return "mp4".
    """
    parsed_url = urllib.parse.urlparse(file_path_or_url)
    file_extension = os.path.splitext(os.path.basename(parsed_url.path))[1]
    return file_extension[1:] if file_extension else ""


K = TypeVar("K")
V = TypeVar("V")


class LRUCache(OrderedDict, Generic[K, V]):
    def __init__(self, max_size: int = 100):
        super().__init__()
        self.max_size: int = max_size

    def __setitem__(self, key: K, value: V) -> None:
        if key in self:
            self.move_to_end(key)
        elif len(self) >= self.max_size:
            self.popitem(last=False)
        super().__setitem__(key, value)

    def __getitem__(self, key: K) -> V:
        return super().__getitem__(key)


def get_cache_folder() -> Path:
    return Path(os.environ.get("GRADIO_EXAMPLES_CACHE", ".gradio/cached_examples"))


def diff(old, new):
    def compare_objects(obj1, obj2, path=None):
        if path is None:
            path = []
        edits = []

        if obj1 == obj2:
            return edits

        if type(obj1) != type(obj2):
            edits.append(("replace", path, obj2))
            return edits

        if isinstance(obj1, str) and obj2.startswith(obj1):
            edits.append(("append", path, obj2[len(obj1) :]))
            return edits

        if isinstance(obj1, list):
            common_length = min(len(obj1), len(obj2))
            for i in range(common_length):
                edits.extend(compare_objects(obj1[i], obj2[i], path + [i]))
            for i in range(common_length, len(obj1)):
                edits.append(("delete", path + [i], None))
            for i in range(common_length, len(obj2)):
                edits.append(("add", path + [i], obj2[i]))
            return edits

        if isinstance(obj1, dict):
            for key in obj1:
                if key in obj2:
                    edits.extend(compare_objects(obj1[key], obj2[key], path + [key]))
                else:
                    edits.append(("delete", path + [key], None))
            for key in obj2:
                if key not in obj1:
                    edits.append(("add", path + [key], obj2[key]))
            return edits

        edits.append(("replace", path, obj2))
        return edits

    return compare_objects(old, new)


def get_upload_folder() -> str:
    return os.environ.get("GRADIO_TEMP_DIR") or str(
        (Path(tempfile.gettempdir()) / "gradio").resolve()
    )


def get_function_params(func: Callable) -> list[tuple[str, bool, Any]]:
    """
    Gets the parameters of a function as a list of tuples of the form (name, has_default, default_value).
    Excludes *args and **kwargs, as well as args that are Gradio-specific, such as gr.Request, gr.EventData, gr.OAuthProfile, and gr.OAuthToken.
    """
    params_info = []
    signature = inspect.signature(func)
    type_hints = get_type_hints(func)
    for name, parameter in signature.parameters.items():
        if parameter.kind in (
            inspect.Parameter.VAR_POSITIONAL,
            inspect.Parameter.VAR_KEYWORD,
        ):
            break
        if is_special_typed_parameter(name, type_hints):
            continue
        if parameter.default is inspect.Parameter.empty:
            params_info.append((name, False, None))
        else:
            params_info.append((name, True, parameter.default))
    return params_info


def simplify_file_data_in_str(s):
    """
    If a FileData dictionary has been dumped as part of a string, this function will replace the dict with just the str filepath
    """
    try:
        payload = json.loads(s)
    except json.JSONDecodeError:
        return s
    payload = client_utils.traverse(
        payload, lambda x: x["path"], client_utils.is_file_obj_with_meta
    )
    if isinstance(payload, str):
        return payload
    return json.dumps(payload)


def sync_fn_to_generator(fn):
    def wrapped(*args, **kwargs):
        yield fn(*args, **kwargs)

    return wrapped


def async_fn_to_generator(fn):
    async def wrapped(*args, **kwargs):
        yield await fn(*args, **kwargs)

    return wrapped


def async_lambda(f: Callable) -> Callable:
    """Turn a function into an async function.
    Useful for internal event handlers defined as lambda functions used in the codebase
    """

    @wraps(f)
    async def function_wrapper(*args, **kwargs):
        return f(*args, **kwargs)

    return function_wrapper


class FileSize:
    B = 1
    KB = 1024 * B
    MB = 1024 * KB
    GB = 1024 * MB
    TB = 1024 * GB


def _parse_file_size(size: str | int | None) -> int | None:
    if isinstance(size, int) or size is None:
        return size

    size = size.replace(" ", "")

    last_digit_index = next(
        (i for i, c in enumerate(size) if not c.isdigit()), len(size)
    )
    size_int, unit = int(size[:last_digit_index]), size[last_digit_index:].upper()
    multiple = getattr(FileSize, unit, None)
    if not multiple:
        raise ValueError(f"Invalid file size unit: {unit}")
    return multiple * size_int


def connect_heartbeat(config: BlocksConfigDict, blocks) -> bool:
    """
    Determines whether a heartbeat is required for a given config.
    """
    from gradio.components import State

    any_state = any(isinstance(block, State) for block in blocks)
    any_unload = False
    any_stream = False

    if "dependencies" not in config:
        raise ValueError(
            "Dependencies not found in config. Cannot determine whether"
            "heartbeat is required."
        )

    for dep in config["dependencies"]:
        for target in dep["targets"]:
            if isinstance(target, (list, tuple)) and len(target) == 2:
                any_unload = target[1] == "unload"
                if any_unload:
                    break
                any_stream = target[1] == "stream"
                if any_stream:
                    break
    return any_state or any_unload or any_stream


def deep_hash(obj):
    """Compute a hash for a deeply nested data structure."""
    hasher = hashlib.sha256()
    if isinstance(obj, (int, float, str, bytes)):
        items = obj
    elif isinstance(obj, dict):
        items = tuple(
            [
                (k, deep_hash(v))
                for k, v in sorted(obj.items(), key=lambda x: hash(x[0]))
            ]
        )
    elif isinstance(obj, (list, tuple)):
        items = tuple(deep_hash(x) for x in obj)
    elif isinstance(obj, set):
        items = tuple(deep_hash(x) for x in sorted(obj, key=hash))
    elif isinstance(obj, Hashable):
        items = str(hash(obj)).encode("utf-8")
    else:
        items = str(id(obj)).encode("utf-8")
    hasher.update(repr(items).encode("utf-8"))
    return hasher.hexdigest()


def error_payload(
    error: BaseException | None, show_error: bool
) -> dict[str, bool | str | float | None]:
    content: dict[str, bool | str | float | None] = {"error": None}
    show_error = show_error or isinstance(error, Error)
    if show_error:
        if isinstance(error, Error):
            content["error"] = error.message
            content["duration"] = error.duration
            content["visible"] = error.visible
            content["title"] = error.title
        else:
            content["error"] = str(error)
    return content


class UnhashableKeyDict(MutableMapping):
    """
    Essentially a list of key-value tuples that allows for keys that are not hashable,
    but acts like a dictionary for convenience.
    """

    def __init__(self):
        self.data = []

    def __getitem__(self, key):
        for k, v in self.data:
            if deep_equal(k, key):
                return v
        raise KeyError(key)

    def __setitem__(self, key, value):
        for i, (k, _) in enumerate(self.data):
            if deep_equal(k, key):
                self.data[i] = (key, value)
                return
        self.data.append((key, value))

    def __delitem__(self, key):
        for i, (k, _) in enumerate(self.data):
            if deep_equal(k, key):
                del self.data[i]
                return
        raise KeyError(key)

    def __iter__(self):
        return (k for k, _ in self.data)

    def __len__(self):
        return len(self.data)

    def as_list(self):
        return [v for _, v in self.data]


def safe_join(directory: DeveloperPath, path: UserProvidedPath) -> str:
    """Safely path to a base directory to avoid escaping the base directory.
    Borrowed from: werkzeug.security.safe_join"""
    _os_alt_seps: list[str] = [
        sep for sep in [os.path.sep, os.path.altsep] if sep is not None and sep != "/"
    ]

    filename = posixpath.normpath(path)
    fullpath = os.path.join(directory, filename)
    if (
        any(sep in filename for sep in _os_alt_seps)
        or os.path.isabs(filename)
        or filename == ".."
        or filename.startswith("../")
    ):
        raise InvalidPathError()

    return fullpath


def is_allowed_file(
    path: Path,
    blocked_paths: Sequence[str | Path],
    allowed_paths: Sequence[str | Path],
    created_paths: Sequence[str | Path],
) -> tuple[
    bool, Literal["in_blocklist", "allowed", "created", "not_created_or_allowed"]
]:
    in_blocklist = any(
        is_in_or_equal(path, blocked_path) for blocked_path in blocked_paths
    )
    if in_blocklist:
        return False, "in_blocklist"
    if any(is_in_or_equal(path, allowed_path) for allowed_path in allowed_paths):
        return True, "allowed"
    if any(is_in_or_equal(path, created_path) for created_path in created_paths):
        return True, "created"
    return False, "not_created_or_allowed"


def get_node_path():
    env_node_path = os.environ.get("GRADIO_NODE_PATH")
    if env_node_path:
        return env_node_path

    which_node_path = shutil.which("node")
    if which_node_path:
        return which_node_path

    try:
        # On Windows, try using 'where' command
        if sys.platform == "win32":
            windows_path = (
                subprocess.check_output(["where", "node"])
                .decode()
                .strip()
                .split("\r\n")[0]
            )
            # Verify the path exists
            if os.path.exists(windows_path):
                return windows_path
        # Try using the 'which' command on Unix-like systems
        else:
            return subprocess.check_output(["which", "node"]).decode().strip()

    except subprocess.CalledProcessError:
        # Command failed, fall back to checking common install locations
        pass

    # Check common install locations
    common_paths = [
        sys.executable,
        "/usr/bin/node",
        "/usr/local/bin/node",
        "C:\\Program Files\\nodejs\\node.exe",
        "C:\\Program Files (x86)\\nodejs\\node.exe",
    ]

    for node_path in common_paths:
        if os.path.exists(node_path):
            return node_path

    # Check PATH environment variable
    env_path = os.environ.get("PATH", "")
    path_dirs = env_path.split(os.pathsep)

    for directory in path_dirs:
        full_path = os.path.join(
            directory, "node.exe" if sys.platform == "win32" else "node"
        )
        if os.path.exists(full_path):
            return full_path

    print("Unable to find node install path, falling back to SPA mode.")
    print(
        "If you wish to use the node backend, please install node 20 and/ or set the path with the GRADIO_NODE_PATH environment variable."
    )
    return None


def none_or_singleton_to_list(value: Any) -> list:
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]

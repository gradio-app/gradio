""" Handy utility functions."""

from __future__ import annotations

import asyncio
import copy
import inspect
import json
import json.decoder
import os
import pkgutil
import random
import warnings
from contextlib import contextmanager
from distutils.version import StrictVersion
from enum import Enum
from numbers import Number
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Dict,
    Generator,
    List,
    NewType,
    Tuple,
    Type,
)

import aiohttp
import fsspec.asyn
import httpx
import requests
from pydantic import BaseModel, Json, parse_obj_as

import gradio

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.blocks import BlockContext
    from gradio.components import Component

analytics_url = "https://api.gradio.app/"
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"
JSON_PATH = os.path.join(os.path.dirname(gradio.__file__), "launches.json")


def version_check():
    try:
        current_pkg_version = (
            pkgutil.get_data(__name__, "version.txt").decode("ascii").strip()
        )
        latest_pkg_version = requests.get(url=PKG_VERSION_URL).json()["version"]
        if StrictVersion(latest_pkg_version) > StrictVersion(current_pkg_version):
            print(
                "IMPORTANT: You are using gradio version {}, "
                "however version {} "
                "is available, please upgrade.".format(
                    current_pkg_version, latest_pkg_version
                )
            )
            print("--------")
    except json.decoder.JSONDecodeError:
        warnings.warn("unable to parse version details from package URL.")
    except KeyError:
        warnings.warn("package URL does not contain version info.")
    except:
        pass


def get_local_ip_address() -> str:
    try:
        ip_address = requests.get("https://api.ipify.org", timeout=3).text
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        ip_address = "No internet connection"
    return ip_address


def initiated_analytics(data: Dict[str:Any]) -> None:
    try:
        requests.post(
            analytics_url + "gradio-initiated-analytics/", data=data, timeout=3
        )
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def launch_analytics(data: Dict[str, Any]) -> None:
    try:
        requests.post(
            analytics_url + "gradio-launched-analytics/", data=data, timeout=3
        )
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def integration_analytics(data: Dict[str, Any]) -> None:
    try:
        requests.post(
            analytics_url + "gradio-integration-analytics/", data=data, timeout=3
        )
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def error_analytics(ip_address: str, message: str) -> None:
    """
    Send error analytics if there is network
    :param type: RuntimeError or NameError
    """
    data = {"ip_address": ip_address, "error": message}
    try:
        requests.post(analytics_url + "gradio-error-analytics/", data=data, timeout=3)
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


async def log_feature_analytics(ip_address: str, feature: str) -> None:
    data = {"ip_address": ip_address, "feature": feature}
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                analytics_url + "gradio-feature-analytics/", data=data
            ):
                pass
        except (aiohttp.ClientError):
            pass  # do not push analytics if no network


def colab_check() -> bool:
    """
    Check if interface is launching from Google Colab
    :return is_colab (bool): True or False
    """
    is_colab = False
    try:  # Check if running interactively using ipython.
        from IPython import get_ipython

        from_ipynb = get_ipython()
        if "google.colab" in str(from_ipynb):
            is_colab = True
    except (ImportError, NameError):
        pass
    return is_colab


def ipython_check() -> bool:
    """
    Check if interface is launching from iPython (not colab)
    :return is_ipython (bool): True or False
    """
    is_ipython = False
    try:  # Check if running interactively using ipython.
        from IPython import get_ipython

        if get_ipython() is not None:
            is_ipython = True
    except (ImportError, NameError):
        pass
    return is_ipython


def readme_to_html(article: str) -> str:
    try:
        response = requests.get(article, timeout=3)
        if response.status_code == requests.codes.ok:  # pylint: disable=no-member
            article = response.text
    except requests.exceptions.RequestException:
        pass
    return article


def show_tip(interface: gradio.Blocks) -> None:
    if interface.show_tips and random.random() < 1.5:
        tip: str = random.choice(gradio.strings.en["TIPS"])
        print(f"Tip: {tip}")


def launch_counter() -> None:
    try:
        if not os.path.exists(JSON_PATH):
            launches = {"launches": 1}
            with open(JSON_PATH, "w+") as j:
                json.dump(launches, j)
        else:
            with open(JSON_PATH) as j:
                launches = json.load(j)
            launches["launches"] += 1
            if launches["launches"] in [25, 50, 150, 500, 1000]:
                print(gradio.strings.en["BETA_INVITE"])
            with open(JSON_PATH, "w") as j:
                j.write(json.dumps(launches))
    except:
        pass


def get_default_args(func: Callable) -> List[Any]:
    signature = inspect.signature(func)
    return [
        v.default if v.default is not inspect.Parameter.empty else None
        for v in signature.parameters.values()
    ]


def assert_configs_are_equivalent_besides_ids(
    config1: Dict, config2: Dict, root_keys: Tuple = ("mode", "theme")
):
    """Allows you to test if two different Blocks configs produce the same demo.

    Parameters:
    config1 (dict): nested dict with config from the first Blocks instance
    config2 (dict): nested dict with config from the second Blocks instance
    root_keys (Tuple): an interable consisting of which keys to test for equivalence at
        the root level of the config. By default, only "mode" and "theme" are tested,
        so keys like "version" are ignored.
    """
    config1 = copy.deepcopy(config1)
    config2 = copy.deepcopy(config2)

    for key in root_keys:
        assert config1[key] == config2[key], f"Configs have different: {key}"

    assert len(config1["components"]) == len(
        config2["components"]
    ), "# of components are different"

    def assert_same_components(config1_id, config2_id):
        c1 = list(filter(lambda c: c["id"] == config1_id, config1["components"]))[0]
        c2 = list(filter(lambda c: c["id"] == config2_id, config2["components"]))[0]
        c1 = copy.deepcopy(c1)
        c1.pop("id")
        c2 = copy.deepcopy(c2)
        c2.pop("id")
        assert c1 == c2, f"{c1} does not match {c2}"

    def same_children_recursive(children1, chidren2):
        for child1, child2 in zip(children1, chidren2):
            assert_same_components(child1["id"], child2["id"])
            if "children" in child1 or "children" in child2:
                same_children_recursive(child1["children"], child2["children"])

    children1 = config1["layout"]["children"]
    children2 = config2["layout"]["children"]
    same_children_recursive(children1, children2)

    for d1, d2 in zip(config1["dependencies"], config2["dependencies"]):
        for t1, t2 in zip(d1.pop("targets"), d2.pop("targets")):
            assert_same_components(t1, t2)
        for i1, i2 in zip(d1.pop("inputs"), d2.pop("inputs")):
            assert_same_components(i1, i2)
        for o1, o2 in zip(d1.pop("outputs"), d2.pop("outputs")):
            assert_same_components(o1, o2)

        assert d1 == d2, f"{d1} does not match {d2}"

    return True


def format_ner_list(input_string: str, ner_groups: Dict[str : str | int]):
    if len(ner_groups) == 0:
        return [(input_string, None)]

    output = []
    prev_end = 0

    for group in ner_groups:
        entity, start, end = group["entity_group"], group["start"], group["end"]
        output.append((input_string[prev_end:start], None))
        output.append((input_string[start:end], entity))
        prev_end = end

    output.append((input_string[end:], None))
    return output


def delete_none(_dict, skip_value=False):
    """
    Delete None values recursively from all of the dictionaries, tuples, lists, sets.
    Credit: https://stackoverflow.com/a/66127889/5209347
    """
    if isinstance(_dict, dict):
        for key, value in list(_dict.items()):
            if skip_value and key == "value":
                continue
            if isinstance(value, (list, dict, tuple, set)):
                _dict[key] = delete_none(value)
            elif value is None or key is None:
                del _dict[key]

    elif isinstance(_dict, (list, set, tuple)):
        _dict = type(_dict)(delete_none(item) for item in _dict if item is not None)

    return _dict


def resolve_singleton(_list: List[Any] | Any) -> Any:
    if len(_list) == 1:
        return _list[0]
    else:
        return _list


def component_or_layout_class(cls_name: str) -> Component | BlockContext:
    """
    Returns the component, template, or layout class with the given class name, or
    raises a ValueError if not found.

    Parameters:
    cls_name (str): lower-case string class name of a component
    Returns:
    cls: the component class
    """
    import gradio.components
    import gradio.layouts
    import gradio.templates

    components = [
        (name, cls)
        for name, cls in gradio.components.__dict__.items()
        if isinstance(cls, type)
    ]
    templates = [
        (name, cls)
        for name, cls in gradio.templates.__dict__.items()
        if isinstance(cls, type)
    ]
    layouts = [
        (name, cls)
        for name, cls in gradio.layouts.__dict__.items()
        if isinstance(cls, type)
    ]
    for name, cls in components + templates + layouts:
        if name.lower() == cls_name.replace("_", "") and (
            issubclass(cls, gradio.components.Component)
            or issubclass(cls, gradio.blocks.BlockContext)
        ):
            return cls
    raise ValueError(f"No such component or layout: {cls_name}")


def synchronize_async(func: Callable, *args, **kwargs):
    """
    Runs async functions in sync scopes.

    Can be used in any scope. See run_coro_in_background for more details.

    Example:
        if inspect.iscoroutinefunction(block_fn.fn):
            predictions = utils.synchronize_async(block_fn.fn, *processed_input)

    Args:
        func:
        *args:
        **kwargs:
    """
    return fsspec.asyn.sync(fsspec.asyn.get_loop(), func, *args, **kwargs)


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


def async_iteration(iterator):
    try:
        return next(iterator)
    except StopIteration:
        # raise a ValueError here because co-routines can't raise StopIteration themselves
        raise StopAsyncIteration()


class Request:
    """
    The Request class is a low-level API that allow you to create asynchronous HTTP requests without a context manager.
    Compared to making calls by using httpx directly, Request offers more flexibility and control over:
        (1) Includes response validation functionality both using validation models and functions.
        (2) Since we're still using httpx.Request class by wrapping it, we have all it's functionalities.
        (3) Exceptions are handled silently during the request call, which gives us the ability to inspect each one
        individually in the case of multiple asynchronous request calls and some of them failing.
        (4) Provides HTTP request types with Request.Method Enum class for ease of usage
    Request also offers some util functions such as has_exception, is_valid and status to inspect get detailed
    information about executed request call.

    The basic usage of Request is as follows: create a Request object with inputs(method, url etc.). Then use it
    with the "await" statement, and then you can use util functions to do some post request checks depending on your use-case.
    Finally, call the get_validated_data function to get the response data.

    You can see example usages in test_utils.py.
    """

    ResponseJson = NewType("ResponseJson", Json)
    client = httpx.AsyncClient()

    class Method(str, Enum):
        """
        Method is an enumeration class that contains possible types of HTTP request methods.
        """

        ANY = "*"
        CONNECT = "CONNECT"
        HEAD = "HEAD"
        GET = "GET"
        DELETE = "DELETE"
        OPTIONS = "OPTIONS"
        PATCH = "PATCH"
        POST = "POST"
        PUT = "PUT"
        TRACE = "TRACE"

    def __init__(
        self,
        method: Method,
        url: str,
        *,
        validation_model: Type[BaseModel] = None,
        validation_function: Callable = None,
        exception_type: Type[Exception] = Exception,
        raise_for_status: bool = False,
        **kwargs,
    ):
        """
        Initialize the Request instance.
        Args:
            method(Request.Method) : method of the request
            url(str): url of the request
            *
            validation_model(Type[BaseModel]): a pydantic validation class type to use in validation of the response
            validation_function(Callable): a callable instance to use in validation of the response
            exception_class(Type[Exception]): a exception type to throw with its type
            raise_for_status(bool): a flag that determines to raise httpx.Request.raise_for_status() exceptions.
        """
        self._response = None
        self._exception = None
        self._status = None
        self._raise_for_status = raise_for_status
        self._validation_model = validation_model
        self._validation_function = validation_function
        self._exception_type = exception_type
        self._validated_data = None
        # Create request
        self._request = self._create_request(method, url, **kwargs)

    def __await__(self) -> Generator[None, Any, "Request"]:
        """
        Wrap Request's __await__ magic function to create request calls which are executed in one line.
        """
        return self.__run().__await__()

    async def __run(self) -> Request:
        """
        Manage the request call lifecycle.
        Execute the request by sending it through the client, then check its status.
        Then parse the request into Json format. And then validate it using the provided validation methods.
        If a problem occurs in this sequential process,
        an exception will be raised within the corresponding method, and allowed to be examined.
        Manage the request call lifecycle.

        Returns:
            Request
        """
        try:
            # Send the request and get the response.
            self._response: httpx.Response = await Request.client.send(self._request)
            # Raise for _status
            self._status = self._response.status_code
            if self._raise_for_status:
                self._response.raise_for_status()
            # Parse client response data to JSON
            self._json_response_data = self._response.json()
            # Validate response data
            self._validated_data = self._validate_response_data(
                self._json_response_data
            )
        except Exception as exception:
            # If there is an exception, store it to do further inspections.
            self._exception = self._exception_type(exception)
        return self

    @staticmethod
    def _create_request(method: Method, url: str, **kwargs) -> Request:
        """
        Create a request. This is a httpx request wrapper function.
        Args:
            method(Request.Method): request method type
            url(str): target url of the request
            **kwargs
        Returns:
            Request
        """
        request = httpx.Request(method, url, **kwargs)
        return request

    def _validate_response_data(self, response: ResponseJson) -> ResponseJson:
        """
        Validate response using given validation methods. If there is a validation method and response is not valid,
        validation functions will raise an exception for them.
        Args:
            response(ResponseJson): response object
        Returns:
            ResponseJson: Validated Json object.
        """

        # We use raw response as a default value if there is no validation method or response is not valid.
        validated_response = response

        try:
            # If a validation model is provided, validate response using the validation model.
            if self._validation_model:
                validated_response = self._validate_response_by_model(
                    validated_response
                )
            # Then, If a validation function is provided, validate response using the validation function.
            if self._validation_function:
                validated_response = self._validate_response_by_validation_function(
                    validated_response
                )
        except Exception as exception:
            # If one of the validation methods does not confirm, raised exception will be silently handled.
            # We assign this exception to classes instance to do further inspections via is_valid function.
            self._exception = exception

        return validated_response

    def _validate_response_by_model(self, response: ResponseJson) -> ResponseJson:
        """
        Validate response json using the validation model.
        Args:
            response(ResponseJson): response object
        Returns:
            ResponseJson: Validated Json object.
        """
        validated_data = parse_obj_as(self._validation_model, response)
        return validated_data

    def _validate_response_by_validation_function(
        self, response: ResponseJson
    ) -> ResponseJson:
        """
        Validate response json using the validation function.
        Args:
            response(ResponseJson): response object
        Returns:
            ResponseJson: Validated Json object.
        """
        validated_data = self._validation_function(response)
        return validated_data

    def is_valid(self, raise_exceptions: bool = False) -> bool:
        """
        Check response object's validity+. Raise exceptions if raise_exceptions flag is True.
        Args:
            raise_exceptions(bool) : a flag to raise exceptions in this check
        Returns:
            bool: validity of the data
        """
        if self.has_exception:
            if raise_exceptions:
                raise self._exception
            return False
        else:
            # If there is no exception, that means there is no validation error.
            return True

    def get_validated_data(self):
        return self._validated_data

    @property
    def json(self):
        return self._json_response_data

    @property
    def exception(self):
        return self._exception

    @property
    def has_exception(self):
        return self.exception is not None

    @property
    def raise_exceptions(self):
        if self.has_exception:
            raise self._exception

    @property
    def status(self):
        return self._status


@contextmanager
def set_directory(path: Path):
    """Context manager that sets the working directory to the given path."""
    origin = Path().absolute()
    try:
        os.chdir(path)
        yield
    finally:
        os.chdir(origin)


def strip_invalid_filename_characters(filename: str, max_size: int = 200) -> str:
    return ("".join([char for char in filename if char.isalnum() or char in "._- "]))[
        :max_size
    ]


def sanitize_value_for_csv(value: str | Number) -> str | Number:
    """
    Sanitizes a value that is being written to a CSV file to prevent CSV injection attacks.
    Reference: https://owasp.org/www-community/attacks/CSV_Injection
    """
    if isinstance(value, Number):
        return value
    unsafe_prefixes = ["=", "+", "-", "@", "\t", "\n"]
    unsafe_sequences = [",=", ",+", ",-", ",@", ",\t", ",\n"]
    if any(value.startswith(prefix) for prefix in unsafe_prefixes) or any(
        sequence in value for sequence in unsafe_sequences
    ):
        value = "'" + value
    return value


def sanitize_list_for_csv(
    values: List[str | Number] | List[List[str | Number]],
) -> List[str | Number] | List[List[str | Number]]:
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


def append_unique_suffix(name: str, list_of_names: List[str]):
    """Appends a numerical suffix to `name` so that it does not appear in `list_of_names`."""
    list_of_names = set(list_of_names)  # for O(1) lookup
    if name not in list_of_names:
        return name
    else:
        suffix_counter = 1
        new_name = name + f"_{suffix_counter}"
        while new_name in list_of_names:
            suffix_counter += 1
            new_name = name + f"_{suffix_counter}"
        return new_name


def validate_url(possible_url: str) -> bool:
    try:
        if requests.get(possible_url).status_code == 200:
            return True
    except Exception:
        pass
    return False


def is_update(val):
    return type(val) is dict and "update" in val.get("__type__", "")

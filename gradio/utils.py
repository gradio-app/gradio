""" Handy utility functions."""

from __future__ import annotations

import copy
import csv
import inspect
import json
import json.decoder
import os
import random
import warnings
from copy import deepcopy
from distutils.version import StrictVersion
from typing import TYPE_CHECKING, Any, Callable, Dict, List

import aiohttp
import analytics
import pkg_resources
import requests

import gradio

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio import Interface

analytics_url = "https://api.gradio.app/"
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"
analytics.write_key = "uxIFddIEuuUcFLf9VgH2teTEtPlWdkNy"
JSON_PATH = os.path.join(os.path.dirname(gradio.__file__), "launches.json")


def version_check():
    try:
        current_pkg_version = pkg_resources.require("gradio")[0].version
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
    except pkg_resources.DistributionNotFound:
        warnings.warn(
            "gradio is not setup or installed properly. Unable to get version info."
        )
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


def show_tip(interface: Interface) -> None:
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
            if launches["launches"] in [25, 50]:
                print(gradio.strings.en["BETA_INVITE"])
            with open(JSON_PATH, "w") as j:
                j.write(json.dumps(launches))
    except:
        pass


def get_config_file(interface: Interface) -> Dict[str, Any]:
    config = {
        "input_components": [
            iface.get_template_context() for iface in interface.input_components
        ],
        "output_components": [
            iface.get_template_context() for iface in interface.output_components
        ],
        "function_count": len(interface.predict),
        "live": interface.live,
        "examples_per_page": interface.examples_per_page,
        "layout": interface.layout,
        "show_input": interface.show_input,
        "show_output": interface.show_output,
        "title": interface.title,
        "analytics_enabled": interface.analytics_enabled,
        "description": interface.description,
        "simple_description": interface.simple_description,
        "article": interface.article,
        "theme": interface.theme,
        "css": interface.css,
        "thumbnail": interface.thumbnail,
        "allow_screenshot": interface.allow_screenshot,
        "allow_flagging": interface.allow_flagging,
        "flagging_options": interface.flagging_options,
        "allow_interpretation": interface.interpretation is not None,
        "queue": interface.enable_queue,
        "cached_examples": interface.cache_examples
        if hasattr(interface, "cache_examples")
        else False,
        "version": pkg_resources.require("gradio")[0].version,
        "favicon_path": interface.favicon_path,
    }
    try:
        param_names = inspect.getfullargspec(interface.predict[0])[0]
        for index, component in enumerate(config["input_components"]):
            if not component["label"]:
                if index < len(param_names):
                    component["label"] = param_names[index].replace("_", " ")
                else:
                    component["label"] = (
                        f"input {index + 1}"
                        if len(config["input_components"]) > 1
                        else "input"
                    )
        for index, component in enumerate(config["output_components"]):
            outputs_per_function = int(
                len(interface.output_components) / len(interface.predict)
            )
            function_index = index // outputs_per_function
            component_index = index - function_index * outputs_per_function
            if component["label"] is None:
                component["label"] = (
                    f"output {component_index + 1}"
                    if outputs_per_function > 1
                    else "output"
                )
            if len(interface.predict) > 1:
                component["label"] = (
                    interface.function_names[function_index].replace("_", " ")
                    + ": "
                    + component["label"]
                )
    except ValueError:
        pass
    if interface.examples is not None:
        if isinstance(interface.examples, str):
            if not os.path.exists(interface.examples):
                raise FileNotFoundError(
                    "Could not find examples directory: " + interface.examples
                )
            log_file = os.path.join(interface.examples, "log.csv")
            if not os.path.exists(log_file):
                if len(interface.input_components) == 1:
                    examples = [
                        [os.path.join(interface.examples, item)]
                        for item in os.listdir(interface.examples)
                    ]
                else:
                    raise FileNotFoundError(
                        "Could not find log file (required for multiple inputs): "
                        + log_file
                    )
            else:
                with open(log_file) as logs:
                    examples = list(csv.reader(logs))
                    examples = examples[1:]  # remove header
            for i, example in enumerate(examples):
                for j, (component, cell) in enumerate(
                    zip(
                        interface.input_components + interface.output_components,
                        example,
                    )
                ):
                    examples[i][j] = component.restore_flagged(
                        interface.flagging_dir,
                        cell,
                        interface.encryption_key if interface.encrypt else None,
                    )
            config["examples"] = examples
            config["examples_dir"] = interface.examples
        else:
            config["examples"] = interface.examples
    return config


def get_default_args(func: Callable) -> Dict[str, Any]:
    signature = inspect.signature(func)
    return [
        v.default if v.default is not inspect.Parameter.empty else None
        for v in signature.parameters.values()
    ]


def assert_configs_are_equivalent_besides_ids(config1, config2):
    """Allows you to test if two different Blocks configs produce the same demo."""
    assert config1["mode"] == config2["mode"], "Modes are different"
    assert config1["theme"] == config2["theme"], "Themes are different"
    assert len(config1["components"]) == len(
        config2["components"]
    ), "# of components are different"

    mapping = {}

    for c1, c2 in zip(config1["components"], config2["components"]):
        c1, c2 = deepcopy(c1), deepcopy(c2)
        mapping[c1["id"]] = c2["id"]
        c1.pop("id")
        c2.pop("id")
        assert c1 == c2, "{} does not match {}".format(c1, c2)

    def same_children_recursive(children1, chidren2, mapping):
        for child1, child2 in zip(children1, chidren2):
            assert mapping[child1["id"]] == child2["id"], "{} does not match {}".format(
                child1, child2
            )
            if "children" in child1 or "children" in child2:
                same_children_recursive(child1["children"], child2["children"], mapping)

    children1 = config1["layout"]["children"]
    children2 = config2["layout"]["children"]
    same_children_recursive(children1, children2, mapping)

    for d1, d2 in zip(config1["dependencies"], config2["dependencies"]):
        for t1, t2 in zip(d1["targets"], d2["targets"]):
            assert mapping[t1] == t2, "{} does not match {}".format(d1, d2)
        assert d1["trigger"] == d2["trigger"], "{} does not match {}".format(d1, d2)
        for i1, i2 in zip(d1["inputs"], d2["inputs"]):
            assert mapping[i1] == i2, "{} does not match {}".format(d1, d2)
        for o1, o2 in zip(d1["outputs"], d2["outputs"]):
            assert mapping[o1] == o2, "{} does not match {}".format(d1, d2)

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


def delete_none(_dict):
    """
    Delete None values recursively from all of the dictionaries, tuples, lists, sets.
    Credit: https://stackoverflow.com/questions/33797126/proper-way-to-remove-keys-in-dictionary-with-none-values-in-python
    """
    if isinstance(_dict, dict):
        for key, value in list(_dict.items()):
            if isinstance(value, (list, dict, tuple, set)):
                _dict[key] = delete_none(value)
            elif value is None or key is None:
                del _dict[key]

    elif isinstance(_dict, (list, set, tuple)):
        _dict = type(_dict)(delete_none(item) for item in _dict if item is not None)

    return _dict

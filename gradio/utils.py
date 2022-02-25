""" Handy utility functions."""

from __future__ import annotations

import csv
import inspect
import json
import json.decoder
import os
import random
import warnings
from distutils.version import StrictVersion
from typing import TYPE_CHECKING, Any, Callable, Dict

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
        for iface, param in zip(config["input_components"], param_names):
            if not iface["label"]:
                iface["label"] = param.replace("_", " ")
        for i, iface in enumerate(config["output_components"]):
            outputs_per_function = int(
                len(interface.output_components) / len(interface.predict)
            )
            function_index = i // outputs_per_function
            component_index = i - function_index * outputs_per_function
            ret_name = (
                "Output " + str(component_index + 1)
                if outputs_per_function > 1
                else "Output"
            )
            if iface["label"] is None:
                iface["label"] = ret_name
            if len(interface.predict) > 1:
                iface["label"] = (
                    interface.function_names[function_index].replace("_", " ")
                    + ": "
                    + iface["label"]
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

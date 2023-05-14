from __future__ import annotations

import json
import pkgutil
import threading
import warnings
from distutils.version import StrictVersion
from typing import Any

import aiohttp
import requests

import gradio
from gradio.context import Context
from gradio.utils import GRADIO_VERSION

ANALYTICS_URL = "https://api.gradio.app/"
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"


def version_check():
    try:
        version_data = pkgutil.get_data(__name__, "version.txt")
        if not version_data:
            raise FileNotFoundError
        current_pkg_version = version_data.decode("ascii").strip()
        latest_pkg_version = requests.get(url=PKG_VERSION_URL, timeout=3).json()[
            "version"
        ]
        if StrictVersion(latest_pkg_version) > StrictVersion(current_pkg_version):
            print(
                f"IMPORTANT: You are using gradio version {current_pkg_version}, "
                f"however version {latest_pkg_version} is available, please upgrade."
            )
            print("--------")
    except json.decoder.JSONDecodeError:
        warnings.warn("unable to parse version details from package URL.")
    except KeyError:
        warnings.warn("package URL does not contain version info.")
    except Exception:
        pass


def get_local_ip_address() -> str:
    """Gets the public IP address or returns the string "No internet connection" if unable to obtain it. Does not make a new request if the IP address has already been obtained."""
    if Context.ip_address is None:
        try:
            ip_address = requests.get(
                "https://checkip.amazonaws.com/", timeout=3
            ).text.strip()
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            ip_address = "No internet connection"
        Context.ip_address = ip_address
    else:
        ip_address = Context.ip_address
    return ip_address


def initiated_analytics(data: dict[str, Any]) -> None:
    data.update({"ip_address": get_local_ip_address()})

    def initiated_analytics_thread(data: dict[str, Any]) -> None:
        try:
            requests.post(
                f"{ANALYTICS_URL}gradio-initiated-analytics/", data=data, timeout=5
            )
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network

    threading.Thread(target=initiated_analytics_thread, args=(data,)).start()


def launch_analytics(data: dict[str, Any]) -> None:
    data.update({"ip_address": get_local_ip_address()})

    def launch_analytics_thread(data: dict[str, Any]) -> None:
        try:
            requests.post(
                f"{ANALYTICS_URL}gradio-launched-analytics/", data=data, timeout=5
            )
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network

    threading.Thread(target=launch_analytics_thread, args=(data,)).start()


def launched_telemetry(blocks: gradio.Blocks, data: dict[str, Any]) -> None:
    blocks_telemetry, inputs_telemetry, outputs_telemetry, targets_telemetry = (
        [],
        [],
        [],
        [],
    )

    from gradio.blocks import BlockContext

    for x in list(blocks.blocks.values()):
        blocks_telemetry.append(x.get_block_name()) if isinstance(
            x, BlockContext
        ) else blocks_telemetry.append(str(x))

    for x in blocks.dependencies:
        targets_telemetry = targets_telemetry + [
            str(blocks.blocks[y]) for y in x["targets"]
        ]
        inputs_telemetry = inputs_telemetry + [
            str(blocks.blocks[y]) for y in x["inputs"]
        ]
        outputs_telemetry = outputs_telemetry + [
            str(blocks.blocks[y]) for y in x["outputs"]
        ]
    additional_data = {
        "version": GRADIO_VERSION,
        "is_kaggle": blocks.is_kaggle,
        "is_sagemaker": blocks.is_sagemaker,
        "using_auth": blocks.auth is not None,
        "dev_mode": blocks.dev_mode,
        "show_api": blocks.show_api,
        "show_error": blocks.show_error,
        "title": blocks.title,
        "inputs": blocks.input_components
        if blocks.mode == "interface"
        else inputs_telemetry,
        "outputs": blocks.output_components
        if blocks.mode == "interface"
        else outputs_telemetry,
        "targets": targets_telemetry,
        "blocks": blocks_telemetry,
        "events": [str(x["trigger"]) for x in blocks.dependencies],
    }

    data.update(additional_data)
    data.update({"ip_address": get_local_ip_address()})

    def launched_telemtry_thread(data: dict[str, Any]) -> None:
        try:
            requests.post(
                f"{ANALYTICS_URL}gradio-launched-telemetry/", data=data, timeout=5
            )
        except Exception:
            pass

    threading.Thread(target=launched_telemtry_thread, args=(data,)).start()


def integration_analytics(data: dict[str, Any]) -> None:
    data.update({"ip_address": get_local_ip_address()})

    def integration_analytics_thread(data: dict[str, Any]) -> None:
        try:
            requests.post(
                f"{ANALYTICS_URL}gradio-integration-analytics/", data=data, timeout=5
            )
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network

    threading.Thread(target=integration_analytics_thread, args=(data,)).start()


def error_analytics(message: str) -> None:
    """
    Send error analytics if there is network
    Parameters:
        message: Details about error
    """
    data = {"ip_address": get_local_ip_address(), "error": message}

    def error_analytics_thread(data: dict[str, Any]) -> None:
        try:
            requests.post(
                f"{ANALYTICS_URL}gradio-error-analytics/", data=data, timeout=5
            )
        except (requests.ConnectionError, requests.exceptions.ReadTimeout):
            pass  # do not push analytics if no network

    threading.Thread(target=error_analytics_thread, args=(data,)).start()


async def log_feature_analytics(feature: str) -> None:
    data = {"ip_address": get_local_ip_address(), "feature": feature}
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{ANALYTICS_URL}gradio-feature-analytics/", data=data
            ):
                pass
        except (aiohttp.ClientError):
            pass  # do not push analytics if no network

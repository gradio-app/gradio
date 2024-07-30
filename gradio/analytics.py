"""Functions related to analytics and telemetry."""

from __future__ import annotations

import asyncio
import json
import os
import threading
import urllib.parse
import warnings
from typing import Any

import httpx
from huggingface_hub.utils._telemetry import _send_telemetry_in_thread
from packaging.version import Version

import gradio
from gradio import wasm_utils
from gradio.context import Context
from gradio.utils import core_gradio_components, get_package_version

# For testability, we import the pyfetch function into this module scope and define a fallback coroutine object to be patched in tests.
try:
    from pyodide.http import pyfetch as pyodide_pyfetch  # type: ignore
except ImportError:

    async def pyodide_pyfetch(*_args, **_kwargs):
        raise NotImplementedError(
            "pyodide.http.pyfetch is not available in this environment."
        )


ANALYTICS_URL = "https://api.gradio.app/"
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"


def get_block_name(class_name) -> str:
    """
    This will return "matrix" for Matrix template, and ensures that any component name that is sent from the gradio app is part of the the core components list (no false positives for custom components).
    """
    return class_name.__name__.lower()


def analytics_enabled() -> bool:
    """
    Returns: True if analytics are enabled, False otherwise.
    """
    return os.getenv("GRADIO_ANALYTICS_ENABLED", "True") == "True"


def _do_analytics_request(topic: str, data: dict[str, Any]) -> None:
    if wasm_utils.IS_WASM:
        asyncio.ensure_future(
            _do_wasm_analytics_request(
                url=topic,
                data=data,
            )
        )
    else:
        threading.Thread(
            target=_do_normal_analytics_request,
            kwargs={
                "topic": topic,
                "data": data,
            },
        ).start()


def _do_normal_analytics_request(topic: str, data: dict[str, Any]) -> None:
    data["ip_address"] = get_local_ip_address()
    try:
        _send_telemetry_in_thread(
            topic=topic,
            library_name="gradio",
            library_version=data.get("version"),
            user_agent=data,
        )
    except Exception:
        pass


async def _do_wasm_analytics_request(url: str, data: dict[str, Any]) -> None:
    data["ip_address"] = await get_local_ip_address_wasm()

    # We use urllib.parse.urlencode to encode the data as a form.
    # Ref: https://docs.python.org/3/library/urllib.request.html#urllib-examples
    body = urllib.parse.urlencode(data).encode("ascii")
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }

    try:
        await asyncio.wait_for(
            pyodide_pyfetch(url, method="POST", headers=headers, body=body),
            timeout=5,
        )
    except asyncio.TimeoutError:
        pass  # do not push analytics if no network


def version_check():
    try:
        current_pkg_version = get_package_version()
        latest_pkg_version = httpx.get(url=PKG_VERSION_URL, timeout=3).json()["version"]
        if Version(latest_pkg_version) > Version(current_pkg_version):
            warnings.warn(
                f"IMPORTANT: You are using gradio version {current_pkg_version}, "
                f"however version {latest_pkg_version} is available, please upgrade. \n"
                f"--------"
            )
    except json.decoder.JSONDecodeError:
        warnings.warn("unable to parse version details from package URL.")
    except KeyError:
        warnings.warn("package URL does not contain version info.")
    except Exception:
        pass


def get_local_ip_address() -> str:
    """
    Gets the public IP address or returns the string "No internet connection" if unable
    to obtain it or the string "Analytics disabled" if a user has disabled analytics.
    Does not make a new request if the IP address has already been obtained in the
    same Python session.
    """
    if not analytics_enabled():
        return "Analytics disabled"

    if Context.ip_address is None:
        try:
            ip_address = httpx.get(
                "https://checkip.amazonaws.com/", timeout=3
            ).text.strip()
        except (httpx.ConnectError, httpx.ReadTimeout):
            ip_address = "No internet connection"
        Context.ip_address = ip_address
    else:
        ip_address = Context.ip_address
    return ip_address


async def get_local_ip_address_wasm() -> str:
    """The Wasm-compatible version of get_local_ip_address()."""
    if not analytics_enabled():
        return "Analytics disabled"

    if Context.ip_address is None:
        try:
            response = await asyncio.wait_for(
                pyodide_pyfetch(
                    # The API used by the normal version (`get_local_ip_address()`), `https://checkip.amazonaws.com/``, blocks CORS requests, so here we use a different API.
                    "https://api.ipify.org"
                ),
                timeout=5,
            )
            response_text: str = await response.string()  # type: ignore
            ip_address = response_text.strip()
        except (asyncio.TimeoutError, OSError):
            ip_address = "No internet connection"
        Context.ip_address = ip_address
    else:
        ip_address = Context.ip_address
    return ip_address


def initiated_analytics(data: dict[str, Any]) -> None:
    if not analytics_enabled():
        return

    topic = (
        "gradio/initiated"
        if not wasm_utils.IS_WASM
        else f"{ANALYTICS_URL}gradio-initiated-analytics/"
    )
    _do_analytics_request(
        topic=topic,
        data=data,
    )


def launched_analytics(blocks: gradio.Blocks, data: dict[str, Any]) -> None:
    if not analytics_enabled():
        return

    (
        blocks_telemetry,
        inputs_telemetry,
        outputs_telemetry,
        targets_telemetry,
        events_telemetry,
    ) = (
        [],
        [],
        [],
        [],
        [],
    )

    for x in list(blocks.blocks.values()):
        blocks_telemetry.append(x.get_block_name())
    for x in blocks.fns.values():
        targets_telemetry = targets_telemetry + [
            # Sometimes the target can be the Blocks object itself, so we need to check if its in blocks.blocks
            blocks.blocks[y[0]].get_block_name()
            for y in x.targets
            if y[0] in blocks.blocks
        ]
        events_telemetry = events_telemetry + [
            y[1] for y in x.targets if y[0] in blocks.blocks
        ]
        inputs_telemetry = inputs_telemetry + [
            blocks.blocks[y].get_block_name() for y in x.inputs if y in blocks.blocks
        ]
        outputs_telemetry = outputs_telemetry + [
            blocks.blocks[y].get_block_name() for y in x.outputs if y in blocks.blocks
        ]

    def get_inputs_outputs(
        mode: str,
        components: list[gradio.components.Component] | None,
        fallback: list[str],
    ) -> list[str] | None:
        if mode == "interface":
            return [b.get_block_name() for b in components] if components else None
        return fallback

    core_components = [get_block_name(c) for c in core_gradio_components()]

    additional_data = {
        "version": get_package_version(),
        "is_kaggle": blocks.is_kaggle,
        "is_sagemaker": blocks.is_sagemaker,
        "using_auth": blocks.auth is not None,
        "dev_mode": blocks.dev_mode,
        "show_api": blocks.show_api,
        "show_error": blocks.show_error,
        "inputs": get_inputs_outputs(
            blocks.mode, blocks.input_components, inputs_telemetry
        ),
        "outputs": get_inputs_outputs(
            blocks.mode, blocks.output_components, outputs_telemetry
        ),
        "targets": targets_telemetry,
        "blocks": blocks_telemetry,
        "events": events_telemetry,
        "is_wasm": wasm_utils.IS_WASM,
    }
    custom_components = [b for b in blocks_telemetry if b not in core_components]
    using_custom_component = len(custom_components) > 0
    additional_data["using_custom_component"] = using_custom_component
    additional_data["custom_components"] = custom_components

    data.update(additional_data)

    topic = (
        "gradio/launched"
        if not wasm_utils.IS_WASM
        else f"{ANALYTICS_URL}gradio-launched-telemetry/"
    )

    _do_analytics_request(topic=topic, data=data)


def custom_component_analytics(
    command: str,
    template: str | None,
    upload_pypi: bool | None,
    upload_demo: bool | None,
    upload_source: bool | None,
    generate_docs: bool | None = None,
    bump_version: bool | None = None,
    npm_install: str | None = None,
    python_path: str | None = None,
    gradio_path: str | None = None,
) -> None:
    data = {
        "command": command,
        "template": template,
        "upload_pypi": upload_pypi,
        "upload_demo": upload_demo,
        "upload_source": upload_source,
        "generate_docs": generate_docs,
        "bump_version": bump_version,
        "npm_install": npm_install,
        "python_path": python_path,
        "gradio_path": gradio_path,
    }
    if not analytics_enabled():
        return

    _do_analytics_request(
        topic="gradio/custom-components",
        data=data,
    )


def integration_analytics(data: dict[str, Any]) -> None:
    if not analytics_enabled():
        return

    topic = (
        "gradio/integration"
        if not wasm_utils.IS_WASM
        else f"{ANALYTICS_URL}gradio-integration-analytics/"
    )
    _do_analytics_request(
        topic=topic,
        data=data,
    )


def error_analytics(message: str) -> None:
    """
    Send error analytics if there is network
    Parameters:
        message: Details about error
    """
    if not analytics_enabled():
        return

    data = {"error": message}
    topic = (
        "gradio/error"
        if not wasm_utils.IS_WASM
        else f"{ANALYTICS_URL}gradio-error-analytics/"
    )
    _do_analytics_request(
        topic=topic,
        data=data,
    )

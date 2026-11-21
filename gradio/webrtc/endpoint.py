"""Checks of a WebRTC stream's settings, and the queue event that runs each
stream (see `transport.transport_event`). Imports without the `webrtc` extra;
aiortc is imported once a stream event is added.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import TYPE_CHECKING, Any, Literal

from gradio import utils
from gradio.webrtc.utils import (
    is_async_generator,
)

if TYPE_CHECKING:
    from gradio.block_function import BlockFunction
    from gradio.blocks import BlocksConfig


def check_video_bitrate(video_bitrate: dict[str, int] | None) -> None:
    if video_bitrate is None:
        return
    keys = ("min", "start", "max")
    unknown = set(video_bitrate) - set(keys)
    if unknown:
        raise ValueError(f"video_bitrate takes the keys {keys}, got {sorted(unknown)}")
    for key, kbps in video_bitrate.items():
        if not isinstance(kbps, int) or isinstance(kbps, bool) or kbps <= 0:
            raise ValueError(
                f"video_bitrate[{key!r}] must be a positive int (kbps), got {kbps!r}"
            )
    given = [video_bitrate[key] for key in keys if key in video_bitrate]
    if given != sorted(given):
        raise ValueError(
            f'video_bitrate must have "min" <= "start" <= "max", got {video_bitrate}'
        )


def check_turn(rtc_configuration: Any, what: str) -> None:
    if is_async_generator(rtc_configuration):
        raise ValueError(
            f"The rtc_configuration function of {what} must return a dict, "
            "not yield one."
        )
    if (utils.get_space() or utils.colab_check()) and rtc_configuration is None:
        raise ValueError(
            f"{what} needs a TURN server on Hugging Face Spaces or Google "
            "Colab: the browser often cannot reach the app directly, and then "
            "the media has to be relayed. Pass `rtc_configuration=` with your "
            "ICE servers, or a function that returns them. Hugging Face "
            "accounts get a free monthly "
            "TURN quota through Cloudflare; on a public Space, issue the "
            "credentials with each visitor's own account (gr.OAuthToken) so "
            "that visitors do not use up yours. See the 'Deploying to Hugging "
            "Face Spaces' section of the WebRTC guide: "
            "https://www.gradio.app/guides/object-detection-from-webcam-with-webrtc"
        )


def add_stream_event(
    root_block: BlocksConfig,
    triggers: list,
    fn: Callable,
    inputs: list,
    outputs: list,
    *,
    time_limit: float | None,
    concurrency_limit: int | None | Literal["default"],
    trigger_mode: Literal["once", "multiple", "always_last"] = "multiple",
    **kwargs: Any,
) -> tuple[BlockFunction, int]:
    """
    Adds the queue event that runs each stream, a lease whose `fn` holds the
    streams' `ConnectionManager` (see `connection.stream_run`).
    """
    from gradio.webrtc import connection

    stream_fn, index = root_block.set_event_trigger(
        triggers,
        fn,
        inputs,
        outputs,
        concurrency_limit=concurrency_limit,
        trigger_mode=trigger_mode,
        connection="stream",
        time_limit=time_limit,
        **kwargs,
    )
    stream_fn.close_stream = connection.end_admitted_stream
    stream_fn.lease = True
    # Its function is a generator that runs the stream, not one sent chunks
    stream_fn.sends_to_generator = False
    return stream_fn, index

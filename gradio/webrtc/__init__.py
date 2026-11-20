"""The WebRTC transport of streams (`transport="webrtc"`).

Its settings are `gr.WebRTCOptions`; the handler classes and helpers that
stream functions use are in `gradio.streaming`. The modules that need aiortc
import it themselves, so this package imports without the `webrtc` extra.
"""

import importlib

WEBRTC_EXTRA_HINT = (
    'The `aiortc` package is required to stream over WebRTC (transport="webrtc"). '
    'Install it with the `webrtc` extra: pip install "gradio[webrtc]"'
)


def require_webrtc() -> None:
    """Imports the WebRTC connection module, or raises how to install the
    `webrtc` extra (aiortc, numpy) it needs, with the original error chained.
    It lives here, away from the modules that import numpy, so that the hint
    shows without numpy too."""
    try:
        importlib.import_module("gradio.webrtc.connection")
    except ImportError as e:
        raise ImportError(WEBRTC_EXTRA_HINT) from e

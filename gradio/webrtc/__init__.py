"""The WebRTC transport of streams (`transport="webrtc"`).

Its settings are `gr.WebRTCOptions`; the handler classes and helpers that
stream functions use are in `gradio.streaming`. The modules that need aiortc
import it themselves, so this package imports without the `webrtc` extra.
"""

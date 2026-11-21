"""A trimmed copy of pydub 0.25.1 (https://github.com/jiaaro/pydub, MIT license).

Only the parts Gradio uses are kept: loading audio (natively for wav, through
ffmpeg otherwise), slicing, changing the sample width and exporting. Effects,
generators, playback, silence detection and the methods of ``AudioSegment``
that mix, fade, resample or measure audio were removed.

The remaining calls into the stdlib ``audioop`` module, which Python 3.13
removed, were replaced with numpy in ``_pcm.py``.
"""

from .audio_segment import AudioSegment

__all__ = ["AudioSegment"]

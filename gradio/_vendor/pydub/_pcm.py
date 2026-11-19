"""numpy replacements for the two stdlib ``audioop`` calls this copy still needs.

``audioop`` was removed from the standard library in Python 3.13. Upstream
pydub falls back to the compiled ``audioop-lts`` package there; these helpers
remove the need for it.
"""

import numpy as np

_DTYPES = {1: np.int8, 2: np.int16, 4: np.int32}


def toggle_8bit_sign(data):
    """Convert 8-bit PCM between unsigned (as stored in wav) and signed.

    Equivalent to ``audioop.bias(data, 1, 128)`` and ``audioop.bias(data, 1, -128)``,
    which are the same operation once the result wraps around.
    """
    return (np.frombuffer(data, dtype=np.uint8) ^ 0x80).tobytes()


def lin2lin(data, width, new_width):
    """Convert PCM samples between 1, 2 and 4 byte widths, like ``audioop.lin2lin``."""
    if width not in _DTYPES or new_width not in _DTYPES:
        raise ValueError("Sample width must be 1, 2 or 4 bytes")
    if width == new_width:
        return data
    samples = np.frombuffer(data, dtype=_DTYPES[width]).astype(np.int32)
    shift = 8 * abs(new_width - width)
    samples = samples << shift if new_width > width else samples >> shift
    return samples.astype(_DTYPES[new_width]).tobytes()

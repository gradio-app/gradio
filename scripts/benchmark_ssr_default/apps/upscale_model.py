"""A mock "enhance resolution" model, shared by upscale_gradio.py and upscale_fastapi.py.

The example is assets/dog.jpg (800x600) and a pixelated copy of it (1/8 scale,
blown back up with nearest-neighbour). enhance() spends ~1 s in ml_work.work()
(CPU-bound or GPU-like, see ml_work.py) and then upscales with Lanczos and a
sharpening filter: the benchmark is about the server being busy, not about
image quality.
"""

import tempfile
from pathlib import Path

from ml_work import work
from PIL import Image, ImageFilter

ASSETS = Path(__file__).parent / "assets"
HIGH = Image.open(ASSETS / "dog.jpg").convert("RGB")
_small = HIGH.resize((HIGH.width // 8, HIGH.height // 8), Image.Resampling.BILINEAR)
LOW = _small.resize(HIGH.size, Image.Resampling.NEAREST)

_dir = Path(tempfile.mkdtemp(prefix="bench-upscale-"))
LOW_PATH, HIGH_PATH = str(_dir / "dog_low.png"), str(_dir / "dog.png")
LOW.save(LOW_PATH)
HIGH.save(HIGH_PATH)


def enhance(image: Image.Image | None) -> tuple[Image.Image, Image.Image]:
    """Returns (before, after) for the slider."""
    before = image or LOW
    work()
    small = before.resize(
        (before.width // 8, before.height // 8), Image.Resampling.BILINEAR
    )
    after = small.resize(before.size, Image.Resampling.LANCZOS).filter(
        ImageFilter.UnsharpMask(radius=2, percent=160)
    )
    return before, after

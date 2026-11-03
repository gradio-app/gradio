# Gradio 7 Migration Guide

This guide covers migration changes for the upcoming Gradio 7 release.

## Python 3.11 or newer is required

Gradio 7 and its Python client require Python 3.11 or newer. Python 3.10 is no longer supported.

## 32-bit integer images cannot be encoded as PNG

Gradio 7 raises an error when encoding a PIL image in `I` mode (32-bit signed integer pixels) as PNG. Earlier Pillow versions silently clipped these values to the unsigned 16-bit range supported by PNG. Gradio now rejects this conversion consistently across supported Pillow versions.

For example, this affects a callback returning an `I`-mode PIL image to `gr.Image(format="png")`.

If every pixel value fits in the range 0–65535, explicitly convert the image before returning it:

```python
return image.convert("I;16")
```

Check the range before converting: negative values and values above 65535 cannot be preserved by this conversion. If you need to retain the original 32-bit integer values, save the image as TIFF and return its path through `gr.File` for download. TIFF is not widely supported for display in browsers.

RGB and RGBA images are unaffected.

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

## Listeners of the same event run at the same time

When several listeners are attached to the same trigger, for example two `.click()` calls on one button, Gradio 7 starts them all at once, as Gradio 5 did. In Gradio 6, each listener waited for the ones registered before it to finish. This changes a few things:

- A listener no longer sees the outputs of the listeners registered before it on the same trigger. It gets the component values from before the event. `gr.State` is read on the server when each listener's request is processed, so whether a listener sees another one's update to a State depends on which request the server handles first.
- This includes listeners that Gradio adds itself. For example, a `.click()` listener on a `gr.ClearButton` now runs alongside the clear, so it receives the values from before they were cleared.
- When two of them write the same output, the one that finishes last wins.
- A validator rejection stops only its own listener. The other listeners still run.
- `cancels=` takes effect as soon as the trigger fires, instead of after the trigger's other listeners have finished.

If the order matters, chain the steps with `.then()`, or with `.success()` to run a step only when the previous one succeeded:

```python
# Gradio 6 ran these one after the other
btn.click(lambda: gr.Button(interactive=False), None, btn)
btn.click(generate, prompt, [output, btn])

# Gradio 7: chain them to keep the order
btn.click(lambda: gr.Button(interactive=False), None, btn).then(
    generate, prompt, [output, btn]
)
```

An output that several running listeners write to keeps showing its loading status until the last of them has finished.

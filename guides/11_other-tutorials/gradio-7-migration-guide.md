# Gradio 7 Migration Guide

This guide covers migration changes for the upcoming Gradio 7 release.

## Python 3.11 or newer is required

Gradio 7 and its Python client require Python 3.11 or newer. Python 3.10 is no longer supported.

## Components are installed with `gradio[components]`

`pip install gradio` now installs only the core of Gradio: the server, the queue, the API engine, the client and `gr.Server`. Everything that builds a user interface (`gr.Blocks`, `gr.Interface`, `gr.ChatInterface`, the layouts and every component such as `gr.Textbox` or `gr.Image`) is in a separate package, `gradio_components`, along with the dependencies that only components need (numpy, pandas and Pillow).

Install it through the extra, which pins the version that matches your version of Gradio:

```bash
pip install "gradio[components]"
```

Your code does not change. `import gradio as gr`, `gr.Textbox(...)` and imports such as `from gradio.components import Textbox` or `from gradio.components.base import Component` all work as before once `gradio_components` is installed. Without it, using any of them raises an error that tells you to install `gradio[components]`.

What you need to do:

- In `requirements.txt`, `pyproject.toml` or a Dockerfile, replace `gradio` with `gradio[components]`, unless your app only uses `gr.Server`.
- If your code imports numpy, pandas or Pillow without listing them, they are now installed by `gradio[components]` rather than by `gradio`.
- Type checkers resolve `gr.Textbox`, `from gradio.components import Textbox` and `from gradio_components.textbox import Textbox`. An import from a component's old module, such as `from gradio.components.textbox import Textbox`, still runs, but a type checker cannot follow it: import from `gradio_components.textbox` instead.
- A logger configured by name for a component module, such as `gradio.components.video`, is now named `gradio_components.video`.

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

## `js=True` no longer converts Python functions to JavaScript

In Gradio 6, passing `js=True` to an event listener converted a simple Python function to JavaScript, so that it ran in the browser without a request to the server. Gradio 7 removes this feature, along with the `groovy` dependency that implemented it. A listener that still passes `js=True` prints a warning and runs its function on the server, so the app keeps working, with one more request per event.

Removing `js=True` is enough:

```python
# Gradio 6
btn.click(lambda: gr.Row(visible=False), None, row, js=True)

# Gradio 7
btn.click(lambda: gr.Row(visible=False), None, row)
```

To run code in the browser instead, write the JavaScript yourself and pass it as a string to `js`, as described in the [custom JS guide](/guides/custom-CSS-and-JS).

## `gr.State` values are kept in the browser, where the user can read them

In Gradio 6, the value of a `gr.State` stayed in the server's memory. In Gradio 7 it is kept in the user's browser by default, so that it survives a server restart and works across replicas. The copy in the browser is signed, so the user cannot change it, but it is not encrypted, so the user can read it.

If a `gr.State` holds something the user must not see, such as an API key, a hidden prompt or another user's data, keep it on the server:

```python
secret = gr.State(storage="server")
```

See [where state is stored](/guides/state-in-blocks#where-state-is-stored) for details.

## `pydub` is no longer installed with Gradio

Gradio 7 does not depend on `pydub` (or on `audioop-lts`, which `pydub` needs on Python 3.13 and newer). If your app imports `pydub` itself, add it to your app's requirements.

## `jinja2` and `markupsafe` are no longer installed with Gradio

Gradio 7 does not depend on `jinja2` or `markupsafe`. If your app uses them itself, for example through `Jinja2Templates` in a FastAPI app that Gradio is mounted on, add `jinja2` to your app's requirements.

This includes passing a styled pandas DataFrame (`df.style`) to `gr.Dataframe`: pandas needs `jinja2` for its `Styler`, and used to get it through Gradio.

## `semantic_version` is no longer installed with Gradio

Gradio 7 compares versions with `packaging` instead. If your app imports `semantic_version` itself, add it to your app's requirements. Theme version expressions such as `gr.Theme.from_hub("gradio/seafoam@>=0.0.1,<0.1.0")` work as before.

## `gradio info` and `gradio predict` are no longer built in

The `gradio info` and `gradio predict` commands have moved out of Gradio. They are provided by the separate [`hf-gradio`](https://pypi.org/project/hf-gradio/) package, which Gradio no longer installs:

```bash
pip install hf-gradio
hf-gradio info gradio/calculator
hf-gradio predict gradio/calculator /predict '{"num1": 5, "operation": "multiply", "num2": 3}'
```

If you use the Hugging Face CLI, `hf extensions install gradio-app/hf-gradio` gives you the same commands as `hf gradio info` and `hf gradio predict`.

## `typer`, `rich` and `hf-gradio` are no longer installed with Gradio

The `gradio` command line is now built on `click`, and prints plain text instead of `rich` panels and tables. Every command and option keeps its name. If your app imports `typer` or `rich` itself, add them to your app's requirements.

## `pytz` and `tomlkit` are no longer installed with Gradio

`gr.DateTime` now uses the standard library's `zoneinfo` for its `timezone` parameter. With `type="datetime"`, the `tzinfo` of the value passed to your function is a `zoneinfo.ZoneInfo` instead of a `pytz` timezone, and an unknown timezone name raises `zoneinfo.ZoneInfoNotFoundError`. The resulting times are the same.

If your app imports `pytz` or `tomlkit` itself, add them to your app's requirements.

## pandas 2.0 or newer is required

Gradio 7 requires `pandas>=2.0`. Several other minimum versions were also raised to the oldest ones that work with Python 3.11: `numpy>=1.23.2`, `pillow>=9.2`, `fastapi>=0.133.0`, `pydantic>=2.7` and `uvicorn>=0.21.0`.

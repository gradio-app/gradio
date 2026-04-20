# Event Listeners

Events supported by each component.


## Event Listener Signature

```python
component.event_name(
    fn: Callable | None | Literal["decorator"] = "decorator",
    inputs: Component | Sequence[Component] | set[Component] | None = None,
    outputs: Component | Sequence[Component] | set[Component] | None = None,
    api_name: str | None = None,
    api_description: str | None | Literal[False] = None,
    scroll_to_output: bool = False,
    show_progress: Literal["full", "minimal", "hidden"] = "full",
    show_progress_on: Component | Sequence[Component] | None = None,
    queue: bool = True,
    batch: bool = False,
    max_batch_size: int = 4,
    preprocess: bool = True,
    postprocess: bool = True,
    cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
    trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
    js: str | Literal[True] | None = None,
    concurrency_limit: int | None | Literal["default"] = "default",
    concurrency_id: str | None = None,
    api_visibility: Literal["public", "private", "undocumented"] = "public",
    time_limit: int | None = None,
    stream_every: float = 0.5,
    key: int | str | tuple[int | str, ...] | None = None,
    validator: Callable | None = None,
) -> Dependency
```

## Supported Events by Component

- **AnnotatedImage**: select

- **Audio**: stream, change, clear, play, pause, stop, pause, start_recording, pause_recording, stop_recording, upload, input

- **BarPlot**: select, double_click

- **BrowserState**: change

- **Button**: click

- **Chatbot**: change, select, like, retry, undo, example_select, option_select, clear, copy, edit

- **Checkbox**: change, input, select

- **CheckboxGroup**: change, input, select

- **ClearButton**: click

- **Code**: change, input, focus, blur

- **ColorPicker**: change, input, release, submit, focus, blur

- **Dataframe**: change, input, select, edit

- **Dataset**: click, select

- **DateTime**: change, submit

- **DeepLinkButton**: click

- **Dialogue**: change, input, submit

- **DownloadButton**: click

- **Dropdown**: change, input, select, focus, blur, key_up

- **DuplicateButton**: click

- **File**: change, select, clear, upload, delete, download

- **FileExplorer**: change, input, select

- **Gallery**: select, upload, change, delete, preview_close, preview_open

- **HTML**: change, input, click, double_click, submit, stop, edit, clear, play, pause, end, start_recording, pause_recording, stop_recording, focus, blur, upload, release, select, stream, like, example_select, option_select, load, key_up, apply, delete, tick, undo, retry, expand, collapse, download, copy

- **HighlightedText**: change, select

- **Image**: clear, change, stream, select, upload, input

- **ImageEditor**: clear, change, input, select, upload, apply

- **ImageSlider**: clear, change, stream, select, upload, input

- **JSON**: change

- **Label**: change, select

- **LinePlot**: select, double_click

- **LoginButton**: click

- **Markdown**: change, copy

- **Model3D**: change, upload, edit, clear

- **MultimodalTextbox**: change, input, select, submit, focus, blur, stop

- **Navbar**: change

- **Number**: change, input, submit, focus, blur

- **ParamViewer**: change, upload

- **Plot**: change

- **Radio**: select, change, input

- **ScatterPlot**: select, double_click

- **SimpleImage**: clear, change, upload

- **Slider**: change, input, release

- **State**: change

- **Textbox**: change, input, select, submit, focus, blur, stop, copy

- **Timer**: tick

- **UploadButton**: click, upload

- **Video**: change, clear, start_recording, stop_recording, stop, play, pause, end, upload, input

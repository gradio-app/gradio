# Gradio API Reference

Complete class and function signatures for the Gradio library.


## Components

### `AnnotatedImage(value: tuple[np.ndarray | PIL.Image.Image | str, list[tuple[np.ndarray | tuple[int, int, int, int], str]]] | None = None, format: str = "webp", show_legend: bool = True, height: int | str | None = None, width: int | str | None = None, color_map: dict[str, str] | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Literal['fullscreen'] | Button] | None = None)`

Creates a component to displays a base image and colored annotations on top of that image. Annotations can take the from of rectangles (e.g. object detection) or masks (e.g. image segmentation). As this component does not accept user input, it is rarely used as an input component.

### `Audio(value: str | Path | tuple[int, np.ndarray] | Callable | None = None, sources: list[Literal['upload', 'microphone']] | Literal['upload', 'microphone'] | None = None, type: Literal['numpy', 'filepath'] = "numpy", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, streaming: bool = False, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", format: Literal['wav', 'mp3'] | None = None, autoplay: bool = False, editable: bool = True, buttons: list[Literal['download', 'share'] | Button] | None = None, waveform_options: WaveformOptions | dict | None = None, loop: bool = False, recording: bool = False, subtitles: str | Path | list[dict[str, Any]] | None = None, playback_position: float = 0)`

Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output).

### `BarPlot(value: pd.DataFrame | Callable | None = None, x: str | None = None, y: str | None = None, color: str | None = None, title: str | None = None, x_title: str | None = None, y_title: str | None = None, color_title: str | None = None, x_bin: str | float | None = None, y_aggregate: Literal['sum', 'mean', 'median', 'min', 'max', 'count'] | None = None, color_map: dict[str, str] | None = None, colors_in_legend: list[str] | None = None, x_lim: list[float | None] | None = None, y_lim: list[float | None] = None, x_label_angle: float = 0, y_label_angle: float = 0, x_axis_format: str | None = None, y_axis_format: str | None = None, x_axis_labels_visible: bool | Literal['hidden'] = True, caption: str | I18nData | None = None, sort: Literal['x', 'y', '-x', '-y'] | list[str] | None = None, tooltip: Literal['axis', 'none', 'all'] | list[str] = "axis", height: int | None = None, label: str | I18nData | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, every: Timer | float | None = None, inputs: Component | Sequence[Component] | Set[Component] | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, buttons: list[Literal['fullscreen', 'export'] | Button] | None = None, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates a bar plot component to display data from a pandas DataFrame.

### `BrowserState(default_value: Any = None, storage_key: str | None = None, secret: str | None = None, render: bool = True)`

A base class for defining methods that all input/output components should have.

### `Brush(default_size: int | Literal['auto'] = "auto", colors: list[str | tuple[str, float]] | str | tuple[str, float] | None = None, default_color: str | tuple[str, float] | None = None, color_mode: Literal['fixed', 'defaults'] = "defaults")`

A dataclass for specifying options for the brush tool in the ImageEditor component. An instance of this class can be passed to the `brush` parameter of `gr.ImageEditor`.

### `Button(value: str | I18nData | Callable = "Run", every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop', 'huggingface'] = "secondary", size: Literal['sm', 'md', 'lg'] = "lg", icon: str | Path | None = None, link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = None, min_width: int | None = None)`

Creates a button that can be assigned arbitrary .click() events. The value (label) of the button can be used as an input to the function (rarely used) or set via the output of a function.

### `ChatMessage(content: MessageContent | list[MessageContent], role: Literal['user', 'assistant', 'system'] = "assistant", metadata: MetadataDict = _HAS_DEFAULT_FACTORY_CLASS(), options: list[OptionDict] = _HAS_DEFAULT_FACTORY_CLASS())`

A dataclass that represents a message in the Chatbot component (with type="messages"). The only required field is `content`. The value of `gr.Chatbot` is a list of these dataclasses.

### `Chatbot(value: list[MessageDict | Message] | Callable | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, autoscroll: bool = True, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", height: int | str | None = 400, resizable: bool = False, max_height: int | str | None = None, min_height: int | str | None = None, editable: Literal['user', 'all'] | None = None, latex_delimiters: list[dict[str, str | bool]] | None = None, rtl: bool = False, buttons: list[Literal['share', 'copy', 'copy_all'] | Button] | None = None, watermark: str | None = None, avatar_images: tuple[str | Path | None, str | Path | None] | None = None, sanitize_html: bool = True, render_markdown: bool = True, feedback_options: list[str] | tuple[str, ...] | None = ('Like', 'Dislike'), feedback_value: Sequence[str | None] | None = None, line_breaks: bool = True, layout: Literal['panel', 'bubble'] | None = None, placeholder: str | None = None, examples: list[ExampleMessage] | None = None, allow_file_downloads: <class 'inspect._empty'> = True, group_consecutive_messages: bool = True, allow_tags: list[str] | bool = True, reasoning_tags: list[tuple[str, str]] | None = None, like_user_message: bool = False)`

Creates a chatbot that displays user-submitted messages and responses. Supports a subset of Markdown including bold, italics, code, tables. Also supports audio/video/image files, which are displayed in the Chatbot, and other kinds of files which are displayed as links. This component is usually used as an output component.

### `Checkbox(value: bool | Callable = False, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a checkbox that can be set to `True` or `False`. Can be used as an input to pass a boolean value to a function or as an output to display a boolean value.

### `CheckboxGroup(choices: Sequence[str | int | float | tuple[str, str | int | float]] | None = None, value: Sequence[str | float | int] | str | float | int | Callable | None = None, type: Literal['value', 'index'] = "value", label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, show_select_all: bool = False, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a set of checkboxes. Can be used as an input to pass a set of values to a function or as an output to display values, a subset of which are selected.

### `ClearButton(components: None | Sequence[Component] | Component = None, value: str = "Clear", every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop'] = "secondary", size: Literal['sm', 'md', 'lg'] = "lg", icon: str | Path | None = None, link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = None, min_width: int | None = None, api_name: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "undocumented")`

Button that clears the value of a component or a list of components when clicked. It is instantiated with the list of components to clear.

### `Code(value: str | Callable | None = None, language: Literal['python', 'c', 'cpp', 'markdown', 'latex', 'json', 'html', 'css', 'javascript', 'jinja2', 'typescript', 'yaml', 'dockerfile', 'shell', 'r', 'sql', 'sql-msSQL', 'sql-mySQL', 'sql-mariaDB', 'sql-sqlite', 'sql-cassandra', 'sql-plSQL', 'sql-hive', 'sql-pgSQL', 'sql-gql', 'sql-gpSQL', 'sql-sparkSQL', 'sql-esper'] | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, lines: int = 5, max_lines: int | None = None, label: str | I18nData | None = None, interactive: bool | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", wrap_lines: bool = False, show_line_numbers: bool = True, autocomplete: bool = False, buttons: list[Literal['copy', 'download'] | Button] | None = None)`

Creates a code editor for viewing code (as an output component), or for entering and editing code (as an input component).

### `ColorPicker(value: str | Callable | None = None, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates a color picker for user to select a color as string input. Can be used as an input to pass a color value to a function or as an output to display a color value.

### `Dataframe(value: pd.DataFrame | Styler | np.ndarray | pl.DataFrame | list | list[list] | dict | str | Callable | None = None, headers: list[str] | None = None, row_count: int | None = None, row_limits: tuple[int | None, int | None] | None = None, col_count: None = None, column_count: int | None = None, column_limits: tuple[int | None, int | None] | None = None, datatype: Literal['str', 'number', 'bool', 'date', 'markdown', 'html', 'image', 'auto'] | Sequence[Literal['str', 'number', 'bool', 'date', 'markdown', 'html']] = "str", type: Literal['pandas', 'numpy', 'array', 'polars'] = "pandas", latex_delimiters: list[dict[str, str | bool]] | None = None, label: str | I18nData | None = None, show_label: bool | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, max_height: int | str = 500, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", wrap: bool = False, line_breaks: bool = True, column_widths: list[str | int] | None = None, buttons: list[Literal['fullscreen', 'copy']] | None = None, show_row_numbers: bool = False, max_chars: int | None = None, show_search: Literal['none', 'search', 'filter'] = "none", pinned_columns: int | None = None, static_columns: list[int] | None = None)`

This component displays a table of value spreadsheet-like component. Can be used to display data as an output component, or as an input to collect data from the user.

### `Dataset(label: str | I18nData | None = None, show_label: bool = True, components: Sequence[Component] | list[str] | None = None, component_props: list[dict[str, Any]] | None = None, samples: list[list[Any]] | None = None, headers: list[str] | None = None, type: Literal['values', 'index', 'tuple'] = "values", layout: Literal['gallery', 'table'] | None = None, samples_per_page: int = 10, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", container: bool = True, scale: int | None = None, min_width: int = 160, proxy_url: str | None = None, sample_labels: list[str] | None = None)`

Creates a gallery or table to display data samples. This component is primarily designed for internal use to display examples. However, it can also be used directly to display a dataset and let users select examples.

### `DateTime(value: float | str | datetime | None = None, include_time: bool = True, type: Literal['timestamp', 'datetime', 'string'] = "timestamp", timezone: str | None = None, label: str | I18nData | None = None, show_label: bool | None = None, info: str | I18nData | None = None, every: float | None = None, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, interactive: bool | None = None, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Component to select a date and (optionally) a time.

### `DeepLinkButton(value: str = "Share via Link", copied_value: str = "Link Copied!", inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary'] = "secondary", size: Literal['sm', 'md', 'lg'] = "lg", icon: str | Path | None = "/Users/abubakar/dev/gradio/gradio/icons/link.svg", link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = None, min_width: int | None = None, every: Timer | float | None = None)`

Creates a button that copies a shareable link to the current Gradio Space. The link includes the current session hash as a query parameter.

### `Dialogue(value: list[dict[str, str]] | Callable | None = None, type: Literal['list', 'text'] = "text", speakers: list[str] | None = None, formatter: Callable | None = None, unformatter: Callable | None = None, tags: list[str] | None = None, separator: str = "
", color_map: dict[str, str] | None = None, label: str | None = "Dialogue", info: str | None = "Type colon (:) in the dialogue line to see the available tags", placeholder: str | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, autofocus: bool = False, autoscroll: bool = True, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | None = None, max_lines: int | None = None, buttons: list[Literal['copy'] | Button] | None = None, submit_btn: str | bool | None = False, ui_mode: Literal['dialogue', 'text', 'both'] = "both")`

Creates a Dialogue component for displaying or collecting multi-speaker conversations. This component can be used as input to allow users to enter dialogue involving multiple speakers, or as output to display diarized speech, such as the result of a transcription or speaker identification model. Each message can be associated with a specific speaker, making it suitable for use cases like conversations, interviews, or meetings.

### `DownloadButton(label: str = "Download", value: str | Path | Callable | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop'] = "secondary", visible: bool | Literal['hidden'] = True, size: Literal['sm', 'md', 'lg'] = "lg", icon: str | None = None, scale: int | None = None, min_width: int | None = None, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates a button, that when clicked, allows a user to download a single file of arbitrary type.

### `Dropdown(choices: Sequence[str | int | float | tuple[str, str | int | float]] | None = None, value: str | int | float | Sequence[str | int | float] | Callable | DefaultValue | None = DefaultValue(), type: Literal['value', 'index'] = "value", multiselect: bool | None = None, allow_custom_value: bool = False, max_choices: int | None = None, filterable: bool = True, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a dropdown of choices from which a single entry or multiple entries can be selected (as an input component) or displayed (as an output component).

### `DuplicateButton(value: str = "Duplicate Space", every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop', 'huggingface'] = "huggingface", size: Literal['sm', 'md', 'lg'] = "sm", icon: str | Path | None = None, link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = 0, min_width: int | None = None)`

Button that triggers a Spaces Duplication, when the demo is on Hugging Face Spaces. Does nothing locally.

### `Eraser(default_size: int | Literal['auto'] = "auto")`

A dataclass for specifying options for the eraser tool in the ImageEditor component. An instance of this class can be passed to the `eraser` parameter of `gr.ImageEditor`.

### `File(value: str | list[str] | Callable | None = None, file_count: Literal['single', 'multiple', 'directory'] = "single", file_types: list[str] | None = None, type: Literal['filepath', 'binary'] = "filepath", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, height: int | str | float | None = None, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", allow_reordering: bool = False, buttons: list[Button] | None = None)`

Creates a file component that allows uploading one or more generic files (when used as an input) or displaying generic files or URLs for download (as output).       Demo: zip_files, zip_to_json

### `FileExplorer(glob: str = "**/*", value: str | list[str] | Callable | None = None, file_count: Literal['single', 'multiple'] = "multiple", root_dir: str | Path = ".", ignore_glob: str | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, height: int | str | None = None, max_height: int | str | None = 500, min_height: int | str | None = None, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a file explorer component that allows users to browse files on the machine hosting the Gradio app. As an input component, it also allows users to select files to be used as input to a function, while as an output component, it displays selected files.

### `Gallery(value: Sequence[np.ndarray | PIL.Image.Image | str | Path | tuple] | Callable | None = None, format: str = "webp", file_types: list[str] | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", columns: int | None = 2, rows: int | None = None, height: int | float | str | None = None, allow_preview: bool = True, preview: bool | None = None, selected_index: int | None = None, object_fit: Literal['contain', 'cover', 'fill', 'none', 'scale-down'] | None = None, buttons: list[Literal['share', 'download', 'fullscreen'] | Button] | None = None, interactive: bool | None = None, type: Literal['numpy', 'pil', 'filepath'] = "filepath", fit_columns: bool = True, sources: list[Literal['upload', 'webcam', 'clipboard']] | None = None)`

Creates a gallery component that allows displaying a grid of images or videos, and optionally captions. If used as an input, the user can upload images or videos to the gallery. If used as an output, the user can click on individual images or videos to view them at a higher resolution.

### `HTML(value: Any | Callable | None = None, label: str | I18nData | None = None, html_template: str = "${value}", css_template: str = "", js_on_load: str | None = "element.addEventListener('click', function() { trigger('click') });", apply_default_css: bool = True, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool = False, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", min_height: int | None = None, max_height: int | None = None, container: bool = False, padding: bool = False, autoscroll: bool = False, buttons: list[Button] | None = None, props: Any)`

Creates a component with arbitrary HTML. Can include CSS and JavaScript to create highly customized and interactive components.

### `HighlightedText(value: list[tuple[str, str | float | None]] | dict | Callable | None = None, color_map: dict[str, str] | None = None, show_legend: bool = False, show_inline_category: bool = True, combine_adjacent: bool = False, adjacent_separator: str = "", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", interactive: bool | None = None, rtl: bool = False, buttons: list[Button] | None = None)`

Displays text that contains spans that are highlighted by category or numerical value.

### `Image(value: str | PIL.Image.Image | np.ndarray | Callable | None = None, format: str = "webp", height: int | str | None = None, width: int | str | None = None, image_mode: Literal['1', 'L', 'P', 'RGB', 'RGBA', 'CMYK', 'YCbCr', 'LAB', 'HSV', 'I', 'F'] | None = "RGB", sources: list[Literal['upload', 'webcam', 'clipboard']] | Literal['upload', 'webcam', 'clipboard'] | None = None, type: Literal['numpy', 'pil', 'filepath'] = "numpy", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, buttons: list[Literal['download', 'share', 'fullscreen'] | Button] | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, streaming: bool = False, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", webcam_options: WebcamOptions | None = None, placeholder: str | None = None, watermark: WatermarkOptions | None = None)`

Creates an image component that can be used to upload images (as an input) or display images (as an output).

### `ImageEditor(value: EditorValue | ImageType | None = None, height: int | str | None = None, width: int | str | None = None, image_mode: Literal['1', 'L', 'P', 'RGB', 'RGBA', 'CMYK', 'YCbCr', 'LAB', 'HSV', 'I', 'F'] = "RGBA", sources: Iterable[Literal['upload', 'webcam', 'clipboard']] | Literal['upload', 'webcam', 'clipboard'] | None = ('upload', 'webcam', 'clipboard'), type: Literal['numpy', 'pil', 'filepath'] = "numpy", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, buttons: list[Literal['download', 'share', 'fullscreen']] | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", placeholder: str | None = None, transforms: Iterable[Literal['crop', 'resize']] | None = ('crop', 'resize'), eraser: Eraser | None | Literal[False] = None, brush: Brush | None | Literal[False] = None, format: str = "webp", layers: bool | LayerOptions = True, canvas_size: tuple[int, int] = (800, 800), fixed_canvas: bool = False, webcam_options: WebcamOptions | None = None)`

Creates an image component that, as an input, can be used to upload and edit images using simple editing tools such as brushes, strokes, cropping, and layers. Or, as an output, this component can be used to display images.

### `ImageSlider(value: image_tuple | Callable | None = None, format: str = "webp", height: int | str | None = None, width: int | str | None = None, image_mode: Literal['1', 'L', 'P', 'RGB', 'RGBA', 'CMYK', 'YCbCr', 'LAB', 'HSV', 'I', 'F'] | None = "RGB", type: Literal['numpy', 'pil', 'filepath'] = "numpy", label: str | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, buttons: list[Literal['download', 'fullscreen'] | Button] | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", slider_position: float = 50, max_height: int = 500)`

Creates an image component that can be used to upload images (as an input) or display images (as an output).

### `InputHTMLAttributes(autocapitalize: Literal['off', 'none', 'on', 'sentences', 'words', 'characters'] | None = None, autocorrect: Literal['on', 'off'] | None = None, spellcheck: bool | None = None, autocomplete: str | None = None, tabindex: int | None = None, enterkeyhint: Literal['enter', 'done', 'go', 'next', 'previous', 'search', 'send'] | None = None, lang: str | None = None)`

A dataclass for specifying HTML attributes for the input/textarea element. If any of these attributes are not provided, the browser will use the default value.

### `JSON(value: str | dict | list | Callable | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", open: bool = False, show_indices: bool = False, height: int | str | None = None, max_height: int | str | None = 500, min_height: int | str | None = None, buttons: list[Literal['copy'] | Button] | None = None)`

Used to display arbitrary JSON output prettily. As this component does not accept user input, it is rarely used as an input component.

### `Label(value: dict[str, float] | str | float | Callable | None = None, num_top_classes: int | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", color: str | None = None, show_heading: bool = True, buttons: list[Button] | None = None)`

Displays a classification label, along with confidence scores of top categories, if provided. As this component does not accept user input, it is rarely used as an input component.

### `LayerOptions(allow_additional_layers: bool = True, layers: list[str] | None = None, disabled: bool = False)`

A dataclass for specifying options for the layer tool in the ImageEditor component. An instance of this class can be passed to the `layers` parameter of `gr.ImageEditor`.

### `LinePlot(value: pd.DataFrame | Callable | None = None, x: str | None = None, y: str | None = None, color: str | None = None, title: str | None = None, x_title: str | None = None, y_title: str | None = None, color_title: str | None = None, x_bin: str | float | None = None, y_aggregate: Literal['sum', 'mean', 'median', 'min', 'max', 'count'] | None = None, color_map: dict[str, str] | None = None, colors_in_legend: list[str] | None = None, x_lim: list[float | None] | None = None, y_lim: list[float | None] = None, x_label_angle: float = 0, y_label_angle: float = 0, x_axis_format: str | None = None, y_axis_format: str | None = None, x_axis_labels_visible: bool | Literal['hidden'] = True, caption: str | I18nData | None = None, sort: Literal['x', 'y', '-x', '-y'] | list[str] | None = None, tooltip: Literal['axis', 'none', 'all'] | list[str] = "axis", height: int | None = None, label: str | I18nData | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, every: Timer | float | None = None, inputs: Component | Sequence[Component] | Set[Component] | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, buttons: list[Literal['fullscreen', 'export'] | Button] | None = None, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates a line plot component to display data from a pandas DataFrame.

### `LoginButton(value: str = "Sign in with Hugging Face", logout_value: str = "Logout ({})", every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop', 'huggingface'] = "huggingface", size: Literal['sm', 'md', 'lg'] = "lg", icon: str | Path | None = "/Users/abubakar/dev/gradio/gradio/icons/huggingface-logo.svg", link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = None, min_width: int | None = None)`

Creates a "Sign In" button that redirects the user to sign in with Hugging Face OAuth. Once the user is signed in, the button will act as a logout button, and you can retrieve a signed-in user's profile by adding a parameter of type `gr.OAuthProfile` to any Gradio function. This will only work if this Gradio app is running in a Hugging Face Space. Permissions for the OAuth app can be configured in the Spaces README file, as described here: https://huggingface.co/docs/hub/en/spaces-oauth. For local development, instead of OAuth, the local Hugging Face account that is logged in (via `hf auth login`) will be available through the `gr.OAuthProfile` object.

### `Markdown(value: str | I18nData | Callable | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, rtl: bool = False, latex_delimiters: list[dict[str, str | bool]] | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", sanitize_html: bool = True, line_breaks: bool = False, header_links: bool = False, height: int | str | None = None, max_height: int | str | None = None, min_height: int | str | None = None, buttons: list[Literal['copy']] | None = None, container: bool = False, padding: bool = False)`

Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs as well as code blocks with syntax highlighting. Supported languages are bash, c, cpp, go, java, javascript, json, php, python, rust, sql, and yaml. As this component does not accept user input, it is rarely used as an input component.

### `MetadataDict()`

A typed dictionary to represent metadata for a message in the Chatbot component. An instance of this dictionary is used for the `metadata` field in a ChatMessage when the chat message should be displayed as a thought.

### `Model3D(value: str | Callable | None = None, display_mode: Literal['solid', 'point_cloud', 'wireframe'] | None = None, clear_color: tuple[float, float, float, float] | None = None, camera_position: tuple[int | float | None, int | float | None, int | float | None] = (None, None, None), zoom_speed: float = 1, pan_speed: float = 1, height: int | str | None = None, label: str | I18nData | None = None, show_label: bool | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a component allows users to upload or view 3D Model files (.obj, .glb, .stl, .gltf, .splat, or .ply).

### `MultimodalTextbox(value: str | dict[str, str | list] | Callable | None = None, sources: list[Literal['upload', 'microphone']] | Literal['upload', 'microphone'] | None = None, file_types: list[str] | None = None, file_count: Literal['single', 'multiple', 'directory'] = "single", lines: int = 1, max_lines: int = 20, placeholder: str | None = None, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, autofocus: bool = False, autoscroll: bool = True, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", text_align: Literal['left', 'right'] | None = None, rtl: bool = False, submit_btn: str | bool | None = True, stop_btn: str | bool | None = False, max_plain_text_length: int = 1000, html_attributes: InputHTMLAttributes | None = None)`

Creates a textarea for users to enter string input or display string output and also allows for the uploading of multimedia files.

### `Navbar(value: list[tuple[str, str]] | None = None, visible: bool = True, main_page_name: str | Literal[False] = "Home", elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None)`

Creates a navigation bar component for multipage Gradio apps. The navbar component allows customizing the appearance of the navbar for that page. Only one Navbar component can exist per page in a Blocks app, and it can be placed anywhere within the page.   The Navbar component is designed to control the appearance of the navigation bar in multipage applications. When present in a Blocks app, its properties override the default navbar behavior.

### `Number(value: float | Callable | None = None, label: str | I18nData | None = None, placeholder: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None, precision: int | None = None, minimum: float | None = None, maximum: float | None = None, step: float = 1)`

Creates a numeric field for user to enter numbers as input or display numeric output.

### `OptionDict()`

A typed dictionary to represent an option in a ChatMessage. A list of these dictionaries is used for the `options` field in a ChatMessage.

### `ParamViewer(value: Mapping[str, Parameter] | None = None, language: Literal['python', 'typescript'] = "python", linkify: list[str] | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", header: str | None = "Parameters", anchor_links: bool | str = False, max_height: int | str | None = None)`

Displays an interactive table of parameters and their descriptions and default values with syntax highlighting. For each parameter, the user should provide a type (e.g. a `str`), a human-readable description, and a default value. As this component does not accept user input, it is rarely used as an input component. Internally, this component is used to display the parameters of components in the Custom Component Gallery (https://www.gradio.app/custom-components/gallery).

### `Plot(value: Any | None = None, format: str = "webp", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", buttons: list[Button] | None = None)`

Creates a plot component to display various kinds of plots (matplotlib, plotly, altair, or bokeh plots are supported). As this component does not accept user input, it is rarely used as an input component.

### `Radio(choices: Sequence[str | int | float | tuple[str, str | int | float]] | None = None, value: str | int | float | Callable | None = None, type: Literal['value', 'index'] = "value", label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", rtl: bool = False, buttons: list[Button] | None = None)`

Creates a set of (string or numeric type) radio buttons of which only one can be selected.

### `ScatterPlot(value: pd.DataFrame | Callable | None = None, x: str | None = None, y: str | None = None, color: str | None = None, title: str | None = None, x_title: str | None = None, y_title: str | None = None, color_title: str | None = None, x_bin: str | float | None = None, y_aggregate: Literal['sum', 'mean', 'median', 'min', 'max', 'count'] | None = None, color_map: dict[str, str] | None = None, colors_in_legend: list[str] | None = None, x_lim: list[float | None] | None = None, y_lim: list[float | None] = None, x_label_angle: float = 0, y_label_angle: float = 0, x_axis_format: str | None = None, y_axis_format: str | None = None, x_axis_labels_visible: bool | Literal['hidden'] = True, caption: str | I18nData | None = None, sort: Literal['x', 'y', '-x', '-y'] | list[str] | None = None, tooltip: Literal['axis', 'none', 'all'] | list[str] = "axis", height: int | None = None, label: str | I18nData | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, every: Timer | float | None = None, inputs: Component | Sequence[Component] | Set[Component] | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, buttons: list[Literal['fullscreen', 'export'] | Button] | None = None, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates a scatter plot component to display data from a pandas DataFrame.

### `SimpleImage(value: str | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, show_download_button: bool = True, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value")`

Creates an image component that can be used to upload images (as an input) or display images (as an output).

### `Slider(minimum: float = 0, maximum: float = 100, value: float | Callable | None = None, step: float | None = None, precision: int | None = None, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", randomize: bool = False, buttons: list[Literal['reset']] | None = None)`

Creates a slider that ranges from {minimum} to {maximum} with a step size of {step}.

### `State(value: Any = None, render: bool = True, time_to_live: int | float | None = None, delete_callback: Callable[[Any], None] | None = None)`

A base class for defining methods that all input/output components should have.

### `Textbox(value: str | I18nData | Callable | None = None, type: Literal['text', 'password', 'email'] = "text", lines: int = 1, max_lines: int | None = None, placeholder: str | I18nData | None = None, label: str | I18nData | None = None, info: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, autofocus: bool = False, autoscroll: bool = True, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", text_align: Literal['left', 'right'] | None = None, rtl: bool = False, buttons: list[Literal['copy'] | Button] | None = None, max_length: int | None = None, submit_btn: str | bool | None = False, stop_btn: str | bool | None = False, html_attributes: InputHTMLAttributes | None = None)`

Creates a textarea for user to enter string input or display string output.

### `Timer(value: float = 1, active: bool = True, render: bool = True)`

Special component that ticks at regular intervals when active. It is not visible, and only used to trigger events at a regular interval through the `tick` event listener.

### `UploadButton(label: str = "Upload a File", value: str | I18nData | list[str] | Callable | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop'] = "secondary", visible: bool | Literal['hidden'] = True, size: Literal['sm', 'md', 'lg'] = "lg", icon: str | None = None, scale: int | None = None, min_width: int | None = None, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", type: Literal['filepath', 'binary'] = "filepath", file_count: Literal['single', 'multiple', 'directory'] = "single", file_types: list[str] | None = None)`

Used to create an upload button, when clicked allows a user to upload files that satisfy the specified file type or generic files (if file_type not set).

### `Video(value: str | Path | Callable | None = None, format: str | None = None, sources: list[Literal['upload', 'webcam']] | Literal['upload', 'webcam'] | None = None, height: int | str | None = None, width: int | str | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", webcam_options: WebcamOptions | None = None, include_audio: bool | None = None, autoplay: bool = False, buttons: list[Literal['download', 'share'] | Button] | None = None, loop: bool = False, streaming: bool = False, watermark: WatermarkOptions | None = None, subtitles: str | Path | list[dict[str, Any]] | None = None, playback_position: float = 0)`

Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output). For the video to be playable in the browser it must have a compatible container and codec combination. Allowed combinations are .mp4 with h264 codec, .ogg with theora codec, and .webm with vp9 codec. If the component detects that the output video would not be playable in the browser it will attempt to convert it to a playable mp4 video. If the conversion fails, the original video is returned.

### `WatermarkOptions(watermark: Union[str, Path, PIL.Image.Image, np.ndarray, None] = None, position: Union[tuple[int, int], Literal['top-left', 'top-right', 'bottom-left', 'bottom-right']] = "bottom-right")`

A dataclass for specifying options for the watermark tool in the ImageEditor component.

### `WaveformOptions(waveform_color: str | None = None, waveform_progress_color: str | None = None, trim_region_color: str | None = None, show_recording_waveform: bool = True, skip_length: int | float = 5, sample_rate: int = 44100)`

A dataclass for specifying options for the waveform display in the Audio component. An instance of this class can be passed into the `waveform_options` parameter of `gr.Audio`.

### `WebcamOptions(mirror: bool = True, constraints: dict[str, Any] | None = None)`

A dataclass for specifying options for the webcam tool in the ImageEditor component. An instance of this class can be passed to the `webcam_options` parameter of `gr.ImageEditor`.


## Building Blocks

### `Accordion(label: str | I18nData | None = None, open: bool = True, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Accordion is a layout element which can be toggled to show/hide the contained content.

#### `Accordion.expand(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Accordion is expanded.

#### `Accordion.collapse(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Accordion is collapsed.

### `Base(primary_hue: colors.Color | str = Color(), secondary_hue: colors.Color | str = Color(), neutral_hue: colors.Color | str = Color(), text_size: sizes.Size | str = Size(), spacing_size: sizes.Size | str = Size(), radius_size: sizes.Size | str = Size(), font: fonts.Font | str | Iterable[fonts.Font | str] = (<gradio.themes.utils.fonts.LocalFont (name='IBM Plex Sans', weights=(400, 700))>, 'ui-sans-serif', 'system-ui', 'sans-serif'), font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (<gradio.themes.utils.fonts.LocalFont (name='IBM Plex Mono', weights=(400, 700))>, 'ui-monospace', 'Consolas', 'monospace'))`

#### `Base.push_to_hub(repo_name: str, org_name: str | None = None, version: str | None = None, token: str | None = None, theme_name: str | None = None, description: str | None = None, private: bool = False)`

Upload a theme to the HuggingFace hub.   This requires a HuggingFace account.

#### `Base.from_hub(repo_name: str, token: str | None = None)`

Load a theme from the hub.   This DOES NOT require a HuggingFace account for downloading publicly available themes.

#### `Base.load(path: str)`

Load a theme from a json file.

#### `Base.dump(filename: str)`

Write the theme to a json file.

#### `Base.from_dict(theme: dict[str, dict[str, str]])`

Create a theme instance from a dictionary representation.

#### `Base.to_dict()`

Convert the theme into a python dictionary.

### `Blocks(analytics_enabled: bool | None = None, mode: str = "blocks", title: str | I18nData = "Gradio", fill_height: bool = False, fill_width: bool = False, delete_cache: tuple[int, int] | None = None)`

Blocks is Gradio's low-level API that allows you to create more custom web applications and demos than Interfaces (yet still entirely in Python).     Compared to the Interface class, Blocks offers more flexibility and control over: (1) the layout of components (2) the events that trigger the execution of functions (3) data flows (e.g. inputs can trigger outputs, which can trigger the next level of outputs). Blocks also offers ways to group together related demos such as with tabs.     The basic usage of Blocks is as follows: create a Blocks object, then use it as a context (with the "with" statement), and then define layouts, components, or events within the Blocks context. Finally, call the launch() method to launch the demo.

#### `Blocks.launch(inline: bool | None = None, inbrowser: bool = False, share: bool | None = None, debug: bool = False, max_threads: int = 40, auth: Callable[[str, str], bool] | tuple[str, str] | list[tuple[str, str]] | None = None, auth_message: str | None = None, prevent_thread_lock: bool = False, show_error: bool = False, server_name: str | None = None, server_port: int | None = None, height: int = 500, width: int | str = "100%", favicon_path: str | Path | None = None, ssl_keyfile: str | None = None, ssl_certfile: str | None = None, ssl_keyfile_password: str | None = None, ssl_verify: bool = True, quiet: bool = False, footer_links: list[Literal['api', 'gradio', 'settings'] | dict[str, str]] | None = None, allowed_paths: list[str] | None = None, blocked_paths: list[str] | None = None, root_path: str | None = None, app_kwargs: dict[str, Any] | None = None, state_session_capacity: int = 10000, share_server_address: str | None = None, share_server_protocol: Literal['http', 'https'] | None = None, share_server_tls_certificate: str | None = None, auth_dependency: Callable[[fastapi.Request], str | None] | None = None, max_file_size: str | int | None = None, enable_monitoring: bool | None = None, strict_cors: bool = True, node_server_name: str | None = None, node_port: int | None = None, ssr_mode: bool | None = None, pwa: bool | None = None, mcp_server: bool | None = None, i18n: I18n | None = None, theme: Theme | str | None = None, css: str | None = None, css_paths: str | Path | Sequence[str | Path] | None = None, js: str | Literal[True] | None = None, head: str | None = None, head_paths: str | Path | Sequence[str | Path] | None = None)`

Launches a simple web server that serves the demo. Can also be used to create a public link used by anyone to access the demo from their browser by setting share=True.

#### `Blocks.queue(status_update_rate: float | Literal['auto'] = "auto", api_open: bool | None = None, max_size: int | None = None, default_concurrency_limit: int | None | Literal['not_set'] = "not_set")`

By enabling the queue you can control when users know their position in the queue, and set a limit on maximum number of events allowed.

#### `Blocks.integrate(comet_ml: <class 'inspect._empty'> = None, wandb: ModuleType | None = None, mlflow: ModuleType | None = None)`

A catch-all method for integrating with other libraries. This method should be run after launch()

#### `Blocks.load(block: Block | None, fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Blocks initially loads in the browser.

#### `Blocks.unload(fn: Callable[..., Any])`

This listener is triggered when the user closes or refreshes the tab, ending the user session. It is useful for cleaning up resources when the app is closed.

### `CSVLogger(simplify_file_data: bool = True, verbose: bool = True, dataset_file_name: str | None = None)`

The default implementation of the FlaggingCallback abstract class in gradio>=5.0. Each flagged sample (both the input and output data) is logged to a CSV file with headers on the machine running the gradio app. Unlike ClassicCSVLogger, this implementation is concurrent-safe and it creates a new dataset file every time the headers of the CSV (derived from the labels of the components) change. It also only creates columns for "username" and "flag" if the flag_option and username are provided, respectively.

### `ClassicCSVLogger(simplify_file_data: bool = True)`

The classic implementation of the FlaggingCallback abstract class in gradio<5.0. Each flagged sample (both the input and output data) is logged to a CSV file with headers on the machine running the gradio app.

### `Column(scale: int = 1, min_width: int = 320, variant: Literal['default', 'panel', 'compact'] = "default", visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, show_progress: bool = False, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Column is a layout element within Blocks that renders all children vertically. The widths of columns can be set through the `scale` and `min_width` parameters. If a certain scale results in a column narrower than min_width, the min_width parameter will win.

### `Draggable(orientation: Literal['row', 'column'] = "column", visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Draggable is a layout element within Blocks that renders children with drag and drop functionality. A user can reorder children by dragging them around and snapping them into place. If a child is a layout (e.g. gr.Row, gr.Group), all the components in the child layout will drag together.

### `Group(visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Group is a layout element within Blocks which groups together children so that they do not have any padding or margin between them.

### `Interface(fn: Callable, inputs: str | Component | Sequence[str | Component] | None, outputs: str | Component | Sequence[str | Component] | None, examples: list[Any] | list[list[Any]] | str | None = None, cache_examples: bool | None = None, cache_mode: Literal['eager', 'lazy'] | None = None, examples_per_page: int = 10, example_labels: list[str] | None = None, preload_example: int | Literal[False] = 0, live: bool = False, title: str | I18nData | None = None, description: str | None = None, article: str | None = None, flagging_mode: Literal['never'] | Literal['auto'] | Literal['manual'] | None = None, flagging_options: list[str] | list[tuple[str, str]] | None = None, flagging_dir: str = ".gradio/flagged", flagging_callback: FlaggingCallback | None = None, analytics_enabled: bool | None = None, batch: bool = False, max_batch_size: int = 4, api_visibility: Literal['public', 'private', 'undocumented'] = "public", api_name: str | None = None, api_description: str | None | Literal[False] = None, allow_duplication: bool = False, concurrency_limit: int | None | Literal['default'] = "default", additional_inputs: str | Component | Sequence[str | Component] | None = None, additional_inputs_accordion: str | Accordion | None = None, submit_btn: str | Button = "Submit", stop_btn: str | Button = "Stop", clear_btn: str | Button | None = "Clear", delete_cache: tuple[int, int] | None = None, show_progress: Literal['full', 'minimal', 'hidden'] = "full", fill_width: bool = False, time_limit: int | None = 30, stream_every: float = 0.5, deep_link: str | DeepLinkButton | bool | None = None, validator: Callable | None = None)`

Interface is Gradio's main high-level class, and allows you to create a web-based GUI / demo around a machine learning model (or any Python function) in a few lines of code. You must specify three parameters: (1) the function to create a GUI for (2) the desired input components and (3) the desired output components. Additional parameters can be used to control the appearance and behavior of the demo.

#### `Interface.launch(inline: bool | None = None, inbrowser: bool = False, share: bool | None = None, debug: bool = False, max_threads: int = 40, auth: Callable[[str, str], bool] | tuple[str, str] | list[tuple[str, str]] | None = None, auth_message: str | None = None, prevent_thread_lock: bool = False, show_error: bool = False, server_name: str | None = None, server_port: int | None = None, height: int = 500, width: int | str = "100%", favicon_path: str | Path | None = None, ssl_keyfile: str | None = None, ssl_certfile: str | None = None, ssl_keyfile_password: str | None = None, ssl_verify: bool = True, quiet: bool = False, footer_links: list[Literal['api', 'gradio', 'settings'] | dict[str, str]] | None = None, allowed_paths: list[str] | None = None, blocked_paths: list[str] | None = None, root_path: str | None = None, app_kwargs: dict[str, Any] | None = None, state_session_capacity: int = 10000, share_server_address: str | None = None, share_server_protocol: Literal['http', 'https'] | None = None, share_server_tls_certificate: str | None = None, auth_dependency: Callable[[fastapi.Request], str | None] | None = None, max_file_size: str | int | None = None, enable_monitoring: bool | None = None, strict_cors: bool = True, node_server_name: str | None = None, node_port: int | None = None, ssr_mode: bool | None = None, pwa: bool | None = None, mcp_server: bool | None = None, i18n: I18n | None = None, theme: Theme | str | None = None, css: str | None = None, css_paths: str | Path | Sequence[str | Path] | None = None, js: str | Literal[True] | None = None, head: str | None = None, head_paths: str | Path | Sequence[str | Path] | None = None)`

Launches a simple web server that serves the demo. Can also be used to create a public link used by anyone to access the demo from their browser by setting share=True.

#### `Interface.load(block: Block | None, fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Interface initially loads in the browser.

#### `Interface.from_pipeline(pipeline: Pipeline | DiffusionPipeline)`

Class method that constructs an Interface from a Hugging Face transformers.Pipeline or diffusers.DiffusionPipeline object. The input and output components are automatically determined from the pipeline.

#### `Interface.integrate(comet_ml: <class 'inspect._empty'> = None, wandb: ModuleType | None = None, mlflow: ModuleType | None = None)`

A catch-all method for integrating with other libraries. This method should be run after launch()

#### `Interface.queue(status_update_rate: float | Literal['auto'] = "auto", api_open: bool | None = None, max_size: int | None = None, default_concurrency_limit: int | None | Literal['not_set'] = "not_set")`

By enabling the queue you can control when users know their position in the queue, and set a limit on maximum number of events allowed.

### `Row(variant: Literal['default', 'panel', 'compact'] = "default", visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, scale: int | None = None, render: bool = True, height: int | str | None = None, max_height: int | str | None = None, min_height: int | str | None = None, equal_height: bool = False, show_progress: bool = False, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Row is a layout element within Blocks that renders all children horizontally.

### `Sidebar(label: str | I18nData | None = None, open: bool = True, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, width: int | str = 320, position: Literal['left', 'right'] = "left", key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Sidebar is a collapsible panel that renders child components on the left side of the screen within a Blocks layout.

#### `Sidebar.expand(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Sidebar is expanded.

#### `Sidebar.collapse(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

This listener is triggered when the Sidebar is collapsed.

### `SimpleCSVLogger()`

A simplified implementation of the FlaggingCallback abstract class provided for illustrative purposes.  Each flagged sample (both the input and output data) is logged to a CSV file on the machine running the gradio app.

### `Step(label: str | I18nData | None = None, visible: bool = True, interactive: bool = True, id: int | None = None, elem_id: str | None = None, elem_classes: list[str] | str | None = None, scale: int | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Step is a layout element. A step is a single step in a step-by-step workflow.

#### `Step.select(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

Event listener for when the user selects or deselects the Step. Uses event data gradio.SelectData to carry `value` referring to the label of the Step, and `selected` to refer to state of the Step. See https://www.gradio.app/main/docs/gradio/eventdata for more details.

### `Tab(label: str | I18nData | None = None, visible: bool | Literal['hidden'] = True, interactive: bool = True, id: int | str | None = None, elem_id: str | None = None, elem_classes: list[str] | str | None = None, scale: int | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None, render_children: bool = False)`

Tab (or its alias TabItem) is a layout element. Components defined within the Tab will be visible when this tab is selected tab.

#### `Tab.select(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

Event listener for when the user selects the Tab. Uses event data gradio.SelectData to carry `value` referring to the label of the Tab, and `selected` to refer to state of the Tab. See https://www.gradio.app/main/docs/gradio/eventdata documentation for more details.

### `TabbedInterface(interface_list: Sequence[Blocks], tab_names: list[str] | None = None, title: str | None = None, analytics_enabled: bool | None = None)`

A TabbedInterface is created by providing a list of Interfaces or Blocks, each of which gets rendered in a separate tab. Only the components from the Interface/Blocks will be rendered in the tab.

### `Walkthrough(selected: int | None = None, visible: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = None)`

Walkthrough is a layout element within Blocks that can contain multiple "Step" Components, which can be used to create a step-by-step workflow.

#### `Walkthrough.change(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

Triggered when the value of the Walkthrough changes either because of user input (e.g. a user types in a textbox) OR because of a function update (e.g. an image receives a value from the output of an event trigger). See `.input()` for a listener that is only triggered by user input.

#### `Walkthrough.select(fn: Callable | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

Event listener for when the user selects or deselects the Walkthrough. Uses event data gradio.SelectData to carry `value` referring to the label of the Walkthrough, and `selected` to refer to state of the Walkthrough. See https://www.gradio.app/main/docs/gradio/eventdata for more details.

### `is_audio_correct_length(audio: tuple[int, 'np.ndarray'], min_length: float | None, max_length: float | None)`

Validates that the audio length is within the specified min and max length (in seconds).

### `is_video_correct_length(video: <class 'str'>, min_length: float | None, max_length: float | None)`

Validates that the video file length is within the specified min and max length (in seconds).

### `queue(status_update_rate: float | Literal['auto'] = "auto", api_open: bool | None = None, max_size: int | None = None, default_concurrency_limit: int | None | Literal['not_set'] = "not_set")`

By enabling the queue you can control when users know their position in the queue, and set a limit on maximum number of events allowed.

### `render(inputs: Sequence[Component] | Component | None = None, triggers: Sequence[EventListenerCallable] | EventListenerCallable | None = None, queue: bool = True, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = "always_last", concurrency_limit: int | None | Literal['default'] = None, concurrency_id: str | None = None, show_progress: Literal['full', 'minimal', 'hidden'] = "full")`

The render decorator allows Gradio Blocks apps to have dynamic layouts, so that the components and event listeners in your app can change depending on custom logic. Attaching a @gr.render decorator to a function will cause the function to be re-run whenever the inputs are changed (or specified triggers are activated). The function contains the components and event listeners that will update based on the inputs. With render, you can:   - Show or hide components   - Change text or layout   - Create components based on what users enter   The basic usage of @gr.render is as follows:   1. Create a function and attach the @gr.render decorator to it.   2. Add the input components to the `inputs=` argument of @gr.render, and create a corresponding argument in your function for each component.   3. Add all components inside the function that you want to update based on the inputs. Any event listeners that use these components should also be inside this function.

### `route(name: str, path: str | None = None, show_in_navbar: bool = True)`

Adds a new page to the Blocks app.


## Helpers

### `CopyData(target: Block | None, data: Any)`

The gr.CopyData class is a subclass of gr.EventData that specifically carries information about the `.copy()` event. When gr.CopyData is added as a type hint to an argument of an event listener method, a gr.CopyData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `DeletedFileData(target: Block | None, data: FileDataDict)`

The gr.DeletedFileData class is a subclass of gr.EventData that specifically carries information about the `.delete()` event. When gr.DeletedFileData is added as a type hint to an argument of an event listener method, a gr.DeletedFileData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `Dependency(trigger: <class 'inspect._empty'>, key_vals: <class 'inspect._empty'>, dep_index: <class 'inspect._empty'>, fn: <class 'inspect._empty'>, associated_timer: Timer | None = None)`

The Dependency object is usually not created directly but is returned when an event listener is set up. It contains the configuration data for the event listener, and can be used to set up additional event listeners that depend on the completion of the current event listener using .then(), .success(), and .failure().

### `DownloadData(target: Block | None, data: FileDataDict)`

The gr.DownloadData class is a subclass of gr.EventData that specifically carries information about the `.download()` event. When gr.DownloadData is added as a type hint to an argument of an event listener method, a gr.DownloadData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `EditData(target: Block | None, data: Any)`

The gr.EditData class is a subclass of gr.Event data that specifically carries information about the `.edit()` event. When gr.EditData is added as a type hint to an argument of an event listener method, a gr.EditData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `EventData(target: Block | None)`

When gr.EventData or one of its subclasses is added as a type hint to an argument of a prediction function, a gr.EventData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener. The gr.EventData object itself contains a `.target` attribute that refers to the component that triggered the event, while subclasses of gr.EventData contains additional attributes that are different for each class.

### `Examples(examples: list[Any] | list[list[Any]] | str, inputs: Component | Sequence[Component], outputs: Component | Sequence[Component] | None = None, fn: Callable | None = None, cache_examples: bool | None = None, cache_mode: Literal['eager', 'lazy'] | None = None, examples_per_page: int = 10, label: str | I18nData | None = "Examples", elem_id: str | None = None, run_on_click: bool = False, preprocess: bool = True, postprocess: bool = True, api_visibility: Literal['public', 'private', 'undocumented'] = "undocumented", api_name: str | None = "load_example", api_description: str | None | Literal[False] = None, batch: bool = False, example_labels: list[str] | None = None, visible: bool | Literal['hidden'] = True, preload: int | Literal[False] = 0)`

This class is a wrapper over the Dataset component and can be used to create Examples for Blocks / Interfaces. Populates the Dataset component with examples and assigns event listener so that clicking on an example populates the input/output components. Optionally handles example caching for fast inference.

### `FileData(data: Any)`

The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded.

### `KeyUpData(target: Block | None, data: Any)`

The gr.KeyUpData class is a subclass of gr.EventData that specifically carries information about the `.key_up()` event. When gr.KeyUpData is added as a type hint to an argument of an event listener method, a gr.KeyUpData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `LikeData(target: Block | None, data: Any)`

The gr.LikeData class is a subclass of gr.EventData that specifically carries information about the `.like()` event. When gr.LikeData is added as a type hint to an argument of an event listener method, a gr.LikeData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `Progress(track_tqdm: bool = False)`

The Progress class provides a custom progress tracker that is used in a function signature. To attach a Progress tracker to a function, simply add a parameter right after the input parameters that has a default value set to a `gradio.Progress()` instance. The Progress tracker can then be updated in the function by calling the Progress object or using the `tqdm` method on an Iterable.

#### `Progress.__call__(progress: float | tuple[int, int | None] | None, desc: str | None = None, total: int | float | None = None, unit: str = "steps")`

Updates progress tracker with progress and message text.

#### `Progress.tqdm(iterable: Iterable | None, desc: str | None = None, total: int | float | None = None, unit: str = "steps")`

Attaches progress tracker to iterable, like tqdm.

### `RetryData(target: Block | None, data: Any)`

The gr.RetryData class is a subclass of gr.Event data that specifically carries information about the `.retry()` event. When gr.RetryData is added as a type hint to an argument of an event listener method, a gr.RetryData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `SelectData(target: Block | None, data: Any)`

The gr.SelectData class is a subclass of gr.EventData that specifically carries information about the `.select()` event. When gr.SelectData is added as a type hint to an argument of an event listener method, a gr.SelectData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `UndoData(target: Block | None, data: Any)`

The gr.UndoData class is a subclass of gr.Event data that specifically carries information about the `.undo()` event. When gr.UndoData is added as a type hint to an argument of an event listener method, a gr.UndoData object will automatically be passed as the value of that argument. The attributes of this object contains information about the event that triggered the listener.

### `api(fn: Callable | Literal['decorator'] = "decorator", api_name: str | None = None, api_description: str | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", time_limit: int | None = None, stream_every: float = 0.5)`

Sets up an API or MCP endpoint for a generic function without needing define events listeners or components. Derives its typing from type hints in the provided function's signature rather than the components.

### `load(name: str, src: Callable[[str, str | None], Blocks] | Literal['models', 'spaces', 'huggingface'] | None = None, token: str | None = None, accept_token: bool | LoginButton = False, provider: PROVIDER_T | None = None, kwargs: <class 'inspect._empty'>)`

Constructs a Gradio app automatically from a Hugging Face model/Space repo name or a 3rd-party API provider. Note that if a Space repo is loaded, certain high-level attributes of the Blocks (e.g. custom `css`, `js`, and `head` attributes) will not be loaded.

### `load_chat(base_url: str, model: str, token: str | None = None, file_types: Literal['text_encoded', 'image'] | list[Literal['text_encoded', 'image']] | None = "text_encoded", system_message: str | None = None, streaming: bool = True, kwargs: <class 'inspect._empty'>)`

Load a chat interface from an OpenAI API chat compatible endpoint.

### `load_openapi(openapi_spec: str | dict, base_url: str, paths: list[str] | None = None, exclude_paths: list[str] | None = None, methods: list[Literal['get', 'post', 'put', 'patch', 'delete']] | None = None, auth_token: str | None = None, interface_kwargs: <class 'inspect._empty'>)`

Load a Gradio app from an OpenAPI v3 specification.

### `on(triggers: Sequence[EventListenerCallable] | EventListenerCallable | None = None, fn: Callable[..., Any] | None | Literal['decorator'] = "decorator", inputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, outputs: Component | BlockContext | Sequence[Component | BlockContext] | Set[Component | BlockContext] | None = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", api_name: str | None = None, api_description: str | None | Literal[False] = None, scroll_to_output: bool = False, show_progress: Literal['full', 'minimal', 'hidden'] = "full", show_progress_on: Component | Sequence[Component] | None = None, queue: bool = True, batch: bool = False, max_batch_size: int = 4, preprocess: bool = True, postprocess: bool = True, cancels: dict[str, Any] | list[dict[str, Any]] | None = None, trigger_mode: Literal['once', 'multiple', 'always_last'] | None = None, js: str | Literal[True] | None = None, concurrency_limit: int | None | Literal['default'] = "default", concurrency_id: str | None = None, time_limit: int | None = None, stream_every: float = 0.5, key: int | str | tuple[int | str, ...] | None = None, validator: Callable | None = None)`

Sets up an event listener that triggers a function when the specified event(s) occur. This is especially useful when the same function should be triggered by multiple events. Only a single API endpoint is generated for all events in the triggers list.

### `set_static_paths(paths: str | Path | list[str | Path])`

Set the static paths to be served by the gradio app.   Static files are are served directly from the file system instead of being copied. They are served to users with The Content-Disposition HTTP header set to "inline" when sending these files to users. This indicates that the file should be displayed directly in the browser window if possible. This function is useful when you want to serve files that you know will not be modified during the lifetime of the gradio app (like files used in gr.Examples). By setting static paths, your app will launch faster and it will consume less disk space. Calling this function will set the static paths for all gradio applications defined in the same interpreter session until it is called again or the session ends.

### `skip()`

A special function that can be returned from a Gradio function to skip updating the output component. This may be useful when you want to update the output component conditionally, and in some cases, you want to skip updating the output component. If you have multiple output components, you can return `gr.skip()` as part of a tuple to skip updating a specific output component, or you can return a single `gr.skip()` to skip updating all output components.

### `validate(is_valid: bool, message: str)`

A special function that can be returned from a Gradio function to set the validation error of an output component.


## ChatInterface

### `ChatInterface(fn: Callable, multimodal: bool = False, chatbot: Chatbot | None = None, textbox: Textbox | MultimodalTextbox | None = None, additional_inputs: str | Component | list[str | Component] | None = None, additional_inputs_accordion: str | Accordion | None = None, additional_outputs: Component | list[Component] | None = None, editable: bool = False, examples: list[str] | list[MultimodalValue] | list[list] | None = None, example_labels: list[str] | None = None, example_icons: list[str] | None = None, run_examples_on_click: bool = True, cache_examples: bool | None = None, cache_mode: Literal['eager', 'lazy'] | None = None, title: str | I18nData | None = None, description: str | None = None, flagging_mode: Literal['never', 'manual'] | None = None, flagging_options: list[str] | tuple[str, ...] | None = ('Like', 'Dislike'), flagging_dir: str = ".gradio/flagged", analytics_enabled: bool | None = None, autofocus: bool = True, autoscroll: bool = True, submit_btn: str | bool | None = True, stop_btn: str | bool | None = True, concurrency_limit: int | None | Literal['default'] = "default", delete_cache: tuple[int, int] | None = None, show_progress: Literal['full', 'minimal', 'hidden'] = "minimal", fill_height: bool = True, fill_width: bool = False, api_name: str | None = None, api_description: str | None | Literal[False] = None, api_visibility: Literal['public', 'private', 'undocumented'] = "public", save_history: bool = False, validator: Callable | None = None)`

ChatInterface is Gradio's high-level abstraction for creating chatbot UIs, and allows you to create a web-based demo around a chatbot model in a few lines of code. Only one parameter is required: fn, which takes a function that governs the response of the chatbot based on the user input and chat history. Additional parameters can be used to control the appearance and behavior of the demo.


## Modals

### `Error(message: str = "Error raised.", duration: float | None = 10, visible: bool = True, title: str = "Error", print_exception: bool = True)`

This class allows you to pass custom error messages to the user. You can do so by raising a gr.Error("custom message") anywhere in the code, and when that line is executed the custom message will appear in a modal on the demo.

### `Info(message: str = "Info issued.", duration: float | None = 10, visible: bool = True, title: str = "Info")`

This function allows you to pass custom info messages to the user. You can do so simply by writing `gr.Info('message here')` in your function, and when that line is executed the custom message will appear in a modal on the demo. The modal is gray by default and has the heading: "Info." Queue must be enabled for this behavior; otherwise, the message will be printed to the console.

### `Success(message: str = "Success.", duration: float | None = 10, visible: bool = True, title: str = "Success")`

This function allows you to pass custom success messages to the user. You can do so simply by writing `gr.Success('message here')` in your function, and when that line is executed the custom message will appear in a modal on the demo. The modal is green by default and has the heading: "Success." Queue must be enabled for this behavior; otherwise, the message will be printed to the console.

### `Warning(message: str = "Warning issued.", duration: float | None = 10, visible: bool = True, title: str = "Warning")`

This function allows you to pass custom warning messages to the user. You can do so simply by writing `gr.Warning('message here')` in your function, and when that line is executed the custom message will appear in a modal on the demo. The modal is yellow by default and has the heading: "Warning." Queue must be enabled for this behavior; otherwise, the warning will be printed to the console using the `warnings` library.


## Routes

### `Header()`

A string that represents a header value in an incoming HTTP request to the Gradio app.   When you type a function argument of type `Header`, Gradio will automatically extract that header from the request and pass it to the function. Note that it's common for header values to use hyphens, e.g. `x-forwarded-host`, and these will automatically be converted to underscores. So make sure you use underscores in your function arguments.

### `Request(request: fastapi.Request | None = None, username: str | None = None, session_hash: str | None = None)`

A Gradio request object that can be used to access the request headers, cookies, query parameters and other information about the request from within the prediction function. The class is a thin wrapper around the fastapi.Request class. Attributes of this class include: `headers`, `client`, `query_params`, `session_hash`, and `path_params`. If auth is enabled, the `username` attribute can be used to get the logged in user. In some environments, the dict-like attributes (e.g. `requests.headers`, `requests.query_params`) of this class are automatically converted to dictionaries, so we recommend converting them to dictionaries before accessing attributes for consistent behavior in different environments.

### `mount_gradio_app(app: fastapi.FastAPI, blocks: gradio.Blocks, path: str, server_name: str = "0.0.0.0", server_port: int = 7860, footer_links: list[Literal['api', 'gradio', 'settings'] | dict[str, str]] | None = None, app_kwargs: dict[str, Any] | None = None, auth: Callable | tuple[str, str] | list[tuple[str, str]] | None = None, auth_message: str | None = None, auth_dependency: Callable[[fastapi.Request], str | None] | None = None, root_path: str | None = None, allowed_paths: list[str] | None = None, blocked_paths: list[str] | None = None, favicon_path: str | None = None, show_error: bool = True, max_file_size: str | int | None = None, ssr_mode: bool | None = None, node_server_name: str | None = None, node_port: int | None = None, enable_monitoring: bool | None = None, pwa: bool | None = None, i18n: I18n | None = None, mcp_server: bool | None = None, theme: Theme | str | None = None, css: str | None = None, css_paths: str | Path | Sequence[str | Path] | None = None, js: str | Literal[True] | None = None, head: str | None = None, head_paths: str | Path | Sequence[str | Path] | None = None)`

Mount a gradio.Blocks to an existing FastAPI application.


## Event Listeners

Event listeners respond to user interactions. All event listeners share the same signature pattern:

```python
component.event_name(fn, inputs, outputs, ...)
```

Each component supports specific events:

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
- **ColorPicker**: change, input, submit, focus, blur
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

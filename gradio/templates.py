from gradio import components


class Text(components.Textbox):
    """
    Sets: lines=1
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(lines=1)
        defaults.update(kwargs)
        super().__init__(**defaults)


class TextArea(components.Textbox):
    """
    Sets: lines=7
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(lines=7)
        defaults.update(kwargs)
        super().__init__(**defaults)


class Webcam(components.Image):
    """
    Sets: source="webcam"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(source="webcam", interactive=True)
        defaults.update(kwargs)
        super().__init__(**defaults)


class Sketchpad(components.Image):
    """
    Sets: image_mode="L", source="canvas", shape=(28, 28), invert_colors=True
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(
            image_mode="L",
            source="canvas",
            shape=(28, 28),
            invert_colors=True,
            interactive=True,
        )
        super().__init__(
            **kwargs
        )


class Paint(components.Image):
    """
    Sets: source="canvas", tool="color-sketch"
    """

    is_template = True

    def __init__(self, **kwargs):
        super().__init__(
            source="canvas", tool="color-sketch", interactive=True, **kwargs
        )


class ImageMask(components.Image):
    """
    Sets: source="canvas", tool="sketch"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(source="upload", tool="sketch", interactive=True)
        defaults.update(kwargs)
        super().__init__(**defaults)


class ImagePaint(components.Image):
    """
    Sets: source="upload", tool="color-sketch"
    """

    is_template = True

    def __init__(self, **kwargs):
        super().__init__(
            source="upload", tool="color-sketch", interactive=True, **kwargs
        )


class Pil(components.Image):
    """
    Sets: type="pil"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(type="pil")
        defaults.update(kwargs)
        super().__init__(**defaults)


class PlayableVideo(components.Video):
    """
    Sets: format="mp4"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(format="mp4")
        defaults.update(kwargs)
        super().__init__(**defaults)


class Microphone(components.Audio):
    """
    Sets: source="microphone"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(source="microphone")
        defaults.update(kwargs)
        super().__init__(**defaults)


class Mic(components.Audio):
    """
    Sets: source="microphone"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(source="microphone")
        defaults.update(kwargs)
        super().__init__(**defaults)


class Files(components.File):
    """
    Sets: file_count="multiple"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(file_count="multiple")
        defaults.update(kwargs)
        super().__init__(**defaults)


class Numpy(components.Dataframe):
    """
    Sets: type="numpy"
    """

    is_template = True

    def __init__(self, **kwargs):
        defaults = dict(type="numpy")
        defaults.update(kwargs)
        super().__init__(**defaults)


class Matrix(components.Dataframe):
    """
    Sets: type="array"
    """

    is_template = True

    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        defaults = dict(type="array")
        defaults.update(kwargs)
        super().__init__(**defaults)


class List(components.Dataframe):
    """
    Sets: type="array"
    """

    is_template = True

    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        defaults = dict(type="array", col_count=1)
        defaults.update(kwargs)
        super().__init__(**defaults)


class Highlight(components.HighlightedText):
    is_template = True

    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        defaults = dict(**kwargs)
        defaults.update(kwargs)
        super().__init__(**defaults)

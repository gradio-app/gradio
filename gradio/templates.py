from gradio import components


class Text(components.Textbox):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(lines=1, **kwargs)


class TextArea(components.Textbox):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(lines=7, **kwargs)


class Webcam(components.Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(source="webcam", **kwargs)


class Sketchpad(components.Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(
            image_mode="L",
            source="canvas",
            shape=(28, 28),
            invert_colors=True,
            **kwargs
        )


class Plot(components.Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="plot", **kwargs)


class Pil(components.Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="pil", **kwargs)


class PlayableVideo(components.Video):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="mp4", **kwargs)


class Microphone(components.Audio):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(source="microphone", **kwargs)


class Mic(components.Audio):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(source="microphone", **kwargs)


class Files(components.File):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(file_count="multiple", **kwargs)


class Numpy(components.Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="numpy", **kwargs)


class Matrix(components.Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="array", **kwargs)


class List(components.Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="array", col_count=1, **kwargs)


class Highlight(components.HighlightedText):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(**kwargs)

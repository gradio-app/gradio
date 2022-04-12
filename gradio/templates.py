from gradio.components import Audio, Dataframe, File, Image, Textbox, Video


class HugeTextbox(Textbox):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(lines=7, **kwargs)


class Webcam(Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(source="webcam", **kwargs)


class Sketchpad(Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(
            image_mode="L",
            source="canvas",
            shape=(28, 28),
            invert_colors=True,
            **kwargs
        )


class Plot(Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="plot", **kwargs)


class Pil(Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="pil", **kwargs)


class PlayableVideo(Video):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="mp4", **kwargs)


class Microphone(Audio):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(source="microphone", **kwargs)


class Files(File):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(file_count="multiple", **kwargs)


class Numpy(Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="numpy", **kwargs)


class Matrix(Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="array", **kwargs)


class List(Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        super().__init__(type="array", col_count=1, **kwargs)

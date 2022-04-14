from gradio.components import Audio as C_Audio
from gradio.components import Dataframe as C_Dataframe
from gradio.components import File as C_File
from gradio.components import Image as C_Image
from gradio.components import Textbox as C_Textbox
from gradio.components import Video as C_Video


class TextArea(C_Textbox):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(lines=7, **kwargs)


class Webcam(C_Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(source="webcam", **kwargs)


class Sketchpad(C_Image):
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


class Plot(C_Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="plot", **kwargs)


class Pil(C_Image):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="pil", **kwargs)


class PlayableVideo(C_Video):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="mp4", **kwargs)


class Microphone(C_Audio):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(source="microphone", **kwargs)


class C_Files(C_File):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(file_count="multiple", **kwargs)


class Numpy(C_Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="numpy", **kwargs)


class Matrix(C_Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="array", **kwargs)


class List(C_Dataframe):
    def __init__(self, **kwargs):
        """
        Custom component
        @param kwargs:
        """
        self.is_template = True
        super().__init__(type="array", col_count=1, **kwargs)

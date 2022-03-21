import pkg_resources

from gradio.blocks import Blocks, Column, Row, TabItem, Tabs
from gradio.components import (
    Textbox,
    Number,
    Slider,
    Checkbox,
    CheckboxGroup,
    Radio,
    Dropdown,
    Image,
    Video,
    Audio,
    File,
    Dataframe,
    Timeseries,
    State,
    Label,
    KeyValues,
    HighlightedText,
    JSON,
    HTML,
    Carousel,
    Chatbot,
    Markdown,
    Button,
)

from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.interface import Interface, close_all, reset_all
from gradio.mix import Parallel, Series
from gradio.routes import get_state, set_state

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

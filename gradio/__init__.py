import pkg_resources

import gradio.components as components
import gradio.inputs as inputs
import gradio.outputs as outputs
import gradio.processing_utils
import gradio.templates as Templates
from gradio.blocks import Blocks, Column, Row, TabItem, Tabs
from gradio.components import (
    HTML,
    JSON,
    Audio,
    Button,
    Carousel,
    Chatbot,
    Checkbox,
    CheckboxGroup,
    Dataframe,
    Dropdown,
    File,
    HighlightedText,
    Image,
    KeyValues,
    Label,
    Markdown,
    Number,
    Radio,
    Slider,
    Textbox,
    Timeseries,
    Variable,
    Video,
)
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.interface import Interface, TabbedInterface, close_all, reset_all
from gradio.mix import Parallel, Series
from gradio.routes import get_state, set_state

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

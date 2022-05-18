import pkg_resources

import gradio.components as components
import gradio.inputs as inputs
import gradio.outputs as outputs
import gradio.processing_utils
import gradio.templates
from gradio.blocks import Blocks
from gradio.components import (
    HTML,
    JSON,
    Audio,
    Button,
    Carousel,
    Chatbot,
    Checkbox,
    Checkboxgroup,
    CheckboxGroup,
    DataFrame,
    Dataframe,
    Dropdown,
    File,
    Gallery,
    Highlightedtext,
    HighlightedText,
    Image,
    Label,
    Markdown,
    Model3D,
    Number,
    Plot,
    Radio,
    Slider,
    StatusTracker,
    Textbox,
    TimeSeries,
    Timeseries,
    Variable,
    Video,
    component,
    update,
)
from gradio.external import load_interface
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.interface import Interface, TabbedInterface, close_all
from gradio.ipython_ext import load_ipython_extension
from gradio.layouts import Box, Column, Group, Row, TabItem, Tabs
from gradio.mix import Parallel, Series
from gradio.templates import (
    Files,
    Highlight,
    List,
    Matrix,
    Mic,
    Microphone,
    Numpy,
    Pil,
    PlayableVideo,
    Sketchpad,
    Text,
    TextArea,
    Webcam,
)

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

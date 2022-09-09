import pkgutil

import gradio.components as components
import gradio.inputs as inputs
import gradio.outputs as outputs
import gradio.processing_utils
import gradio.templates
from gradio.blocks import Blocks, skip, update
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
    ColorPicker,
    DataFrame,
    Dataframe,
    Dataset,
    Dropdown,
    File,
    Gallery,
    Highlightedtext,
    HighlightedText,
    Image,
    Interpretation,
    Json,
    Label,
    Markdown,
    Model3D,
    Number,
    Plot,
    Radio,
    Slider,
    State,
    StatusTracker,
    Textbox,
    TimeSeries,
    Timeseries,
    Variable,
    Video,
    component,
)
from gradio.examples import create_examples as Examples
from gradio.exceptions import Error
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetJSONSaver,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.interface import Interface, TabbedInterface, close_all
from gradio.ipython_ext import load_ipython_extension
from gradio.layouts import Accordion, Box, Column, Group, Row, Tab, TabItem, Tabs
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

current_pkg_version = pkgutil.get_data(__name__, "version.txt").decode("ascii").strip()
__version__ = current_pkg_version

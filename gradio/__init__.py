import pkg_resources

from gradio.blocks import Blocks, Column, Row, Tab
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.interface import Interface, close_all, reset_all
from gradio.mix import Parallel, Series
from gradio.routes import get_state, set_state
from gradio.static import Button, Markdown

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

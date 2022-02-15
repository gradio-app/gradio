import pkg_resources

from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    HuggingFaceDatasetSaver,
    SimpleCSVLogger,
)
from gradio.blocks import Blocks, Tab, Row, Column
from gradio.interface import Interface, close_all, reset_all
from gradio.mix import Parallel, Series
from gradio.routes import get_state, set_state
from gradio.static import Markdown, Button

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

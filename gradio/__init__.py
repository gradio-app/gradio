import pkg_resources

from gradio.routes import get_state, set_state
from gradio.flagging import FlaggingCallback, SimpleCSVLogger, CSVLogger, HuggingFaceDatasetSaver
from gradio.interface import Interface, close_all, reset_all
from gradio.mix import Parallel, Series

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version

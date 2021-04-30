from gradio.interface import *  # This makes it possible to import `Interface` as `gradio.Interface`.
from gradio.external import load_interface
from gradio.compound import Parallel, Sequential
import pkg_resources

current_pkg_version = pkg_resources.require("gradio")[0].version
__version__ = current_pkg_version
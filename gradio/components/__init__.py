from gradio.components.annotated_image import AnnotatedImage
from gradio.components.audio import Audio
from gradio.components.bar_plot import BarPlot
from gradio.components.base import (
    Column,
    Component,
    Form,
    FormComponent,
    IOComponent,
    Row,
    _Keywords,
    component,
    get_component_instance,
)
from gradio.components.button import Button
from gradio.components.carousel import Carousel
from gradio.components.chatbot import Chatbot
from gradio.components.checkbox import Checkbox
from gradio.components.checkboxgroup import CheckboxGroup
from gradio.components.clear_button import ClearButton
from gradio.components.code import Code
from gradio.components.color_picker import ColorPicker
from gradio.components.dataframe import Dataframe
from gradio.components.dataset import Dataset
from gradio.components.dropdown import Dropdown
from gradio.components.duplicate_button import DuplicateButton
from gradio.components.file import File
from gradio.components.gallery import Gallery
from gradio.components.highlighted_text import HighlightedText
from gradio.components.html import HTML
from gradio.components.image import Image
from gradio.components.interpretation import Interpretation
from gradio.components.json_component import JSON
from gradio.components.label import Label
from gradio.components.line_plot import LinePlot
from gradio.components.login_button import LoginButton
from gradio.components.logout_button import LogoutButton
from gradio.components.markdown import Markdown
from gradio.components.model3d import Model3D
from gradio.components.number import Number
from gradio.components.plot import Plot
from gradio.components.radio import Radio
from gradio.components.scatter_plot import ScatterPlot
from gradio.components.slider import Slider
from gradio.components.state import State, Variable
from gradio.components.status_tracker import StatusTracker
from gradio.components.textbox import Textbox
from gradio.components.timeseries import Timeseries
from gradio.components.upload_button import UploadButton
from gradio.components.video import Video

Text = Textbox
DataFrame = Dataframe
Highlightedtext = HighlightedText
Annotatedimage = AnnotatedImage
Highlight = HighlightedText
Checkboxgroup = CheckboxGroup
TimeSeries = Timeseries
Json = JSON

__all__ = [
    "Audio",
    "BarPlot",
    "Button",
    "Carousel",
    "Chatbot",
    "ClearButton",
    "Component",
    "component",
    "get_component_instance",
    "_Keywords",
    "Checkbox",
    "CheckboxGroup",
    "Code",
    "ColorPicker",
    "Column",
    "Dataframe",
    "DataFrame",
    "Dataset",
    "DuplicateButton",
    "Form",
    "FormComponent",
    "Gallery",
    "HTML",
    "Image",
    "IOComponent",
    "Interpretation",
    "JSON",
    "Json",
    "Label",
    "LinePlot",
    "LoginButton",
    "LogoutButton",
    "Markdown",
    "Textbox",
    "Dropdown",
    "Model3D",
    "File",
    "HighlightedText",
    "AnnotatedImage",
    "CheckboxGroup",
    "Timeseries",
    "Text",
    "Highlightedtext",
    "Annotatedimage",
    "Highlight",
    "Checkboxgroup",
    "TimeSeries",
    "Number",
    "Plot",
    "Radio",
    "Row",
    "ScatterPlot",
    "Slider",
    "State",
    "Variable",
    "StatusTracker",
    "UploadButton",
    "Video",
]

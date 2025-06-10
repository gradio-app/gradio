from typing import TYPE_CHECKING
import lazy_loader as lazy

__lazy_getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=[],
    submod_attrs={
        'annotated_image': ['AnnotatedImage'],
        'audio': ['Audio'],
        'base': [
            'Component',
            'FormComponent',
            'StreamingInput',
            'StreamingOutput',
            '_Keywords',
            'component',
            'get_component_instance',
        ],
        'browser_state': ['BrowserState'],
        'button': ['Button'],
        'chatbot': ['Chatbot', 'ChatMessage', 'MessageDict'],
        'checkbox': ['Checkbox'],
        'checkboxgroup': ['CheckboxGroup'],
        'clear_button': ['ClearButton'],
        'code': ['Code'],
        'color_picker': ['ColorPicker'],
        'dataframe': ['Dataframe'],
        'dataset': ['Dataset'],
        'datetime': ['DateTime'],
        'deep_link_button': ['DeepLinkButton'],
        'download_button': ['DownloadButton'],
        'dropdown': ['Dropdown'],
        'duplicate_button': ['DuplicateButton'],
        'fallback': ['Fallback'],
        'file': ['File'],
        'file_explorer': ['FileExplorer'],
        'gallery': ['Gallery'],
        'highlighted_text': ['HighlightedText'],
        'html': ['HTML'],
        'image': ['Image'],
        'image_editor': ['ImageEditor'],
        'imageslider': ['ImageSlider'],
        'json_component': ['JSON'],
        'label': ['Label'],
        'login_button': ['LoginButton'],
        'markdown': ['Markdown'],
        'model3d': ['Model3D'],
        'multimodal_textbox': ['MultimodalTextbox'],
        'native_plot': ['BarPlot', 'LinePlot', 'NativePlot', 'ScatterPlot'],
        'number': ['Number'],
        'paramviewer': ['ParamViewer'],
        'plot': ['Plot'],
        'radio': ['Radio'],
        'slider': ['Slider'],
        'state': ['State'],
        'textbox': ['Textbox'],
        'timer': ['Timer'],
        'upload_button': ['UploadButton'],
        'video': ['Video'],
        'layouts': ['Form'],
    }
)

_aliases = {
    'Text': 'Textbox',
    'DataFrame': 'Dataframe',
    'Highlightedtext': 'HighlightedText',
    'Annotatedimage': 'AnnotatedImage',
    'Highlight': 'HighlightedText',
    'Checkboxgroup': 'CheckboxGroup',
    'Json': 'JSON',
}

def __getattr__(name):
    # Handle alias mapping
    if name in _aliases:
        return __lazy_getattr__(_aliases[name])
    return __lazy_getattr__(name)

__all__.extend(_aliases.keys())

# Needed so static type inference doesn't break
# Make sure these imports stay synchronized with the lazy imports above
if TYPE_CHECKING:
    from gradio.components.annotated_image import AnnotatedImage
    from gradio.components.audio import Audio
    from gradio.components.base import (
        Component,
        FormComponent,
        StreamingInput,
        StreamingOutput,
        _Keywords,
        component,
        get_component_instance,
    )
    from gradio.components.browser_state import BrowserState
    from gradio.components.button import Button
    from gradio.components.chatbot import Chatbot, ChatMessage, MessageDict
    from gradio.components.checkbox import Checkbox
    from gradio.components.checkboxgroup import CheckboxGroup
    from gradio.components.clear_button import ClearButton
    from gradio.components.code import Code
    from gradio.components.color_picker import ColorPicker
    from gradio.components.dataframe import Dataframe
    from gradio.components.dataset import Dataset
    from gradio.components.datetime import DateTime
    from gradio.components.deep_link_button import DeepLinkButton
    from gradio.components.download_button import DownloadButton
    from gradio.components.dropdown import Dropdown
    from gradio.components.duplicate_button import DuplicateButton
    from gradio.components.fallback import Fallback
    from gradio.components.file import File
    from gradio.components.file_explorer import FileExplorer
    from gradio.components.gallery import Gallery
    from gradio.components.highlighted_text import HighlightedText
    from gradio.components.html import HTML
    from gradio.components.image import Image
    from gradio.components.image_editor import ImageEditor
    from gradio.components.imageslider import ImageSlider
    from gradio.components.json_component import JSON
    from gradio.components.label import Label
    from gradio.components.login_button import LoginButton
    from gradio.components.markdown import Markdown
    from gradio.components.model3d import Model3D
    from gradio.components.multimodal_textbox import MultimodalTextbox
    from gradio.components.native_plot import BarPlot, LinePlot, NativePlot, ScatterPlot
    from gradio.components.number import Number
    from gradio.components.paramviewer import ParamViewer
    from gradio.components.plot import Plot
    from gradio.components.radio import Radio
    from gradio.components.slider import Slider
    from gradio.components.state import State
    from gradio.components.textbox import Textbox
    from gradio.components.timer import Timer
    from gradio.components.upload_button import UploadButton
    from gradio.components.video import Video
    from gradio.layouts import Form

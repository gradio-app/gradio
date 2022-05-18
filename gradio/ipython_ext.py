try:
    from IPython.core.magic import register_cell_magic
except ImportError:
    pass

import gradio

demo = gradio.Blocks()

def load_ipython_extension(ipython):
    @register_cell_magic
    def blocks(line, cell):
        if "imp" in line:
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
            from gradio.flagging import (
                CSVLogger,
                FlaggingCallback,
                HuggingFaceDatasetSaver,
                SimpleCSVLogger,
            )
            from gradio.interface import Interface, TabbedInterface, close_all
            from gradio.layouts import Box, Column, Group, Row, TabItem, Tabs
            from gradio.mix import Parallel, Series
            from gradio.templates import (
                Text,
                TextArea,
                Webcam,
                Sketchpad,
                Pil,
                PlayableVideo,
                Microphone,
                Mic,
                Files,
                Numpy,
                Matrix,
                List,
                Highlight
            )            
        with demo.clear():
            exec(cell)
            demo.launch(verbose=False)

# This file is used to embed components in gradio.app/docs

import gradio as gr


with gr.Blocks() as Textbox_demo:
    gr.Textbox()

with gr.Blocks() as Number_demo:
    gr.Number()

with gr.Blocks() as Slider_demo:
    gr.Slider()

with gr.Blocks() as Checkbox_demo:
    gr.Checkbox()

with gr.Blocks() as CheckboxGroup_demo:
    gr.CheckboxGroup(choices=["First Choice", "Second Choice", "Third Choice"])

with gr.Blocks() as Radio_demo:
    gr.Radio(choices=["First Choice", "Second Choice", "Third Choice"])

with gr.Blocks() as Dropdown_demo:
    gr.Dropdown(choices=["First Choice", "Second Choice", "Third Choice"])

with gr.Blocks() as Image_demo:
    gr.Image()

with gr.Blocks() as Video_demo:
    gr.Video()

with gr.Blocks() as Audio_demo:
    gr.Audio()

with gr.Blocks() as File_demo:
    gr.File()

with gr.Blocks() as Dataframe_demo:
    gr.Dataframe(interactive=True)

with gr.Blocks() as Timeseries_demo:
    gr.Timeseries()

with gr.Blocks() as State_demo:
    gr.State()

with gr.Blocks() as Button_demo:
    gr.Button()

with gr.Blocks() as ColorPicker_demo:
    gr.ColorPicker()

with gr.Blocks() as Label_demo:
    gr.Label(value={"First Label": 0.7, "Second Label": 0.2, "Third Label": 0.1})

with gr.Blocks() as HighlightedText_demo:
    gr.HighlightedText(value=[("Text","Label 1"),("to be","Label 2"),("highlighted","Label 3")])

with gr.Blocks() as JSON_demo:
    gr.JSON(value={"Key 1": "Value 1", "Key 2": {"Key 3": "Value 2", "Key 4": "Value 3"}, "Key 5": ["Item 1", "Item 2", "Item 3"]})

with gr.Blocks() as HTML_demo:
    gr.HTML(value="<p style='margin-top: 1rem, margin-bottom: 1rem'>Gradio Docs Readers: <img src='https://visitor-badge.glitch.me/badge?page_id=gradio-docs-visitor-badge' alt='visitor badge' style='display: inline-block'/></p>")

with gr.Blocks() as Gallery_demo:
    cheetahs = [
        "https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg",
        "https://img.etimg.com/thumb/msid-50159822,width-650,imgsize-129520,,resizemode-4,quality-100/.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-002.jpg",
        "https://images.theconversation.com/files/375893/original/file-20201218-13-a8h8uq.jpg?ixlib=rb-1.1.0&rect=16%2C407%2C5515%2C2924&q=45&auto=format&w=496&fit=clip",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeSdQE5kHykTdB970YGSW3AsF6MHHZzY4QiQ&usqp=CAU",
        "https://www.lifegate.com/app/uploads/ghepardo-primo-piano.jpg",
        "https://i.natgeofe.com/n/60004bcc-cd85-4401-8bfa-6f96551557db/cheetah-extinction-3_3x4.jpg",
        "https://qph.cf2.quoracdn.net/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq"
    ]
    gr.Gallery(value=cheetahs)

with gr.Blocks() as Chatbot_demo:
    gr.Chatbot(value=[["Hello World","Hey Gradio!"],["❤️","😍"],["🔥","🤗"]])

with gr.Blocks() as Model3D_demo:
    gr.Model3D()

import matplotlib.pyplot as plt
import numpy as np

Fs = 8000
f = 5
sample = 8000
x = np.arange(sample)
y = np.sin(2 * np.pi * f * x / Fs)
plt.plot(x, y)

with gr.Blocks() as Plot_demo:
    gr.Plot(value=plt)

with gr.Blocks() as Markdown_demo:
    gr.Markdown(value="This _example_ was **written** in [Markdown](https://en.wikipedia.org/wiki/Markdown)\n")
# A Blocks implementation of https://erlj.notion.site/Neural-Instrument-Cloning-from-very-few-samples-2cf41d8b630842ee8c7eb55036a1bfd6

import datetime
import os
import random

import gradio as gr
from gradio.components import Markdown as m


def get_time():
    now = datetime.datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")


def generate_recording():
    return random.choice(["new-sax-1.mp3", "new-sax-1.wav"])


def reconstruct(audio):
    return random.choice(["new-sax-1.mp3", "new-sax-1.wav"])


io1 = gr.Interface(
    lambda x, y, z: os.path.join(os.path.dirname(__file__),"sax.wav"),
    [
        gr.Slider(label="pitch"),
        gr.Slider(label="loudness"),
        gr.Audio(label="base audio file (optional)"),
    ],
    gr.Audio(),
)

io2 = gr.Interface(
    lambda x, y, z: os.path.join(os.path.dirname(__file__),"flute.wav"),
    [
        gr.Slider(label="pitch"),
        gr.Slider(label="loudness"),
        gr.Audio(label="base audio file (optional)"),
    ],
    gr.Audio(),
)

io3 = gr.Interface(
    lambda x, y, z: os.path.join(os.path.dirname(__file__),"trombone.wav"),
    [
        gr.Slider(label="pitch"),
        gr.Slider(label="loudness"),
        gr.Audio(label="base audio file (optional)"),
    ],
    gr.Audio(),
)

io4 = gr.Interface(
    lambda x, y, z: os.path.join(os.path.dirname(__file__),"sax2.wav"),
    [
        gr.Slider(label="pitch"),
        gr.Slider(label="loudness"),
        gr.Audio(label="base audio file (optional)"),
    ],
    gr.Audio(),
)

demo = gr.Blocks()

with demo.clear():
    m(
        """
    ## Neural Instrument Cloning from Very Few Samples
    <center><img src="https://media.istockphoto.com/photos/brass-trombone-picture-id490455809?k=20&m=490455809&s=612x612&w=0&h=l9KJvH_25z0QTLggHrcH_MsR4gPLH7uXwDPUAZ_C5zk=" width="400px"></center>"""
    )
    m(
        """
    This Blocks implementation is an adaptation [a report written](https://erlj.notion.site/Neural-Instrument-Cloning-from-very-few-samples-2cf41d8b630842ee8c7eb55036a1bfd6) by Nicolas Jonason and Bob L.T. Sturm.
    
    I've implemented it in Blocks to show off some cool features, such as embedding live ML demos. More on that ahead...
    
    ### What does this machine learning model do?
    It combines techniques from neural voice cloning with musical instrument synthesis. This makes it possible to produce neural instrument synthesisers from just seconds of target instrument audio.
    
    ### Audio Examples
    Here are some **real** 16 second saxophone recordings:
    """
    )
    gr.Audio(os.path.join(os.path.dirname(__file__),"sax.wav"), label="Here is a real 16 second saxophone recording:")
    gr.Audio(os.path.join(os.path.dirname(__file__),"sax.wav"))

    m(
        """\n
        Here is a **generated** saxophone recordings:"""
    )
    a = gr.Audio(os.path.join(os.path.dirname(__file__),"new-sax.wav"))

    gr.Button("Generate a new saxophone recording")

    m(
        """
    ### Inputs to the model
    The inputs to the model are:
    * pitch
    * loudness
    * base audio file
    """
    )

    m(
        """
    Try the model live!
    """
    )

    gr.TabbedInterface(
        [io1, io2, io3, io4], ["Saxophone", "Flute", "Trombone", "Another Saxophone"]
    )

    m(
        """
    ### Using the model for cloning
    You can also use this model a different way, to simply clone the audio file and reconstruct it 
    using machine learning. Here, we'll show a demo of that below:
    """
    )

    a2 = gr.Audio()
    a2.change(reconstruct, a2, a2)

    m(
        """
    Thanks for reading this! As you may have realized, all of the "models" in this demo are fake. They are just designed to show you what is possible using Blocks 🤗.
    
    For details of the model, read the [original report here](https://erlj.notion.site/Neural-Instrument-Cloning-from-very-few-samples-2cf41d8b630842ee8c7eb55036a1bfd6).
    
    *Details for nerds*: this report was "launched" on:
    """
    )

    t = gr.Textbox(label="timestamp")

    demo.load(get_time, [], t)


if __name__ == "__main__":
    demo.launch()

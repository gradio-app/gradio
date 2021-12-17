import gradio as gr
import numpy as np

CHOICES = ["foo", "bar", "baz"]

def fn(text1, text2, num, slider1, slider2, single_checkbox,
       checkboxes, radio, dropdown, im1, im2, im3, im4, video, audio1,
       audio2, file, df1, df2):
    return (
        (text1 if single_checkbox else text2) +
        ", selected:" + ", ".join(checkboxes),  # Text
        {
            "positive": num / (num + slider1 + slider2),
            "negative": slider1 / (num + slider1 + slider2),
            "neutral": slider2 / (num + slider1 + slider2),
        },  # Label
        (audio1[0], np.flipud(audio1[1])) if audio1 is not None else "files/cantina.wav",  # Audio
        np.flipud(im1) if im1 is not None else "files/cheetah1.jpg",  # Image
        video,  # Video
        [("Height", 70), ("Weight", 150), ("BMI", "22"), (dropdown, 42)],  # KeyValues
        [("The", "art"), (" ", None), ("quick", "adj"), (" ", None),
         ("brown", "adj"), (" ", None), ("fox", "noun")],  # HighlightedText
        {"name": "Jane", "age": 34, "children": checkboxes},  # JSON
        "<button style='background-color: red'>Click Me: " + radio + "</button>",  # HTML
        "files/titanic.csv",
        np.ones((4, 3)),  # Dataframe
        [im for im in [im1, im2, im3, im4, "files/cheetah1.jpg"] if im is not None],  # Carousel
        df2  # Timeseries
    )


iface = gr.Interface(
    fn,
    inputs=[
        gr.inputs.Textbox(default="Lorem ipsum", label="Textbox"),
        gr.inputs.Textbox(lines=3, placeholder="Type here..",
                          label="Textbox 2"),
        gr.inputs.Number(label="Number", default=42),
        gr.inputs.Slider(minimum=10, maximum=20, default=15,
                         label="Slider: 10 - 20"),
        gr.inputs.Slider(maximum=20, step=0.04,
                         label="Slider: step @ 0.04"),
        gr.inputs.Checkbox(label="Checkbox"),
        gr.inputs.CheckboxGroup(label="CheckboxGroup",
                                choices=CHOICES, default=CHOICES[0:2]),
        gr.inputs.Radio(label="Radio", choices=CHOICES, default=CHOICES[2]),
        gr.inputs.Dropdown(label="Dropdown", choices=CHOICES),
        gr.inputs.Image(label="Image", optional=True),
        gr.inputs.Image(label="Image w/ Cropper",
                        tool="select", optional=True),
        gr.inputs.Image(label="Sketchpad", source="canvas", optional=True),
        gr.inputs.Image(label="Webcam", source="webcam", optional=True),
        gr.inputs.Video(label="Video", optional=True),
        gr.inputs.Audio(label="Audio", optional=True),
        gr.inputs.Audio(label="Microphone",
                        source="microphone", optional=True),
        gr.inputs.File(label="File", optional=True),
        gr.inputs.Dataframe(),
        gr.inputs.Timeseries(x="time", y="value", optional=True),
    ],
    outputs=[
        gr.outputs.Textbox(),
        gr.outputs.Label(),
        gr.outputs.Audio(),
        gr.outputs.Image(),
        gr.outputs.Video(),
        gr.outputs.KeyValues(),
        gr.outputs.HighlightedText(),
        gr.outputs.JSON(),
        gr.outputs.HTML(),
        gr.outputs.File(),
        gr.outputs.Dataframe(),
        gr.outputs.Carousel("image"),
        gr.outputs.Timeseries(x="time", y="value")
    ],
    theme="huggingface",
    title="Kitchen Sink",
    description="Try out all the components!",
    article="Learn more about [Gradio](http://gradio.app)"
)

if __name__ == "__main__":
    iface.launch()

import gradio as gr
import numpy as np
# get_image(), get_video(), get_audio(), get_file(), get_model3d() return file paths to sample media included with Gradio
from gradio.media import get_image, get_video, get_audio, get_file, get_model3d

txt = "the quick brown fox"
num = 10

img = get_image("cheetah1.jpg")
vid = get_video("world.mp4")
audio = get_audio("cantina.wav")
csv = get_file("time.csv")
model = get_model3d("Bunny.obj")

dataframe = [[1, 2, 3, 4], [4, 5, 6, 7], [8, 9, 1, 2], [3, 4, 5, 6]]

with gr.Blocks() as demo:
    gr.Markdown("# Dataset previews")
    a = gr.Audio(visible=False)
    gr.Dataset(
        components=[a],
        label="Audio",
        samples=[
            [audio],
            [audio],
            [audio],
            [audio],
            [audio],
            [audio],
        ],
    )
    c = gr.Checkbox(visible=False)
    gr.Dataset(
        label="Checkbox",
        components=[c],
        samples=[[True], [True], [False], [True], [False], [False]],
    )

    c_2 = gr.CheckboxGroup(visible=False, choices=['a', 'b', 'c'])
    gr.Dataset(
        label="CheckboxGroup",
        components=[c_2],
        samples=[
            [["a"]],
            [["a", "b"]],
            [["a", "b", "c"]],
            [["b"]],
            [["c"]],
            [["a", "c"]],
        ],
    )
    c_3 = gr.ColorPicker(visible=False)
    gr.Dataset(
        label="ColorPicker",
        components=[c_3],
        samples=[
            ["#FFFFFF"],
            ["#000000"],
            ["#FFFFFF"],
            ["#000000"],
            ["#FFFFFF"],
            ["#000000"],
        ],
    )
    d = gr.DataFrame(visible=False)
    gr.Dataset(
        components=[d],
        label="Dataframe",
        samples=[
            [np.zeros((3, 3)).tolist()],
            [np.ones((2, 2)).tolist()],
            [np.random.randint(0, 10, (3, 10)).tolist()],
            [np.random.randint(0, 10, (10, 3)).tolist()],
            [np.random.randint(0, 10, (10, 10)).tolist()],
        ],
    )
    d_2 = gr.Dropdown(visible=False, choices=["one", "two", "three"])
    gr.Dataset(
        components=[d_2],
        label="Dropdown",
        samples=[["one"], ["two"], ["three"], ["one"], ["two"], ["three"]],
    )
    f = gr.File(visible=False)
    gr.Dataset(
        components=[f],
        label="File",
        samples=[
            [csv],
            [csv],
            [csv],
            [csv],
            [csv],
            [csv],
        ],
    )
    h = gr.HTML(visible=False)
    gr.Dataset(
        components=[h],
        label="HTML",
        samples=[
            ["<h1>hi</h2>"],
            ["<h1>hi</h2>"],
            ["<h1>hi</h2>"],
            ["<h1>hi</h2>"],
            ["<h1>hi</h2>"],
            ["<h1>hi</h2>"],
        ],
    )
    i = gr.Image(visible=False)
    gr.Dataset(
        components=[i],
        label="Image",
        samples=[[img], [img], [img], [img], [img], [img]],
    )
    m = gr.Markdown(visible=False)
    gr.Dataset(
        components=[m],
        label="Markdown",
        samples=[
            ["# hi"],
            ["# hi"],
            ["# hi"],
            ["# hi"],
            ["# hi"],
            ["# hi"],
        ],
    )
    m_2 = gr.Model3D(visible=False)
    gr.Dataset(
        components=[m_2],
        label="Model3D",
        samples=[[model], [model], [model], [model], [model], [model]],
    )
    n = gr.Number(visible=False)
    gr.Dataset(
        label="Number",
        components=[n],
        samples=[[1], [1], [1], [1], [1], [1]],
    )
    r = gr.Radio(visible=False, choices=["one", "two", "three"])
    gr.Dataset(
        components=[r],
        label="Radio",
        samples=[["one"], ["two"], ["three"], ["one"], ["two"], ["three"]],
    )
    s = gr.Slider(visible=False)
    gr.Dataset(
        label="Slider",
        components=[s],
        samples=[[1], [1], [1], [1], [1], [1]],
    )
    t = gr.Textbox(visible=False)
    gr.Dataset(
        label="Textbox",
        components=[t],
        samples=[
            ["Some value"],
            ["Some value"],
            ["Some value"],
            ["Some value"],
            ["Some value"],
            ["Some value"],
        ],
    )
    v = gr.Video(visible=False)
    gr.Dataset(
        components=[v],
        label="Video",
        samples=[[vid], [vid], [vid], [vid], [vid], [vid]],
    )

if __name__ == "__main__":
    demo.launch()

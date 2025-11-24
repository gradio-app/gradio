import gradio as gr
# get_video() returns the file path to sample videos included with Gradio
from gradio.media import get_video

demo = gr.Interface(
    fn=lambda x: x,
    inputs=gr.Video(),
    outputs=gr.Video(),
    examples=[
        [get_video("world.mp4")],
        [get_video("a.mp4")],
        [get_video("b.mp4")],
    ],
    cache_examples=True,
    api_name="predict"
)

if __name__ == "__main__":
    demo.launch()

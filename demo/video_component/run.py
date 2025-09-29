import gradio as gr
from gradio.media import get_video

demo = gr.Interface(
    fn=lambda x: x,
    inputs=gr.Video(),
    outputs=gr.Video(),
    examples=[
        [get_video("world")],
        [get_video("video_a")],
        [get_video("video_b")],
    ],
    cache_examples=True
)

if __name__ == "__main__":
    demo.launch()

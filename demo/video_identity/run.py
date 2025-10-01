import gradio as gr
from gradio.media import get_video

def video_identity(video):
    return video

# get_video() returns file paths to sample media included with Gradio
demo = gr.Interface(video_identity,
                    gr.Video(),
                    "playable_video",
                    examples=[
                        get_video("b.mp4")  # Using media system video
                    ],
                    cache_examples=True)

if __name__ == "__main__":
    demo.launch()

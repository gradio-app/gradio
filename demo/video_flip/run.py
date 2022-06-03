import gradio as gr
import os


def video_flip(video):
    return video


demo = gr.Interface(video_flip, gr.Video(), "playable_video", 
                examples=[os.path.join(os.path.dirname(__file__), "video/video_sample.mp4")], 
                    cache_examples=True)

if __name__ == "__main__":
    demo.launch()

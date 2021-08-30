# Demo: (Video) -> (Image)

import gradio as gr


def video_flip(video):
    return video


iface = gr.Interface(video_flip, gr.inputs.Video(type=None),  "video")

if __name__ == "__main__":
    iface.launch()

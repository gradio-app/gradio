# Demo: (Video) -> (Image)

import gradio as gr


def video_flip(video):
    return video[:-4]


iface = gr.Interface(video_flip, "video",  "video")

if __name__ == "__main__":
    iface.launch()

import gradio as gr

def video_flip(video):
    return video

iface = gr.Interface(
    video_flip, "video", "playable_video", theme="huggingface",
    examples=[
        ["files/video.avi"],
        ["files/video.mp4"]
    ])

if __name__ == "__main__":
    iface.launch()

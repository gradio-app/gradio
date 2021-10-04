import gradio as gr

def video_flip(video):
    return video

iface = gr.Interface(
    video_flip, "video", "playable_video", theme="huggingface")

if __name__ == "__main__":
    iface.launch()

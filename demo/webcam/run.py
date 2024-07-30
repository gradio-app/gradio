
import gradio as gr

def snap(image, video):
    return [image, video]

demo = gr.Interface(
    snap,
    [gr.Image(sources=["webcam"]), gr.Video(sources=["webcam"])],
    ["image", "video"],
)

if __name__ == "__main__":
    demo.launch()

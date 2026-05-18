import gradio as gr


def process(value):
    if value is None:
        return None, None
    return value.get("video"), value.get("mask")


with gr.Blocks() as demo:
    gr.Markdown("## VideoEditor: draw a mask on a video frame")

    editor = gr.VideoEditor(label="Upload a video and draw a mask")

    btn = gr.Button("Submit", variant="primary")

    with gr.Row():
        video_out = gr.Video(label="Video")
        mask_out = gr.Image(label="Mask (PNG)")

    btn.click(fn=process, inputs=editor, outputs=[video_out, mask_out])


if __name__ == "__main__":
    demo.launch()

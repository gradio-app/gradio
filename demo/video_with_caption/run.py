import gradio as gr

css = (
    "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
)

with gr.Blocks(css=css) as demo:
    # gr.Video()
    gr.VideoWithCaption(
        label="Video File Test",
        show_label=True,
        interactive=True,
        value=["mp4/en.mp4", "tmp/en.vtt"],
    )

demo.launch()

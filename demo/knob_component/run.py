import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        gr.Knob(label="Attack")
        gr.Knob(label="Decay")
        gr.Knob(label="Sustain")
        gr.Knob(label="Release")
        gr.Knob(-10, 10, 0, label="LFO", interactive=True)
        gr.Knob(0, 11, label="Volume", interactive=True)

demo.launch()

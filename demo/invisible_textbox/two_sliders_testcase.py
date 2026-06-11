import gradio as gr

with gr.Blocks() as demo:
    btn = gr.Button("Show")
    s1 = gr.Slider(0, 1, value=0, visible=False, elem_id="slider-1")
    s2 = gr.Slider(0, 1, value=0, visible=False, elem_id="slider-2")
    btn.click(
        lambda: (gr.Slider(visible=True), gr.Slider(visible=True)), None, [s1, s2]
    )

if __name__ == "__main__":
    demo.launch()

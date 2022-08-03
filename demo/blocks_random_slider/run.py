
import gradio as gr


def func(slider_1, slider_2):
    return slider_1 * 5 + slider_2


with gr.Blocks() as demo:
    slider = gr.Slider(minimum=-10.2, maximum=15, label="Random Slider (Static)", randomize=True)
    slider_1 = gr.Slider(minimum=100, maximum=200, label="Random Slider (Input 1)", randomize=True)
    slider_2 = gr.Slider(minimum=10, maximum=23.2, label="Random Slider (Input 2)", randomize=True)
    slider_3 = gr.Slider(value=3, label="Non random slider")
    btn = gr.Button("Run")
    btn.click(func, inputs=[slider_1, slider_2], outputs=gr.Number())

if __name__ == "__main__":
    demo.launch()

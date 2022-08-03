import gradio as gr


def func(slider_1, slider_2):
    return slider_1 + slider_2 * 5


demo = gr.Interface(
    func,
    [
        gr.Slider(minimum=1.5, maximum=250000.89, randomize=True),
        gr.Slider(value=15, minimum=5, maximum=30),
    ],
    "number",
    interpretation="default"
)

if __name__ == "__main__":
    demo.launch()

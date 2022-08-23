import gradio as gr


def func(slider_1, slider_2, *args):
    return slider_1 + slider_2 * 5


demo = gr.Interface(
    func,
    [
        gr.Slider(minimum=1.5, maximum=250000.89, randomize=True, label="Random Big Range"),
        gr.Slider(minimum=-1, maximum=1, randomize=True, step=0.05, label="Random only multiple of 0.05 allowed"),
        gr.Slider(minimum=0, maximum=1, randomize=True, step=0.25, label="Random only multiples of 0.25 allowed"),
        gr.Slider(minimum=-100, maximum=100, randomize=True, step=3, label="Random between -100 and 100 step 3"),
        gr.Slider(minimum=-100, maximum=100, randomize=True, label="Random between -100 and 100"),
        gr.Slider(value=0.25, minimum=5, maximum=30, step=-1),
    ],
    "number",
    interpretation="default"
)

if __name__ == "__main__":
    demo.launch()

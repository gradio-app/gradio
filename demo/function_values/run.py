import gradio as gr
import random

countries = [
    "Algeria",
    "Argentina",
    "Australia",
    "Brazil",
    "Canada",
    "China",
    "Democratic Republic of the Congo",
    "Greenland (Denmark)",
    "India",
    "Kazakhstan",
    "Mexico",
    "Mongolia",
    "Peru",
    "Russia",
    "Saudi Arabia",
    "Sudan",
    "United States",
]

with gr.Blocks() as demo:
    with gr.Row():
        count = gr.Slider(1, 10, step=1, label="Country Count")
        alpha_order = gr.Checkbox(True, label="Alphabetical Order")

    gr.JSON(
        lambda count, alpha_order: countries[:count]
        if alpha_order
        else countries[-count:],
        inputs=[count, alpha_order],
    )
    timer = gr.Timer(1)
    with gr.Row():
        gr.Textbox(
            lambda: random.choice(countries), label="Random Country", every=timer
        )
        gr.Textbox(
            lambda count: ", ".join(random.sample(countries, count)),
            inputs=count,
            label="Random Countries",
            every=timer,
        )
    with gr.Row():
        gr.Button("Start").click(lambda: gr.Timer(active=True), None, timer)
        gr.Button("Stop").click(lambda: gr.Timer(active=False), None, timer)

if __name__ == "__main__":
    demo.launch()

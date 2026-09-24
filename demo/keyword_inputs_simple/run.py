import gradio as gr


def greet(first_name: str, *, last_name: str) -> str:
    return f"Hello, {first_name} {last_name}!"


with gr.Blocks() as demo:
    first_name = gr.Textbox(label="First name")
    last_name = gr.Textbox(label="Last name")
    greeting = gr.Textbox(label="Greeting")
    greet_button = gr.Button("Greet", variant="primary")

    greet_button.click(
        greet,
        inputs=[first_name],
        inputs_kwargs={"last_name": last_name},
        outputs=greeting,
    )


if __name__ == "__main__":
    demo.launch()

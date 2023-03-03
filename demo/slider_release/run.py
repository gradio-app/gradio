import gradio as gr


def identity(x, state):
    state += 1
    return x, state, state


with gr.Blocks() as demo:
    slider = gr.Slider(0, 100, step=0.1)
    state = gr.State(value=0)
    with gr.Row():
        number = gr.Number(label="On release")
        number2 = gr.Number(label="Number of events fired")
    slider.release(identity, inputs=[slider, state], outputs=[number, state, number2], api_name="predict")

if __name__ == "__main__":
    print("here")
    demo.launch()
    print(demo.server_port)

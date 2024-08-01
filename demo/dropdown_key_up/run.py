import gradio as gr

def test(value, key_up_data: gr.KeyUpData):
    return {
        "component value": value,
        "input value": key_up_data.input_value,
        "key": key_up_data.key
    }

with gr.Blocks() as demo:
    d = gr.Dropdown(["abc", "def"], allow_custom_value=True)
    t = gr.JSON()
    d.key_up(test, d, t)

if __name__ == "__main__":
    demo.launch()

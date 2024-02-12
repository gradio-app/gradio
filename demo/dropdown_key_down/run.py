import gradio as gr

def test(value, key_down_data: gr.KeyDownData):
    return {
        "component value": value,
        "input value": key_down_data.input_value,
        "key": key_down_data.key
    }

with gr.Blocks() as demo:
    d = gr.Dropdown(["abc", "def"], allow_custom_value=True)
    t = gr.JSON()
    d.key_down(test, d, t)

if __name__ == "__main__":
    demo.launch()
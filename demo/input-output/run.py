import gradio as gr


def image_mod(text):
    return text[::-1]


demo = gr.Blocks()

with demo:
    text = gr.Textbox(label="Input-Output")
    btn = gr.Button("Run")
    btn.click(image_mod, text, text)

print(demo.get_config_file())

if __name__ == "__main__":
    demo.launch()

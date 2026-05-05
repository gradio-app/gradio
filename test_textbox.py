import gradio as gr

def echo(text_value):
    print("CALLED:", repr(text_value))
    return text_value

with gr.Blocks() as demo:
    one_line = gr.Textbox(label="Single Line")
    multi_line = gr.Textbox(lines=2, label="Multi Line")

    one_line.submit(fn=echo, inputs=one_line, outputs=one_line)
    multi_line.submit(fn=echo, inputs=multi_line, outputs=multi_line)

demo.launch()

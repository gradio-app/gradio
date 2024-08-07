import gradio as gr

with gr.Blocks() as demo:
    gr.HTML(label="testqwfasdf", value="<p style='margin-top: 1rem, margin-bottom: 1rem'>This <em>example</em> was <strong>written</strong> in <a href='https://en.wikipedia.org/wiki/HTML' _target='blank'>HTML</a> </p>", show_label=True)

demo.launch()

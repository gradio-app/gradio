import gradio as gr

def test_select_is_defined(n, evt: gr.SelectData):
    assert isinstance(evt.index, list)
    assert isinstance(evt.index[0], int)
    return n + 1

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_img = gr.Image(type="filepath", label="Input Image", sources=["upload", "clipboard"])
        with gr.Column():
            output_img = gr.Image(type="filepath", label="Output Image", sources=["upload", "clipboard"])
        with gr.Column():
            num_change = gr.Number(label="# Change Events", value=0)
            num_input = gr.Number(label="# Input Events", value=0)
            num_load = gr.Number(label="# Upload Events", value=0)
            num_change_o = gr.Number(label="# Change Events Output", value=0)
            num_clear = gr.Number(label="# Clear Events", value=0)
            num_select = gr.Number(label="# Select Events", value=0)

        input_img.upload(lambda s, n: (s, n + 1), [input_img, num_load], [output_img, num_load])
        input_img.input(lambda n: n + 1, num_input, num_input)
        input_img.change(lambda n: n + 1, num_change, num_change)
        input_img.clear(lambda n: n + 1, num_clear, num_clear)
        output_img.change(lambda n: n + 1, num_change_o, num_change_o)
        output_img.select(test_select_is_defined, num_select, num_select)

if __name__ == "__main__":
    demo.launch()

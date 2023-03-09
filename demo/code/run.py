import gradio as gr


def set_lang(language):
    print(language)
    return gr.Code.update(language=language)


def code(language, code):
    return gr.Code.update(code, language=language)


with gr.Blocks() as demo:
    lang = gr.Dropdown(value="python", choices=gr.Code.languages)
    with gr.Row():
        code_in = gr.Code(language="python", label="Input")
        code_out = gr.Code(label="Ouput")
    btn = gr.Button("Run")

    lang.change(set_lang, inputs=lang, outputs=code_in)
    btn.click(code, inputs=[lang, code_in], outputs=code_out)

demo.launch()

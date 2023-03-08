import gradio as gr
import os


def code(code):
    print(code)
    return code


langs = [
    "py",
    "python",
    "md",
    "markdown",
    "json",
    "html",
    "css",
    "js",
    "javascript",
    "ts",
    "typescript",
    "yaml",
    "yml",
    "dockerfile",
    "sh",
    "shell",
    "r",
]
css_file = os.path.join(os.path.dirname(__file__), "file.css")


def set_lang(lang, code):
    print(lang, code)
    return {"lang": lang, "code": code["code"]}


def set_lang_from_path():
    return {"path": css_file}


with gr.Blocks() as demo:
    lang = gr.Dropdown(value="python", choices=langs)
    with gr.Row():
        code_in = gr.Code(value={"lang": "py", "code": ""}, label="Input")
        code_out = gr.Code(label="Ouput")
    btn = gr.Button("Run")
    btn_two = gr.Button("Load File")

    lang.change(set_lang, inputs=[lang, code_in], outputs=[code_in])
    btn.click(code, inputs=code_in, outputs=code_out)
    btn_two.click(set_lang_from_path, inputs=None, outputs=code_out)

if __name__ == "__main__":
    demo.launch()

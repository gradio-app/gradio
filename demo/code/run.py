import gradio as gr


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


def set_lang(lang, code):
    print(lang, code)
    return {"lang": lang, "code": code["code"]}


with gr.Blocks() as demo:
    lang = gr.Dropdown(value="python", choices=langs)
    code_in = gr.Code(value={"lang": "py", "code": ""}, label="Input")
    code_out = gr.Code(label="Ouput")
    btn = gr.Button("Run")

    lang.change(set_lang, inputs=[lang, code_in], outputs=[code_in])
    btn.click(code, inputs=code_in, outputs=code_out)

if __name__ == "__main__":
    demo.launch()

from difflib import Differ

import gradio as gr


def diff_texts(text1, text2):
    d = Differ()
    return [
        (token[2:], token[0] if token[0] != " " else None)
        for token in d.compare(text1, text2)
    ]


iface = gr.Interface(
    diff_texts,
    [
        gr.inputs.Textbox(
            lines=3, default="The quick brown fox jumped over the lazy dogs."
        ),
        gr.inputs.Textbox(lines=3, default="The fast brown fox jumps over lazy dogs."),
    ],
    gr.outputs.HighlightedText(color_map={"+": "green", "-": "pink"}),
)
if __name__ == "__main__":
    iface.launch()

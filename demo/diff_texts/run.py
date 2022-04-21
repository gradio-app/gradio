from difflib import Differ

import gradio as gr


def diff_texts(text1, text2):
    d = Differ()
    return [
        (token[2:], token[0] if token[0] != " " else None)
        for token in d.compare(text1, text2)
    ]


demo = gr.Interface(
    diff_texts,
    [
        gr.Textbox(lines=3, default_value="The quick brown fox jumped over the lazy dogs."),
        gr.Textbox(lines=3, default_value="The fast brown fox jumps over lazy dogs."),
    ],
    gr.HighlightedText(),
)
if __name__ == "__main__":
    demo.launch()

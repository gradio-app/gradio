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
        gr.Textbox(
            label="Text 1",
            info="Initial text",
            lines=3,
            value="The quick brown fox jumped over the lazy dogs.",
        ),
        gr.Textbox(
            label="Text 2",
            info="Text to compare",
            lines=3,
            value="The fast brown fox jumps over lazy dogs.",
        ),
    ],
    gr.HighlightedText(
        label="Diff",
        combine_adjacent=True,
        show_legend=True,
    ).style(color_map={"+": "red", "-": "green"}),
    theme=gr.themes.Base()
)
if __name__ == "__main__":
    demo.launch()

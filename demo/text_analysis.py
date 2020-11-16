# Demo: (Textbox) -> (HighlightedText, KeyValues, HTML)

import spacy
from spacy import displacy
import gradio as gr

nlp = spacy.load("en_core_web_sm")


def text_analysis(text):
    doc = nlp(text)
    html = displacy.render(doc, style="dep", page=True)
    html = "<div style='max-width:100%; max-height:360px; overflow:auto'>" + html + "</div>"
    pos_count = {
        "char_count": len(text),
        "token_count": 0,
    }
    pos_tokens = []

    for token in doc:
        pos_tokens.extend([(token.text, token.pos_), (" ", None)])
    
    return pos_tokens, pos_count, html


iface = gr.Interface(
    text_analysis,
    gr.inputs.Textbox(placeholder="Enter sentence here..."),
    [
        "highlight", "key_values", "html"
    ],
    examples=[
        ["What a beautiful morning for a walk!"],
        ["It was the best of times, it was the worst of times."],
    ]
)

iface.test_launch()
if __name__ == "__main__":
    iface.launch()

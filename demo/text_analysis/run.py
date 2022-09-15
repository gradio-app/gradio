import gradio as gr
import os
os.system('python -m spacy download en_core_web_sm')
import spacy
from spacy import displacy

nlp = spacy.load("en_core_web_sm")

def text_analysis(text):
    doc = nlp(text)
    html = displacy.render(doc, style="dep", page=True)
    html = (
        "<div style='max-width:100%; max-height:360px; overflow:auto'>"
        + html
        + "</div>"
    )
    pos_count = {
        "char_count": len(text),
        "token_count": 0,
    }
    pos_tokens = []

    for token in doc:
        pos_tokens.extend([(token.text, token.pos_), (" ", None)])

    return pos_tokens, pos_count, html

demo = gr.Interface(
    text_analysis,
    gr.Textbox(placeholder="Enter sentence here..."),
    ["highlight", "json", "html"],
    examples=[
        ["What a beautiful morning for a walk!"],
        ["It was the best of times, it was the worst of times."],
    ],
)

demo.launch()

# URL: https://huggingface.co/spaces/gradio/text_analysis
# DESCRIPTION: This simple demo takes advantage of Gradio's HighlightedText, JSON and HTML outputs to create a clear NER segmentation.
# imports
import gradio as gr
import os
os.system('python -m spacy download en_core_web_sm')
import spacy
from spacy import displacy

# load the model
nlp = spacy.load("en_core_web_sm")

# define the core function
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

# define the interface, with a textbox input, and three outputs: HighlightedText, JSON, and HTML
demo = gr.Interface(
    text_analysis,
    gr.Textbox(placeholder="Enter sentence here..."),
    ["highlight", "json", "html"],
    examples=[
        ["What a beautiful morning for a walk!"],
        ["It was the best of times, it was the worst of times."],
    ],
)

# launch
demo.launch()

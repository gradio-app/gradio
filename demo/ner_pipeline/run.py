from transformers import pipeline

import gradio as gr

ner_pipeline = pipeline("ner")

examples = [
    "Does Chicago have any stores and does Joe live here?",
]

def ner(text):
    output = ner_pipeline(text)
    return {"text": text, "entities": output}    

gr.Interface(ner, 
             gr.Textbox(placeholder="Enter sentence here..."), 
             gr.HighlightedText(),
             examples=examples).launch()
# URL: https://huggingface.co/spaces/gradio/translation
# DESCRIPTION: This translation demo takes in the text, source and target languages, and returns the translation. It uses the Transformers library to set up the model and has a title, description, and example.
# imports 
import gradio as gr
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch

# loading the model (from https://hf.co/models) and defining constants
model = AutoModelForSeq2SeqLM.from_pretrained("facebook/nllb-200-distilled-600M")
tokenizer = AutoTokenizer.from_pretrained("facebook/nllb-200-distilled-600M")
device = 0 if torch.cuda.is_available() else -1
LANGS = ["ace_Arab", "eng_Latn", "fra_Latn", "spa_Latn"]

# defining the core function
def translate(text, src_lang, tgt_lang):
    """
    Translate the text from source lang to target lang
    """
    translation_pipeline = pipeline("translation", model=model, tokenizer=tokenizer, src_lang=src_lang, tgt_lang=tgt_lang, max_length=400, device=device)
    result = translation_pipeline(text)
    return result[0]['translation_text']

# defining an interface that accepts text, the source and target languages, and returns the translation 
demo = gr.Interface(
    fn=translate,
    inputs=[
        gr.components.Textbox(label="Text"),
        gr.components.Dropdown(label="Source Language", choices=LANGS),
        gr.components.Dropdown(label="Target Language", choices=LANGS),
    ],
    outputs=["text"],
    examples=[["Building a translation demo with Gradio is so easy!", "eng_Latn", "spa_Latn"]],
    cache_examples=False,
    title="Translation Demo",
    description="This demo is a simplified version of the original [NLLB-Translator](https://huggingface.co/spaces/Narrativaai/NLLB-Translator) space"
)

# launching the demo
demo.launch()
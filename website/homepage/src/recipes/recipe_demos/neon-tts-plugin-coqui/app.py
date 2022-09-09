# URL: https://huggingface.co/spaces/gradio/neon-tts-plugin-coqui
# imports
import tempfile
import gradio as gr
from neon_tts_plugin_coqui import CoquiTTS

# load the model and set up constants
LANGUAGES = list(CoquiTTS.langs.keys())
default_lang = "en"
title = "🐸💬 - NeonAI Coqui AI TTS Plugin"
description = "🐸💬 - a deep learning toolkit for Text-to-Speech, battle-tested in research and production"
info = "more info at [Neon Coqui TTS Plugin](https://github.com/NeonGeckoCom/neon-tts-plugin-coqui), [Coqui TTS](https://github.com/coqui-ai/TTS)"
badge = "https://visitor-badge-reloaded.herokuapp.com/badge?page_id=neongeckocom.neon-tts-plugin-coqui"
coquiTTS = CoquiTTS()

# define core fn 
def tts(text: str, language: str):
    print(text, language)
    # return output
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as fp:
        coquiTTS.get_tts(text, fp, speaker = {"language" : language})
        return fp.name


# start a block 
with gr.Blocks() as blocks:
    # define text on page
    gr.Markdown("<h1 style='text-align: center; margin-bottom: 1rem'>"
                + title
                + "</h1>")
    gr.Markdown(description)
    # define layout 
    with gr.Row():
        with gr.Column():
            # define inputs
            textbox = gr.Textbox(
                label="Input",
                value=CoquiTTS.langs[default_lang]["sentence"],
                max_lines=3,
            )
            radio = gr.Radio(
                label="Language",
                choices=LANGUAGES,
                value=default_lang
            )
            with gr.Row():
                # define button 
                submit = gr.Button("Submit", variant="primary")
        # define output 
        audio = gr.Audio(label="Output", interactive=False)
    
    gr.Markdown(info)
    gr.Markdown("<center>"
                +f'<img src={badge} alt="visitors badge"/>'
                +"</center>")

    # define what will run when submit is clicked
    submit.click(
        tts,
        [textbox, radio],
        [audio],
    )
    # define what will run when the radio input is changed 
    radio.change(lambda lang: CoquiTTS.langs[lang]["sentence"], radio, textbox)

# launch
blocks.launch()

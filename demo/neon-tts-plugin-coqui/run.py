import tempfile
import gradio as gr
from neon_tts_plugin_coqui import CoquiTTS

LANGUAGES = list(CoquiTTS.langs.keys())
coquiTTS = CoquiTTS()

def tts(text: str, language: str):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as fp:
        coquiTTS.get_tts(text, fp, speaker = {"language" : language})
        return fp.name

inputs = [gr.Textbox(label="Input", value=CoquiTTS.langs["en"]["sentence"], max_lines=3), 
            gr.Radio(label="Language", choices=LANGUAGES, value="en")]
outputs = gr.Audio(label="Output")

demo = gr.Interface(fn=tts, inputs=inputs, outputs=outputs)

demo.launch()
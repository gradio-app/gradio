# URL: https://huggingface.co/spaces/gradio/neon-tts-plugin-coqui
# imports
import tempfile
import gradio as gr
from neon_tts_plugin_coqui import CoquiTTS

# load the model and set up constants
LANGUAGES = list(CoquiTTS.langs.keys())
coquiTTS = CoquiTTS()

# define core fn 
def tts(text: str, language: str):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as fp:
        coquiTTS.get_tts(text, fp, speaker = {"language" : language})
        return fp.name

# define inputs and outputs
inputs = [gr.Textbox(label="Input", value=CoquiTTS.langs["en"]["sentence"], max_lines=3), 
            gr.Radio(label="Language", choices=LANGUAGES, value="en")]
outputs = gr.Audio(label="Output")

# define interface
demo = gr.Interface(fn=tts, inputs=inputs, outputs=outputs)

# launch 
demo.launch()
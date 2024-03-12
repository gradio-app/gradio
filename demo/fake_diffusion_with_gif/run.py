"""
app.py
"""
import os

import gradio as gr
#from groq import Groq

#client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def autocomplete(text):  
    for word in text.split():
        yield word
              
# Create the Gradio interface with live updates
iface = gr.Interface(
    fn=autocomplete,
    inputs=gr.Textbox(lines=2,
                      placeholder="Hello 👋",
                      label="Input Sentence"),
    outputs=gr.Markdown(),
    title="Catch me if you can 🐰",
    description="Powered by Groq & Gemma",
    live=True,  # Set live to True for real-time feedback
    allow_flagging="never"  # Disable flagging
)
iface.dependencies[0]['show_progress'] = "hidden"
iface.dependencies[2]['show_progress'] = "hidden"

# Launch the app
iface.launch()
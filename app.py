import transformers
from transformers import pipeline
import gradio as gr

with gr.Blocks() as demo:
   model = pipeline("object-detection")
   gr.Interface.from_pipeline(model).launch()
    
if __name__ == "__main__":
   try:
      demo.launch()
   except:
      print(f"An error occurred: {e}")
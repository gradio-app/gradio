import gradio as gr
import random

def respond(chat_history, message):
  response = random.choice(["Yes", "No"])
  return chat_history + [[message, response]]

with gr.Blocks():
  chatbot = gr.Chatbot()
  msg = gr.Textbox()
  clear = gr.Button("Clear")

  msg.submit(respond, [chatbot, msg], chatbot)
  clear.click(lambda: None, None, chatbot)

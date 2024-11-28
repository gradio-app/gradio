# This is a simple general-purpose chatbot built on top of OpenAI API. 
# Before running this, make sure you have exported your OpenAI API key as an environment variable:
# export OPENAI_API_KEY="your-openai-api-key"

from openai import OpenAI
import gradio as gr

client = OpenAI()

def predict(message, history):
    if len(history) == 0:
        history.append({"role": "system", "content": "You are guessing an object that the user is thinking of. You can ask 10 yes/no questions. Keep asking questions until the user says DONE"})
    history.append({"role": "user", "content": message})
    if len(history) > 20:
        history.append({"role": "user", "content": "DONE"})
    stream = client.chat.completions.create(messages=history, model="gpt-4o-mini", stream=True)
    chunks = []
    for chunk in stream:
        chunks.append(chunk.choices[0].delta.content or "")
        yield "".join(chunks)

placeholder = """
<center><h1>10 Questions</h1>Think of a person, place, or thing. I'll ask you 10 questions to try and guess it.
<br><br>When you have something, click "Get Started". I'll ask my first question.<br><br>
</center>
"""

demo = gr.ChatInterface(
    predict,
    examples=["Start!"],
    chatbot=gr.Chatbot(placeholder=placeholder),
    type="messages"
)

if __name__ == "__main__":
    demo.launch()

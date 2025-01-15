# This is a simple general-purpose chatbot built on top of LangChain and Gradio.
# Before running this, make sure you have exported your OpenAI API key as an environment variable:
# export OPENAI_API_KEY="your-openai-api-key"

from langchain_openai import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage
import gradio as gr

model = ChatOpenAI(model="gpt-4o-mini")

def predict(message, history):
    history_langchain_format = []
    for msg in history:
        if msg['role'] == "user":
            history_langchain_format.append(HumanMessage(content=msg['content']))
        elif msg['role'] == "assistant":
            history_langchain_format.append(AIMessage(content=msg['content']))
    history_langchain_format.append(HumanMessage(content=message))
    gpt_response = model.invoke(history_langchain_format)
    return gpt_response.content

demo = gr.ChatInterface(
    predict,
    type="messages"
)

if __name__ == "__main__":
    demo.launch()

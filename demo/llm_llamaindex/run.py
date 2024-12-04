# This is a simple RAG chatbot built on top of Llama Index and Gradio. It allows you to upload any text or PDF files and ask questions about them!
# Before running this, make sure you have exported your OpenAI API key as an environment variable:
# export OPENAI_API_KEY="your-openai-api-key"

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
import gradio as gr

def answer(message, history):
    files = []
    for msg in history:
        if msg['role'] == "user" and isinstance(msg['content'], tuple):
            files.append(msg['content'][0])
    for file in message["files"]:
        files.append(file)

    documents = SimpleDirectoryReader(input_files=files).load_data()
    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine()
    return str(query_engine.query(message["text"]))

demo = gr.ChatInterface(
    answer,
    type="messages",
    title="Llama Index RAG Chatbot",
    description="Upload any text or pdf files and ask questions about them!",
    textbox=gr.MultimodalTextbox(file_types=[".pdf", ".txt"]),
    multimodal=True
)

if __name__ == "__main__":
    demo.launch()

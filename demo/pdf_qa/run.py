import gradio as gr
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_pdf(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()
    return text

def build_index(text):
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    embeddings = model.encode(chunks)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return chunks, index

def answer(question, state):
    chunks, index = state
    q_emb = model.encode([question])
    _, I = index.search(np.array(q_emb), 3)
    context = "\n".join([chunks[i] for i in I[0]])
    return f"Answer based on document:\n\n{context}"

with gr.Blocks() as demo:
    gr.Markdown("# 📄 PDF Question Answering Demo")

    pdf = gr.File(file_types=[".pdf"])
    state = gr.State()

    chatbot = gr.ChatInterface(
        fn=answer,
        additional_inputs=[state]
    )

    def process(file):
        text = load_pdf(file)
        return build_index(text)

    pdf.upload(process, pdf, state)

if __name__ == "__main__":
    demo.launch()

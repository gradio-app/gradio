import gradio as gr
from gradio_pdf import PDF
import pymupdf
import os
from pathlib import Path

current_dir = Path(os.path.abspath(''))

def highlight_text_in_pdf(pdf_file: Path, highlight_text: str):
    page_number = 0
    doc = pymupdf.open(pdf_file)
    for page in doc:
        text_instances = page.search_for(highlight_text)
        if len(text_instances) > 0:
            page_number = page.number
        for inst in text_instances:
            page.add_highlight_annot(inst)

    new_pdf_file = str(pdf_file.parents[0]) + "/new_" + pdf_file.name
    doc.save(new_pdf_file)

    if page_number is None:
        page_number = 0
    
    return new_pdf_file, page_number + 1

def ask(query): 
    result = f"Something about : {query}"
    sources = "Document 1"
    pdf_path = current_dir / "Lorem ipsum.pdf"
    pdf_name = "Document 1"
    context_to_highlight = "Ut velit mauris"

    pdf, page_number = highlight_text_in_pdf(pdf_path, context_to_highlight)
    return result, sources + f" - Page {page_number}", PDF(pdf, label=pdf_name, starting_page=page_number, interactive=True)


if __name__ == "__main__":
    with gr.Blocks() as demo:
        title = gr.HTML(f"<center><h1>Bot</h1></center>")
        with gr.Row():
            with gr.Column(scale=2):
                input = gr.Textbox(label="Question", autofocus=True, interactive=True)
                btn = gr.Button("Ask", variant="primary")
                output = gr.Markdown(label="Anwser")
            with gr.Column(scale=2):
                srcs = gr.Textbox(label="Sources", interactive=False)
                pdf = PDF(label="Document")
            
        btn.click(fn=ask, inputs=input, outputs=[output, srcs, pdf])

    demo.launch()

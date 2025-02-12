import gradio as gr

def filter_rows_by_term(search_term: str) -> list:
    data = [
        ["apple pie", "dessert", "sweet"],
        ["banana bread", "baked", "breakfast"],
        ["apple cider", "drink", "autumn"],
        ["cherry tart", "dessert", "fruit"],
    ]
    return data


with gr.Blocks() as demo:
    t = gr.Textbox(placeholder="Search for a term", show_label=False)
    df = gr.Dataframe()

    demo.load(fn=filter_rows_by_term, inputs=[t], outputs=[df], js=True)
    t.change(fn=filter_rows_by_term, inputs=[t], outputs=[df], js=True)

if __name__ == "__main__":
    demo.launch()

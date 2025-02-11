import gradio as gr

def filter_rows_by_term(data: list, search_term: str) -> list:
    return [row for row in data if search_term in row[0]]

data = [
    ["apple pie", "dessert", "sweet"],
    ["banana bread", "baked", "breakfast"],
    ["apple cider", "drink", "autumn"],
    ["cherry tart", "dessert", "fruit"],
]

with gr.Blocks() as demo:
    df_orig = gr.Dataframe(type="array", value=data, visible=False)
    t = gr.Textbox(placeholder="Search for a term", show_label=False)
    df = gr.Dataframe(value=data)

    t.change(fn=filter_rows_by_term, inputs=[df_orig, t], outputs=[df], js=True)

if __name__ == "__main__":
    demo.launch()

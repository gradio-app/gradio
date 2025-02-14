import gradio as gr

data_original = [
    ["apple pie", "dessert", "sweet"],
    ["banana bread", "baked", "breakfast"],
    ["apple cider", "drink", "autumn"],
    ["cherry tart", "dessert", "fruit"],
]

def filter_rows_by_term(data: dict[str, list[list[str]]], search_term: str):
    data_ = data["data"]
    filtered_data = [row for row in data_ if search_term in row[0]]
    return {"data": filtered_data}


with gr.Blocks() as demo:
    df_hidden = gr.Dataframe(data_original, visible=False)
    t = gr.Textbox(placeholder="Search the first column", show_label=False)
    df = gr.Dataframe()

    demo.load(fn=filter_rows_by_term, inputs=[df_hidden, t], outputs=[df], js=True, preprocess=False, postprocess=False)
    t.change(fn=filter_rows_by_term, inputs=[df_hidden, t], outputs=[df], js=True, preprocess=False, postprocess=False)

if __name__ == "__main__":
    demo.launch()

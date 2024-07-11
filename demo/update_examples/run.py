import gradio as gr

def update_examples(country):
    if country == "USA":
        return gr.Dataset(samples=[["Chicago"], ["Little Rock"], ["San Francisco"]])
    else:
        return gr.Dataset(samples=[["Islamabad"], ["Karachi"], ["Lahore"]])

with gr.Blocks() as demo:
    dropdown = gr.Dropdown(label="Country", choices=["USA", "Pakistan"], value="USA")
    textbox = gr.Textbox()
    examples = gr.Examples([["Chicago"], ["Little Rock"], ["San Francisco"]], textbox)
    dropdown.change(update_examples, dropdown, examples.dataset)

if __name__ == "__main__":
    demo.launch()
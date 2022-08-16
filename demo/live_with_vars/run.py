import gradio as gr

demo = gr.Interface(
    lambda x, y: (x + y if y is not None else x, x + y if y is not None else x), 
    ["textbox", "state"], 
    ["textbox", "state"], live=True)

if __name__ == "__main__":
    demo.launch()

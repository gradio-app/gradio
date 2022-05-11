import gradio as gr

with gr.Blocks() as demo:
    text = gr.Textbox("Test", label="here we go", style=[
        gr.style(text_color="red", background_color="pink", border_width=0),
        gr.style(target="label", text_size=50),        
    ])
    cboxes = gr.CheckboxGroup(["Apple", "Banana", "Cat"], style=
        gr.style(target="option", height=40, background_color="orange"),
    )
    slider = gr.Slider(0, minimum=0, maximum=50, style=[
        gr.style(target="value", bold=True)
    ])
    btn = gr.Button(
        "Let's Go", 
        style=gr.style(background_color="gray", border_width=0, rounded=False)
    )
    img = gr.Image("lion.jpg", style={"filter": "grayscale(100%)", "height": "2rem"}) # still possible to do this
    btn.click(lambda x, y, z: 2 * x, [text, cboxes, slider], text)

if __name__ == "__main__":
    demo.launch()
import gradio as gr


demo = gr.Blocks()

with demo:
    inp = gr.Textbox(placeholder="Enter text.")
    scroll_btn = gr.Button("Scroll")
    no_scroll_btn = gr.Button("No Scroll")
    big_block = gr.HTML("""
    <div style='height: 800px; width: 100px; background-color: pink;'></div>
    """)
    out = gr.Textbox()
    
    scroll_btn.click(lambda x: x, 
               inputs=inp, 
               outputs=out,
                scroll_to_output=True)
    no_scroll_btn.click(lambda x: x, 
               inputs=inp, 
               outputs=out)

if __name__ == "__main__":
    demo.launch()
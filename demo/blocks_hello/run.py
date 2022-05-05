import gradio as gr

demo = gr.Blocks()

with demo:
    gr.Markdown("# Hello World!")
    input = gr.Textbox(placeholder="What is your name?")
    output = gr.Textbox()
    
    def update_output(name):
        return "Welcome to Blocks, {}!".format(name)
    
    input.change(fn=update_output, 
                 inputs=input, 
                 outputs=output)

demo.launch()
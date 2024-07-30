import gradio as gr

hello_world = gr.Interface(lambda name: "Hello " + name, "text", "text")
bye_world = gr.Interface(lambda name: "Bye " + name, "text", "text")

demo = gr.TabbedInterface([hello_world, bye_world], ["Hello World", "Bye World"])

if __name__ == "__main__":
    demo.launch()

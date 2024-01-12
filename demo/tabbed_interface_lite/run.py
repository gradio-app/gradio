import gradio as gr

hello_world = gr.Interface(lambda name: "Hello " + name, "text", "text")
bye_world = gr.Interface(lambda name: "Bye " + name, "text", "text")
hidden_tab = gr.Interface(lambda name: "Hidden " + name, "text", "text")
secret_tab = gr.Interface(lambda name: "Secret " + name, "text", "text")

demo = gr.TabbedInterface([secret_tab, hello_world, bye_world, hidden_tab], ["Secret Tab", "Hello World", "Bye World", "Hidden Tab"], visible_tabs=[0,1,2], interactive_tabs=[1,2])

if __name__ == "__main__":
    demo.launch()
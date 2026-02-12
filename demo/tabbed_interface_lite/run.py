import gradio as gr

hello_world = gr.Interface(lambda name: "Hello " + name, "text", "text", api_name="predict")
bye_world = gr.Interface(lambda name: "Bye " + name, "text", "text", api_name="predict")
chat = gr.ChatInterface(lambda *args: "Hello " + args[0], api_name="chat")

demo = gr.TabbedInterface([hello_world, bye_world, chat], ["Hello World", "Bye World", "Chat"])

if __name__ == "__main__":
    demo.launch()

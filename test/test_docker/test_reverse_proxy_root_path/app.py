import gradio as gr

demo = gr.Interface(lambda x: f"Hi {x}", "textbox", "textbox")

demo.launch(server_name="0.0.0.0", server_port=8000, root_path="/gradio/demo")

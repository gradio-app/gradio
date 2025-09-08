import gradio as gr

with gr.Blocks(title="Navbar Demo") as demo:
    navbar = gr.Navbar(visible=True, main_page_name="Dashboard")

    gr.Markdown("# Dashboard Page")
    hide_btn = gr.Button("Hide Navbar")
    hide_btn.click(fn=lambda : gr.Navbar(visible=False), outputs=navbar)
    show_btn = gr.Button("Show Navbar")
    show_btn.click(fn=lambda : gr.Navbar(visible=True, main_page_name="Dashboard is Back!"), outputs=navbar)

with demo.route("Settings", "/settings"):
    gr.Markdown("# Settings Page")

if __name__ == "__main__":
    demo.launch()

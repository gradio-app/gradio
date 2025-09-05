import gradio as gr

# Create a multipage app with a custom navbar
with gr.Blocks(title="Navbar Demo") as demo:
    # Add a navbar component to customize the navbar behavior
    navbar = gr.Navbar(visible=True, home_page_title="Dashboard")

    # Main page content
    with gr.Row():
        with gr.Column():
            gr.Markdown("# Welcome to the Dashboard")
            name = gr.Textbox(label="Enter your name")
            greeting = gr.Textbox(label="Greeting")
            greet_btn = gr.Button("Greet")

            greet_btn.click(fn=lambda x: f"Hello, {x}!", inputs=name, outputs=greeting)

# Add additional pages
with demo.route("Settings", "/settings"):
    gr.Markdown("# Settings Page")
    with gr.Column():
        theme = gr.Radio(["Light", "Dark"], label="Theme", value="Light")
        language = gr.Dropdown(
            ["English", "Spanish", "French"], label="Language", value="English"
        )
        gr.Button("Save Settings")

with demo.route("About", "/about"):
    gr.Markdown("# About This App")
    gr.Markdown("""
    This is a demo of the gr.Navbar component for multipage Gradio apps.
    
    **Features:**
    - Custom home page title: "Dashboard" instead of "Home"
    - Navbar is visible and displays navigation between pages
    - Easy to configure navbar behavior
    """)

# Example with hidden navbar
with demo.route("Hidden Navbar Example", "/hidden"):
    gr.Markdown("# This page demonstrates what happens when navbar is hidden")
    gr.Markdown(
        "Note: You shouldn't be able to see the navbar when visiting this route directly with a hidden navbar component."
    )

if __name__ == "__main__":
    demo.launch()

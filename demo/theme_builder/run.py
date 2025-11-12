import gradio as gr
from gradio.themes.builder_app import demo

if __name__ == "__main__":
    demo.launch(css_paths=["demo/custom_css/custom_css.css"], theme=gr.themes.Base(), head="<style id='theme_css'></style>")

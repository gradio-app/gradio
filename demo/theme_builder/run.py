import gradio as gr
from gradio.themes.builder_app import demo

if __name__ == "__main__":
    from gradio.utils import get_space
    path = "custom_css.css" if get_space() else "demo/custom_css/custom_css.css"
    demo.launch(css_paths=["demo/custom_css/custom_css.css"], theme=gr.themes.Base(), head="<style id='theme_css'></style>")

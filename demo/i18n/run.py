import gradio as gr

# Create an i18n instance with translations for different languages
i18n = gr.i18n(
    en={"name_label": "Your Name", "submit_button": "Greet"},
    es={"name_label": "Tu Nombre", "submit_button": "Saludar"},
    fr={"name_label": "Votre Nom", "submit_button": "Saluer"},
    de={"name_label": "Dein Name", "submit_button": "Grüßen"}
)

with gr.Blocks() as demo:
    with gr.Row():
        name_input = gr.Textbox(label=i18n("name_label"))

    with gr.Row():
        greet_btn = gr.Button(i18n("submit_button"))

    gr.Markdown("""
    This demo shows Gradio's internationalization (i18n) functionality. 
    The interface automatically displays text in the user's browser language 
    (if available in our translations), or falls back to English.
    """)

if __name__ == "__main__":
    demo.launch(i18n=i18n)

import gradio as gr

# create an i18n instance with translations for different languages
i18n = gr.I18n(
    en={"greeting": "Hello, welcome to my app!", "name_label": "Your Name", "submit_button": "Greet", "john_doe": "John English", "result_label": "Result"},
    es={"greeting": "¡Hola, bienvenido a mi aplicación!", "name_label": "Tu Nombre", "submit_button": "Saludar", "john_doe": "John Spanish", "result_label": "Resultado"},
    fr={"greeting": "Bonjour, bienvenue dans mon application!", "name_label": "Votre Nom", "submit_button": "Saluer", "john_doe": "John French", "result_label": "Résultat"},
    de={"greeting": "Hallo, willkommen in meiner App!", "name_label": "Dein Name", "submit_button": "Grüßen", "john_doe": "John German", "result_label": "Ergebnis"},
)

def add_hello_world(name):
    return "hello " + name

with gr.Blocks() as demo:
    gr.Markdown(value=i18n("greeting"))

    with gr.Row():
        # use i18n() for any string that should be translated
        name_input = gr.Textbox(label=i18n("name_label"), value=i18n("john_doe"))

    with gr.Row():
        output_text = gr.Textbox(label=i18n("result_label"))

    with gr.Row():
        greet_btn = gr.Button(value=i18n("submit_button"))

    with gr.Row():
        reset_btn = gr.Button("Reset Name")

    greet_btn.click(fn=add_hello_world, inputs=name_input, outputs=output_text)
    reset_btn.click(fn=lambda: i18n("john_doe"), inputs=None, outputs=name_input)

    gr.Markdown("""
    This demo shows Gradio's internationalization (i18n) functionality. 
    The interface automatically displays text in the user's browser language 
    (if available in our translations), or falls back to English.
    """)

if __name__ == "__main__":
    # pass i18n to the launch function
    demo.launch(i18n=i18n)

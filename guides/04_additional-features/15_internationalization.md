Tags: internationalization, i18n, language
Related spaces:

# Internationalization (i18n)

Gradio comes with ready-to-use internationalization (i18n) support:

- Built-in translations: Gradio automatically translates standard UI elements (like "Submit", "Clear", "Cancel") in more than 40 languages based on the user's browser locale.
- Custom translations: For app-specific text, Gradio provides the I18n class that lets you extend the built-in system with your own translations.

## Setting Up Translations

You can initialize the `I18n` class with multiple language dictionaries to add custom translations:

```python
import gradio as gr

# Create an I18n instance with translations for multiple languages
i18n = gr.I18n(
    en={"greeting": "Hello, welcome to my app!", "submit": "Submit"},
    es={"greeting": "¡Hola, bienvenido a mi aplicación!", "submit": "Enviar"},
    fr={"greeting": "Bonjour, bienvenue dans mon application!", "submit": "Soumettre"}
)

with gr.Blocks() as demo:
    # Use the i18n method to translate the greeting
    gr.Markdown(i18n("greeting"))
    with gr.Row():
        input_text = gr.Textbox(label="Input")
        output_text = gr.Textbox(label="Output")
    
    submit_btn = gr.Button(i18n("submit"))

# Pass the i18n instance to the launch method
demo.launch(i18n=i18n)
```

## How It Works

When you use the `i18n` instance with a translation key, Gradio will show the corresponding translation to users based on their browser's language settings or the language they've selected in your app.

If a translation isn't available for the user's locale, the system will fall back to English (if available) or display the key itself.

## Valid Locale Codes

Locale codes should follow the BCP 47 format (e.g., 'en', 'en-US', 'zh-CN'). The `I18n` class will warn you if you use an invalid locale code.

## Supported Component Properties

The following component properties typically support internationalization:

- `description`
- `info`
- `title`
- `placeholder`
- `value`
- `label`

Note that support may vary depending on the component, and some properties might have exceptions where internationalization is not applicable. You can check this by referring to the typehint for the parameter and if it contains `I18nData`, then it supports internationalization.
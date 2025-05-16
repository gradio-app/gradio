Tags: internationalization, i18n, language
Related spaces:

# Internationalization (i18n)

Gradio provides custom internationalization (i18n) support through the `I18n` class. This feature enables the translation of your application's text based on the user's browser locale and extends Gradio's built-in translation system with your custom translations.

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

# Create interface with translatable texts
with gr.Blocks() as demo:
    gr.Markdown(i18n("greeting"))
    with gr.Row():
        input_text = gr.Textbox(label="Input")
        output_text = gr.Textbox(label="Output")
    
    submit_btn = gr.Button(i18n("submit"))

# Pass the i18n instance to the launch method
demo.launch(i18n=i18n)
```

## How It Works

When you call the `i18n` instance with a translation key, it returns an `I18nData` object containing the key. This object is serialized and sent to the frontend, where the actual translation happens based on the user's browser locale or the Gradio app setting.

Gradio already includes built-in translations for components in multiple languages. The `I18n` class allows you to extend this system with your own custom translations.

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

Note that support may vary depending on the component, and some properties might have exceptions where internationalization is not applicable.
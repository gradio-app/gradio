# Styling

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Interface` constructor. For example:

```python
demo = gr.Interface(..., theme=gr.themes.Monochrome())
```

or

```python
with gr.Block(theme=gr.themes.Soft()):
    ...
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [theming guide](https://gradio.app/guides/theming-guide) for more details.

For additional styling ability, you can pass any CSS (as well as custom JavaScript) to your Gradio application. This is discussed in more detail in our [custom JS and CSS guide](/guides/custom-CSS-and-JS).


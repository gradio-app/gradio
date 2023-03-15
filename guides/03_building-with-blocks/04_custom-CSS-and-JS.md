# Custom JS and CSS

This guide covers how to style Blocks with more flexibility, as well as adding Javascript code to event listeners. 

## Custom CSS

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Blocks` constructor. For example:

```python
with gr.Blocks(theme=gr.themes.Glass()):
    ...
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [Theming guide](https://gradio.app/theming-guide) for more details.

For additional styling ability, you can pass any CSS to your app using the `css=` kwarg.

The base class for the Gradio app is `gradio-container`, so here's an example that changes the background color of the Gradio app:
```python
with gr.Blocks(css=".gradio-container {background-color: red}") as demo:
    ...
```

If you'd like to reference external files in your css, preface the file path (which can be a relative or absolute path) with `"file="`, for example:

```python
with gr.Blocks(css=".gradio-container {background-image: url('file=clouds.jpg')}") as demo:
    ...
```

You can also pass the filepath to a CSS file to the `css` argument.

## The `elem_id` Argument

You can `elem_id` to add an HTML element `id` to any component. This will allow you to select elements more easily with CSS.

```python
with gr.Blocks(css="#warning {color: red}") as demo:
    box1 = gr.Textbox(value="Good Job")
    box2 = gr.Textbox(value="Failure", elem_id="warning")
```

The CSS ruleset will only target the second Textbox here.

## Custom JS

Event listeners have a `_js` argument that can take a Javascript function as a string and treat it just like a Python event listener function. You can pass both a Javascript function and a Python function (in which case the Javascript function is run first) or only Javascript (and set the Python `fn` to `None`). Take a look at the code below:

$code_blocks_js_methods
$demo_blocks_js_methods
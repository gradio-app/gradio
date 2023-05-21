# Custom JS and CSS

This guide covers how to style Blocks with more flexibility, as well as adding Javascript code to event listeners. 

**Warning**: The use of query selectors in custom JS and CSS is *not* guaranteed to work across Gradio versions as the Gradio HTML DOM may change. We recommend using query selectors sparingly.

## Custom CSS

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Blocks` constructor. For example:

```python
with gr.Blocks(theme=gr.themes.Glass()):
    ...
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [Theming guide](/theming-guide) for more details.

For additional styling ability, you can pass any CSS to your app using the `css=` kwarg.

The base class for the Gradio app is `gradio-container`, so here's an example that changes the background color of the Gradio app:
```python
with gr.Blocks(css=".gradio-container {background-color: red}") as demo:
    ...
```

If you'd like to reference external files in your css, preface the file path (which can be a relative or absolute path) with `"file="`, for example:

```python
with gr.Blocks(css=".gradio-container {background: url('file=clouds.jpg')}") as demo:
    ...
```

You can also pass the filepath to a CSS file to the `css` argument. 

## The `elem_id` and `elem_classes` Arguments

You can `elem_id` to add an HTML element `id` to any component, and `elem_classes` to add a class or list of classes. This will allow you to select elements more easily with CSS. This approach is also more likely to be stable across Gradio versions as built-in class names or ids may change (however, as mentioned in the warning above, we cannot guarantee complete compatibility between Gradio versions if you use custom CSS as the DOM elements may themselves change).

```python
css = """
#warning {background-color: #FFCCCB} 
.feedback textarea {font-size: 24px !important}
"""

with gr.Blocks(css=css) as demo:
    box1 = gr.Textbox(value="Good Job", elem_classes="feedback")
    box2 = gr.Textbox(value="Failure", elem_id="warning", elem_classes="feedback")
```

The CSS `#warning` ruleset will only target the second Textbox, while the `.feedback` ruleset will target both. Note that when targeting classes, you might need to put the `!important` selector to override the default Gradio styles.

## Custom JS

Event listeners have a `_js` argument that can take a Javascript function as a string and treat it just like a Python event listener function. You can pass both a Javascript function and a Python function (in which case the Javascript function is run first) or only Javascript (and set the Python `fn` to `None`). Take a look at the code below:

$code_blocks_js_methods
$demo_blocks_js_methods
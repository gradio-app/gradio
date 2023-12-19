# Customizing your demo with CSS and Javascript

Gradio allows you to customize your demo in several ways. You can customize the layout of your demo, add custom HTML, and add custom theming as well. This tutorial will go beyond that and walk you through how to add custom CSS and JavaScript code to your demo in order to add stuff like custom styling, animations, custom UI functionality, analytics, and more.

**Warning**: The use of query selectors in custom JS and CSS is _not_ guaranteed to work across Gradio versions as the Gradio HTML DOM may change. We recommend using query selectors sparingly.

## Adding custom CSS to your demo

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Blocks` constructor. For example:

```python
with gr.Blocks(theme=gr.themes.Glass()):
    ...
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [Theming guide](/guides/theming-guide) for more details.

For additional styling ability, you can pass any CSS to your app using the `css=` kwarg. You can either the filepath to a CSS file, or a string of CSS code.

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

Note: By default, files in the host machine are not accessible to users running the Gradio app. As a result, you should make sure that any referenced files (such as `clouds.jpg` here) are either URLs or allowed via the `allow_list` parameter in `launch()`. Read more in our [section on Security and File Access](/guides/sharing-your-app#security-and-file-access).


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

## Adding custom JavaScript to your demo

There are 3 ways to add javascript code to your Gradio demo:

1. You can add javascript code as a string or as a filepath to the `js` parameter of the `Blocks` or `Interface` initializer. This will run the js code when the demo is first loaded.

Below is an example of adding custom js to show an animated welcome message when the demo first loads.

$:code_blocks_js_load
$demo_blocks_js_methods

Note: You can also supply your custom js code as a file path. For example, if you have a file called `custom.js` in the same directory as your Python script, you can add it to your demo like so: `with gr.Blocks(js="custom.js") as demo:`. Same goes for `Interface` (ex: `gr.Interface(..., js="custom.js")`).

2. When using `Blocks` and event listeners, events have a `js` argument that can take a Javascript function as a string and treat it just like a Python event listener function. You can pass both a Javascript function and a Python function (in which case the Javascript function is run first) or only Javascript (and set the Python `fn` to `None`). Take a look at the code below:
   
$code_blocks_js_methods
$demo_blocks_js_methods

3. Lastly, you can add javascript code to the `head` param of the `Blocks` initializer. This will add the code to the head of the HTML document. For example, you can add Google Analytics to your demo like so:


```python
head = f"""
<script async src="https://www.googletagmanager.com/gtag/js?id={google_analytics_tracking_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{google_analytics_tracking_id}');
</script>
"""

with gr.Blocks(head=head) as demo:
    ...demo code...
```

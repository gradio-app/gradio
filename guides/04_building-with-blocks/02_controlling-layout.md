# Controlling Layout

By default, Components in Blocks are arranged vertically. Let's take a look at how we can rearrange Components. Under the hood, this layout structure uses the [flexbox model of web development](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox).

## Rows

Elements within a `with gr.Row` clause will all be displayed horizontally. For example, to display two Buttons side by side:

```python
with gr.Blocks() as demo:
    with gr.Row():
        btn1 = gr.Button("Button 1")
        btn2 = gr.Button("Button 2")
```

To make every element in a Row have the same height, use the `equal_height` argument of the `style` method.

```python
with gr.Blocks() as demo:
    with gr.Row(equal_height=True):
        textbox = gr.Textbox()
        btn2 = gr.Button("Button 2")
```

The widths of elements in a Row can be controlled via a combination of `scale` and `min_width` arguments that are present in every Component.

- `scale` is an integer that defines how an element will take up space in a Row. If scale is set to `0`, the element will not expand to take up space. If scale is set to `1` or greater, the element will expand. Multiple elements in a row will expand proportional to their scale. Below, `btn2` will expand twice as much as `btn1`, while `btn0` will not expand at all:

```python
with gr.Blocks() as demo:
    with gr.Row():
        btn0 = gr.Button("Button 0", scale=0)
        btn1 = gr.Button("Button 1", scale=1)
        btn2 = gr.Button("Button 2", scale=2)
```

- `min_width` will set the minimum width the element will take. The Row will wrap if there isn't sufficient space to satisfy all `min_width` values.

Learn more about Rows in the [docs](https://gradio.app/docs/row).

## Columns and Nesting

Components within a Column will be placed vertically atop each other. Since the vertical layout is the default layout for Blocks apps anyway, to be useful, Columns are usually nested within Rows. For example:

$code_rows_and_columns
$demo_rows_and_columns

See how the first column has two Textboxes arranged vertically. The second column has an Image and Button arranged vertically. Notice how the relative widths of the two columns is set by the `scale` parameter. The column with twice the `scale` value takes up twice the width.

Learn more about Columns in the [docs](https://gradio.app/docs/column).

# Dimensions

You can control the height and width of various components, where the parameters are available. These parameters accept either a number (interpreted as pixels) or a string. Using a string allows the direct application of any CSS unit to the encapsulating Block element, catering to more specific design requirements. When omitted, Gradio uses default dimensions suited for most use cases.

Below is an example illustrating the use of viewport width (vw):

```python
import gradio as gr

with gr.Blocks() as demo:
    im = gr.ImageEditor(
        width="50vw",
    )

demo.launch()
```

When using percentage values for dimensions, you may want to define a parent component with an absolute unit (e.g. `px` or `vw`). This approach ensures that child components with relative dimensions are sized appropriately:


```python
import gradio as gr

css = """
.container {
    height: 100vh;
}
"""

with gr.Blocks(css=css) as demo:
    with gr.Column(elem_classes=["container"]):
        name = gr.Chatbot(value=[["1", "2"]], height="70%")

demo.launch()
```

In this example, the Column layout component is given a height of 100% of the viewport height (100vh), and the Chatbot component inside it takes up 70% of the Column's height.

You can apply any valid CSS unit for these parameters. For a comprehensive list of CSS units, refer to [this guide](https://www.w3schools.com/cssref/css_units.php). We recommend you always consider responsiveness and test your interfaces on various screen sizes to ensure a consistent user experience.



## Tabs and Accordions

You can also create Tabs using the `with gr.Tab('tab_name'):` clause. Any component created inside of a `with gr.Tab('tab_name'):` context appears in that tab. Consecutive Tab clauses are grouped together so that a single tab can be selected at one time, and only the components within that Tab's context are shown.

For example:

$code_blocks_flipper
$demo_blocks_flipper

Also note the `gr.Accordion('label')` in this example. The Accordion is a layout that can be toggled open or closed. Like `Tabs`, it is a layout element that can selectively hide or show content. Any components that are defined inside of a `with gr.Accordion('label'):` will be hidden or shown when the accordion's toggle icon is clicked.

Learn more about [Tabs](https://gradio.app/docs/tab) and [Accordions](https://gradio.app/docs/accordion) in the docs.

## Visibility

Both Components and Layout elements have a `visible` argument that can set initially and also updated. Setting `gr.Column(visible=...)` on a Column can be used to show or hide a set of Components.

$code_blocks_form
$demo_blocks_form

## Variable Number of Outputs

By adjusting the visibility of components in a dynamic way, it is possible to create
demos with Gradio that support a _variable numbers of outputs_. Here's a very simple example
where the number of output textboxes is controlled by an input slider:

$code_variable_outputs
$demo_variable_outputs

## Defining and Rendering Components Separately

In some cases, you might want to define components before you actually render them in your UI. For instance, you might want to show an examples section using `gr.Examples` above the corresponding `gr.Textbox` input. Since `gr.Examples` requires as a parameter the input component object, you will need to first define the input component, but then render it later, after you have defined the `gr.Examples` object.

The solution to this is to define the `gr.Textbox` outside of the `gr.Blocks()` scope and use the component's `.render()` method wherever you'd like it placed in the UI.

Here's a full code example:

```python
input_textbox = gr.Textbox()

with gr.Blocks() as demo:
    gr.Examples(["hello", "bonjour", "merhaba"], input_textbox)
    input_textbox.render()
```

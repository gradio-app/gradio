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

To make every element in a Row have the same height, use the `equal_height` argument.

```python
with gr.Blocks() as demo:
    with gr.Row(equal_height=True):
        textbox = gr.Textbox()
        btn2 = gr.Button("Button 2")
```

## Columns and Nesting

Components within a Column will be placed vertically atop each other. Since the vertical layout is the default layout for Blocks apps anyway, to be useful, Columns are usually  nested within Rows. For example:

$code_rows_and_columns
$demo_rows_and_columns

See how the first column has two Textboxes arranged vertically. The second column has an Image and Button arranged vertically. Notice how the relative widths of the two columns is set by the `scale` parameter. The column with twice the `scale` value takes up twice the width.

## Tabs

You can also create Tabs using the `with gradio.Tab('tab_name'):` clause. Any component created inside of a `with gradio.Tab('tab_name'):` context appears in that tab. Consecutive Tab clauses are grouped together so that a single tab can be selected at one time, and only the components within that Tab's context are shown.

For example:

$code_blocks_flipper
$demo_blocks_flipper

## Visibility

Both Components and Layout elements have a `visible` argument that can set initially and also updated using `gr.update()`. Setting `gr.update(visible=...)` on a Column can be used to show or hide a set of Components.

$code_blocks_form
$demo_blocks_form

## Defining and Rendering Components Separately

In some cases, you might want to define components before you actually render them in your UI. For instance, you might want to show an examples section using `gr.Examples` above the corresponding `gr.Textbox` input. Since `gr.Examples` requires as a parameter the input component object, you will need to first define the input component, but then render it later, after you have definted the `gr.Examples` object.

The solution to this is to define the `gr.Textbox` outside of the `gr.Blocks()` scope and use the component's `.render()` method wherever you'd like it placed in the UI.

Here's a full code example:

```python
input_textbox = gr.Textbox()

with gr.Blocks() as demo:
    gr.Examples(["hello", "bonjour", "merhaba"], input_textbox)
    input_textbox.render()
```


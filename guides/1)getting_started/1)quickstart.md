# Quickstart

**Prerequisite**: Gradio requires Python 3.7 or higher, that's all!

## What Does Gradio Do?

One of the *best ways to share* your machine learning model, API, or data science workflow with others is to create an **interactive app** that allows your users or colleagues to try out the demo in their browsers.

Gradio allows you to **build demos and share them, all in Python.** And usually in just a few lines of code! So let's get started.

## Hello, World

To get Gradio running with a simple "Hello, World" example, follow these three steps:

1\. Install Gradio using pip:

```bash
pip install gradio
```

2\. Run the code below as a Python script or in a Jupyter Notebook (or [Google Colab](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)):

$code_hello_world

3\. The demo below will appear automatically within the Jupyter Notebook, or pop in a browser on [http://localhost:7860](http://localhost:7860) if running from a script:

$demo_hello_world

## The `Interface` Class

You'll notice that in order to make the demo, we created a `gradio.Interface`. This `Interface` class can wrap any Python function with a user interface. In the example above, we saw a simple text-based function, but the function could be anything from music generator to a tax calculator to the prediction function of a pretrained machine learning model.

The core `Interface` class is initialized with three required parameters:

- `fn`: the function to wrap a UI around
- `inputs`: which component(s) to use for the input (e.g. `"text"`, `"image"` or `"audio"`)
- `outputs`: which component(s) to use for the output (e.g. `"text"`, `"image"` or `"label"`)

Let's take a closer look at these components used to provide input and output.

## Components Attributes

We saw some simple `Textbox` components in the previous examples, but what if you want to change how the UI components look or behave?

Let's say you want to customize the input text field — for example, you wanted it to be larger and have a text placeholder. If we use the actual class for `Textbox` instead of using the string shortcut, you have access to much more customizability through component attributes.

$code_hello_world_2
$demo_hello_world_2

## Multiple Input and Output Components

Suppose you had a more complex function, with multiple inputs and outputs. In the example below, we define a function that takes a string, boolean, and number, and returns a string and number. Take a look how you pass a list of input and output components.

$code_hello_world_3
$demo_hello_world_3

You simply wrap the components in a list. Each component in the `inputs` list corresponds to one of the parameters of the function, in order. Each component in the `outputs` list corresponds to one of the values returned by the function, again in order.

## An Image Example

Gradio supports many types of components, such as `Image`, `DataFrame`, `Video`, or `Label`. Let's try an image-to-image function to get a feel for these!

$code_sepia_filter
$demo_sepia_filter

When using the `Image` component as input, your function will receive a NumPy array with the shape `(width, height, 3)`, where the last dimension represents the RGB values. We'll return an image as well in the form of a NumPy array.

You can also set the datatype used by the component with the `type=` keyword argument. For example, if you wanted your function to take a file path to an image instead of a NumPy array, the input `Image` component could be written as:

```python
gr.Image(type="filepath", shape=...)
```

Also note that our input `Image` component comes with an edit button 🖉, which allows for cropping and zooming into images. Manipulating images in this way can help reveal biases or hidden flaws in a machine learning model!

You can read more about the many components and how to use them in the [Gradio docs](https://gradio.app/docs).

## Blocks: More Flexibility and Control

Gradio offers two classes to build apps:

1\. **Interface**, that provides a high-level abstraction for creating demos that we've been discussing so far.

2\. **Blocks**, a low-level API for designing web apps with more flexible layouts and data flows. Blocks allows you to do things like feature multiple data flows and demos, control where components appear on the page, handle complex data flows (e.g. outputs can serve as inputs to other functions), and update properties/visibility of components based on user interaction — still all in Python. If this customizability is what you need, try `Blocks` instead!

## Hello, Blocks

Let's take a look at a simple example. Note how the API here differs from `Interface`.

$code_hello_blocks
$demo_hello_blocks

Things to note:

- `Blocks` are made with a `with` clause, and any component created inside this clause is automatically added to the app.
- Components appear vertically in the app in the order they are created. (Later we will cover customizing layouts!)
- A `Button` was created, and then a `click` event-listener was added to this button. The API for this should look familiar! Like an `Interface`, the `click` method takes a Python function, input components, and output components.

## More Complexity

Here's an app to give you a taste of what's possible with `Blocks`:

$code_blocks_flipper
$demo_blocks_flipper

A lot more going on here! We'll cover how to create complex `Blocks` apps like this in the [building with blocks](https://github.com/gradio-app/gradio/tree/main/guides/3\)building_with_blocks) section for you.

Congrats, you're now familiar with the basics of Gradio! 🥳 Go to our [next guide](https://gradio.app/key_features) to learn more about the key features of Gradio.

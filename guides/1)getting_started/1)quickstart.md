# Quickstart

**Prerequisite**: Gradio requires Python 3.7 or above, that's it! 

## What does Gradio Do?

One of the *best ways to share* your machine learning model, API, or data science workflow with others is to create an **interactive app** that allows your users or colleagues to try out the demo in their browsers. 

Gradio allows you to **build demos and share them, all in Python.** And usually in just a few lines of code! So let's get started. 

## Hello, World

To get Gradio running with a simple "Hello, World" example, follow these three steps:

<span>1.</span> Install Gradio from pip. Note, the minimal supported Python version is 3.7.

```bash
pip install gradio
```

<span>2.</span> Run the code below as a Python script or in a Python notebook (or in a  [colab notebook](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)).

$code_hello_world

<span>3.</span> The demo below will appear automatically within the Python notebook, or pop in a browser on  [http://localhost:7860](http://localhost:7860/)  if running from a script.

$demo_hello_world

## The `Interface` Class

You'll notice that in order to make the demo, we created a `gradio.Interface`. This `Interface` class can wrap any Python function with a user interface. In the example above, we saw a simple text-based function. But the function could be anything from music generator to a tax calculator to the prediction function of a pretrained machine learning model.

The core `Interface` class is initialized with three required parameters:

-   `fn`: the function to wrap a UI around
-   `inputs`: which component(s) to use for the input, e.g. `"text"` or `"image"` or `"audio"` 
-   `outputs`: which component(s) to use for the output, e.g. `"text"` or `"image"` `"label"`

Let's take a closer look at these Components used to provide input and output.

## Components

### Components Attributes

We saw some simple Textbox components in the previous example. But what if you want to change how the UI components look or behave?

Let's say you want to customize the input text field - for example, you wanted it to be larger and have a text placeholder. If we use the actual class for  `Textbox`  instead of using the string shortcut, you have access to much more customizability through component attributes.

$code_hello_world_2
$demo_hello_world_2

### Multiple Input and Output Components

Let's say you had a more complex function, with multiple inputs and outputs. In the example below, we define a function that takes a string, boolean, and number, and returns a string and number. Take a look how you pass a list of input and output components.

$code_hello_world_3
$demo_hello_world_3

You simply wrap the components in a list. Each component in the `inputs` list corresponds to one of the parameters of the function, in order. Each component in the `outputs` list corresponds to one of the values returned by the function, again in order. 

### An Image Example

Gradio supports many types of Components, such as `Image`, `DataFrame`, `Video`, or `Label`. Let's try an image-to-image function to get a feel for these! 

$code_sepia_filter
$demo_sepia_filter

When using the  `Image` Component as input, your function will receive a numpy array with the shape  `(width, height, 3)`, where the last dimension represents the RGB values. We'll return an image as well in the form of a numpy array. You can learn the Python datatype used by each Component in the [Docs](https://gradio.app/docs). 

You can also set the datatype used by the Component with the `type=` keyword argument. For example, if you wanted your function to take a filepath to an image instead of a numpy array, the input `Image` component could be written as

```python
gr.Image(type='filepath', shape=...)
```

Also note that our  input `Image` Component comes with an 'edit' button, which allows for cropping and zooming into images. Manipulating images in this way can help reveal biases or hidden flaws in a machine learning model!

Read more about the many Components and how to use them in the [Docs](https://gradio.app/docs).

## Blocks: More Flexibility and Control

Gradio offers two classes to build apps: 

(1) **Interface**, a high level abstraction for creating demos (that we've been discussing so far), and 

(2) **Blocks**, a low-level API for designing web apps with more flexible layouts and data flows. Blocks allows you to do things like: feature multiple data flows and demos, control where components appear on the page, handle complex data flows (e.g. outputs can serve as inputs to other functions), and update properties/visibility of components based on user interaction -- still all in Python. If this customizability is what you need, try `Blocks` instead! 

### Hello, Blocks

Let's take a look at a simple example. Note how the API here differs from `Interface`.

$code_hello_blocks
$demo_hello_blocks

A couple things to note:

- a `Blocks` is created with a `with` clause, and any Component created inside this clause is automatically added to the app.
- Components appear vertically in the app in the order they are created. (Later we will cover customizing layouts!)
- a `Button` was created, and then a `click` event-listener was added to this button. The API for this should look familiar! Like an `Interface`, the `click` method takes (1) a python function, (2) input components, and (3) output components. 

### More Complexity

Here's an app to give you a taste of what's possible with Blocks.

$code_blocks_flipper
$demo_blocks_flipper

A lot more going on here! We'll cover how to create complex `Blocks` apps like this in the [Building with Blocks](/building_with_blocks) section of the guides. 

Congrats, you're now familiar with the basics of Gradio 🥳. Onto the [next guide](https://gradio.app/key_features) - or skip around the curriculum if you wish!
# Quickstart

Gradio is an open-source Python package that allows you to quickly **build** a demo or web application for your machine learning model, API, or any arbitary Python function. You can then **share** a link to your demo or web application in just a few seconds using Gradio's built-in sharing features. *No JavaScript, CSS, or web hosting experience needed!*

Usually, it just takes a few lines of Python to create a beautiful demo, so let's get started 💫

## Installation

**Prerequisite**: Gradio requires [Python 3.8 or higher](https://www.python.org/downloads/), that's all!


We recommend Install Gradio using `pip`, which is included by default in Python. Run this in your terminal or command prompt:

```bash
pip install gradio
```

Tip: it is best to install Gradio in a virtual environment. Detailed installation instructions for all common operating systems are here. 

## Building Your First Demo

You can run Gradio in your favorite code editor, Jupyter notebook, or [Google Colab](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing). 

$code_hello_world

Tip: We shorten the imported name to `gr` for better readability of code using Gradio. This is a widely adopted convention that you should follow so that anyone working with your code can easily understand it. 

Now, run your code. If you've written the Python code in a file named, for example, `app.py`, then you would run `python app.py` from the terminal.

The demo below will open in a browser on [http://localhost:7860](http://localhost:7860) if running from a script. If you are running within a browser, it will appear automatically within the notebook.

$demo_hello_world

Tip: When developing locally, you can use the Gradio CLI to launch an app **in hot reload mode**, which automatically reloads the Gradio app whenever you change the file source. To do this, simply type in `gradio` before the name of the file instead of `python`. In the example above, you would type: `gradio app.py`. Learn more about hot reloading in the [Auto-Reloading Guide](https://gradio.app/developing-faster-with-reload-mode/).


## The `Interface` Class

You'll notice that in order to make the demo, we created an instance of the `gr.Interface` class. This `Interface` class can wrap any Python function with a user interface. In the example above, we saw a simple text-based function, but the function could be anything from music generator to a tax calculator to the prediction function of a pretrained machine learning model.

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


## Chatbots

Gradio includes a high-level class, `gr.ChatInterface`, which is similar to `gr.Interface`, but is specifically designed for chatbot UIs. The `gr.ChatInterface` class also wraps a function but this function must have a specific signature. The function should take two arguments: `message` and then `history` (the arguments can be named anything, but must be in this order)

- `message`: a `str` representing the user's input
- `history`: a `list` of `list` representing the conversations up until that point. Each inner list consists of two `str` representing a pair: `[user input, bot response]`.

Your function should return a single string response, which is the bot's response to the particular user input `message`.

Other than that, `gr.ChatInterface` has no required parameters (though several are available for customization of the UI).

Here's a toy example:

$code_chatinterface_random_response
$demo_chatinterface_random_response

You can [read more about `gr.ChatInterface` here](https://gradio.app/guides/creating-a-chatbot-fast).

## Blocks: More Flexibility and Control

Gradio offers two approaches to build apps:

1\. **Interface** and **ChatInterface**, which provide a high-level abstraction for creating demos that we've been discussing so far.

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

A lot more going on here! We'll cover how to create complex `Blocks` apps like this in the [building with blocks](https://gradio.app/blocks-and-event-listeners) section for you.

Congrats, you're now familiar with the basics of Gradio! 🥳 Go to our [next guide](https://gradio.app/key_features) to learn more about the key features of Gradio.

# Quickstart

Gradio is an open-source Python package that allows you to quickly **build** a demo or web application for your machine learning model, API, or any arbitary Python function. You can then **share** a link to your demo or web application in just a few seconds using Gradio's built-in sharing features. *No JavaScript, CSS, or web hosting experience needed!*

Usually, it just takes a few lines of Python to create a beautiful demo, so let's get started 💫

## Installation

**Prerequisite**: Gradio requires [Python 3.8 or higher](https://www.python.org/downloads/), that's all!


We recommend installing Gradio using `pip`, which is included by default in Python. Run this in your terminal or command prompt:

```bash
pip install gradio
```


Tip: it is best to install Gradio in a virtual environment. Detailed installation instructions for all common operating systems <a href="/guides/installing-gradio-in-a-virtual-environment">are here</a>. 

## Building Your First Demo

You can run Gradio in your favorite code editor, Jupyter notebook, [Google Colab](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing), or anywhere else you write Python. Let's write our first Gradio app:


$code_hello_world


Tip: We shorten the imported name from <code>gradio</code> to <code>gr</code> for better readability of code. This is a widely adopted convention that you should follow so that anyone working with your code can easily understand it. 

Now, run your code. If you've written the Python code in a file named, for example, `app.py`, then you would run `python app.py` from the terminal.

The demo below will open in a browser on [http://localhost:7860](http://localhost:7860) if running from a file. If you are running within a notebook, the demo will appear embedded within the notebook.

$demo_hello_world

Type your name in the textbox on the left, and then press the Submit button. You should see a friendly greeting on the right.

Tip: When developing locally, you can run your Gradio app in <strong>hot reload mode</strong>, which automatically reloads the Gradio app whenever you make changes to the file. To do this, simply type in <code>gradio</code> before the name of the file instead of <code>python</code>. In the example above, you would type: `gradio app.py` in your terminal. Learn more about hot reloading in the <a href="https://gradio.app/developing-faster-with-reload-mode/">Hot Reloading Guide</a>.


## Input/Output Demos: The `Interface` Class

You'll notice that in order to make your first demo, you created an instance of the `gr.Interface` class. The `Interface` class is designed to create demos for machine learning models which accept one or more inputs, and return one or more outputs. 

The `Interface` class is very flexible -- it can wrap *any* Python function with a user interface (UI). In the example above, we saw a simple text-based function, but the function could be anything from music generator to a tax calculator to the prediction function of a pretrained machine learning model.

The core `Interface` class is initialized with three required parameters:

- `fn`: the function to wrap a UI around
- `inputs`: which Gradio component(s) to use for the input. The number of components should match the number of arguments in your function.
- `outputs`: which Gradio component(s) to use for the output. The number of components should match the number of return values from your function.


As discussed in the next guide, Gradio includes approximately 30 built-in components (such as the `gr.Textbox()`, `gr.Image()`, `gr.HTML()`, and so on). For the `inputs` and `outputs` arguments, you must pass in the name of one of these components as a string, or an instance of the class. Passing in a class instance allows you to customize the properties of the your component (e.g. the number of lines in a `gr.Textbox()`). 

If your function accepts more than one argument, you can pass in a list of input components to `inputs`, with each input component corresponding to one of the arguments of the function, in order. The same holds true if your function returns more than one value: simply pass in a list of components to `outputs`. 

The following example shows how to use `gr.Interface` with multiple inputs and outputs:


We dive deeper into the `gr.Interface` on our series on [building Interfaces]().

## Chatbots: The `ChatInterface` Class

Gradio includes another high-level class, `gr.ChatInterface`, which is specifically designed to create Chatbot UIs

The `gr.ChatInterface` class also wraps a function, but this function must have a specific signature. The function should take two arguments: `message` and then `history` (the arguments can be named anything, but must be in this order)

- `message`: a `str` representing the user's input
- `history`: a `list` of `list` representing the conversations up until that point. Each inner list consists of two `str` representing a pair: `[user input, bot response]`.

The function should return a single `str` response, which is the bot's response to the particular user input's `message`, and it can also take into account the `history` of messages so far.

Other than that, `gr.ChatInterface` has no required parameters (though several are available for customization of the UI).

Here's a toy example:

$code_chatinterface_random_response
$demo_chatinterface_random_response

You can [read more about `gr.ChatInterface` here](https://gradio.app/guides/creating-a-chatbot-fast).

## Complex Demos: The `Blocks` Class

So far, we've discussed the **Interface** and **ChatInterface** classes, which provide high-level abstractions that let you very quickly create demos for input/output models and chatbots respectively. But what if your demo doesn't fall into one of these cases?

Gradio also includes a **Blocks** class, which offers a low-level API for designing web apps with more flexible layouts and data flows. Blocks allows you to do things like control where components appear on the page, handle complex data flows (e.g. outputs can serve as inputs to other functions), and update properties/visibility of components based on user interaction — still all in Python. 

Let's take a look at a simple example, similar to our first `Interface` demo. Notice how the syntax here differs from `gr.Interface`.

$code_hello_blocks
$demo_hello_blocks

Things to note:

- `Blocks` are made with a `with` clause, and any component created inside this clause is automatically added to the app.
- Components appear vertically in the app in the order they are created. (Later we will cover customizing layouts!)
- A `Button` was created, and then a `click()` event-listener was added to this button. The arguments for the `click()` event should look familiar! Like an `Interface`, the `click()` method takes a Python function, input components, and output components.

You can build very, very complex applications using `gr.Blocks()`. For example, check out the Foocus 

## Sharing Your Demo

What's a good demo if you can't share it? Gradio lets you easily share a machine learning demo without having to worry about the hassle of hosting on a web server. Simply set `share=True`, and a publicly accessible URL will be created for your 


## The Gradio Ecosystem

So far, we've been discussing the core `gradio` Python library. But Gradio is so much more! Its an entire ecosystem of Python and JavaScript libraries that let you build machine learning applications, or query them, quickly in Python or JavaScript. Here are other parts of the Gradio ecosystem:

* Gradio Python Client (`gradio_client`): the easiest way to query any Gradio app
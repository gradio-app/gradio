# Quickstart

Gradio is an open-source Python package that allows you to quickly **build** a demo or web application for your machine learning model, API, or any arbitrary Python function. You can then **share** a link to your demo or web application in just a few seconds using Gradio's built-in sharing features. *No JavaScript, CSS, or web hosting experience needed!*

<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/gif-version.gif" style="padding-bottom: 10px">

It just takes a few lines of Python to create your own demo, so let's get started 💫


## Installation

**Prerequisite**: Gradio requires [Python 3.10 or higher](https://www.python.org/downloads/).


We recommend installing Gradio using `pip`, which is included by default in Python. Run this in your terminal or command prompt:

```bash
pip install --upgrade gradio
```


Tip: It is best to install Gradio in a virtual environment. Detailed installation instructions for all common operating systems <a href="https://www.gradio.app/main/guides/installing-gradio-in-a-virtual-environment">are provided here</a>. 

## Building Your First Demo

You can run Gradio in your favorite code editor, Jupyter notebook, Google Colab, or anywhere else you write Python. Let's write your first Gradio app:


$code_hello_world_4


Tip: We shorten the imported name from <code>gradio</code> to <code>gr</code>. This is a widely adopted convention for better readability of code. 

Now, run your code. If you've written the Python code in a file named `app.py`, then you would run `python app.py` from the terminal.

The demo below will open in a browser on [http://localhost:7860](http://localhost:7860) if running from a file. If you are running within a notebook, the demo will appear embedded within the notebook.

$demo_hello_world_4

Type your name in the textbox on the left, drag the slider, and then press the Submit button. You should see a friendly greeting on the right.

Tip: When developing locally, you can run your Gradio app in <strong>hot reload mode</strong>, which automatically reloads the Gradio app whenever you make changes to the file. To do this, simply type in <code>gradio</code> before the name of the file instead of <code>python</code>. In the example above, you would type: `gradio app.py` in your terminal. Learn more in the <a href="https://www.gradio.app/guides/developing-faster-with-reload-mode">Hot Reloading Guide</a>.


**Understanding the `Interface` Class**

You'll notice that in order to make your first demo, you created an instance of the `gr.Interface` class. The `Interface` class is designed to create demos for machine learning models which accept one or more inputs, and return one or more outputs. 

The `Interface` class has three core arguments:

- `fn`: the function to wrap a user interface (UI) around
- `inputs`: the Gradio component(s) to use for the input. The number of components should match the number of arguments in your function.
- `outputs`: the Gradio component(s) to use for the output. The number of components should match the number of return values from your function.

The `fn` argument is very flexible -- you can pass *any* Python function that you want to wrap with a UI. In the example above, we saw a relatively simple function, but the function could be anything from a music generator to a tax calculator to the prediction function of a pretrained machine learning model.

The `inputs` and `outputs` arguments take one or more Gradio components. As we'll see, Gradio includes more than [30 built-in components](https://www.gradio.app/docs/gradio/introduction) (such as the `gr.Textbox()`, `gr.Image()`, and `gr.HTML()` components) that are designed for machine learning applications. 

Tip: For the `inputs` and `outputs` arguments, you can pass in the name of these components as a string (`"textbox"`) or an instance of the class (`gr.Textbox()`).

If your function accepts more than one argument, as is the case above, pass a list of input components to `inputs`, with each input component corresponding to one of the arguments of the function, in order. The same holds true if your function returns more than one value: simply pass in a list of components to `outputs`. This flexibility makes the `Interface` class a very powerful way to create demos.

We'll dive deeper into the `gr.Interface` on our series on [building Interfaces](https://www.gradio.app/main/guides/the-interface-class).

## Sharing Your Demo

What good is a beautiful demo if you can't share it? Gradio lets you easily share a machine learning demo without having to worry about the hassle of hosting on a web server. Simply set `share=True` in `launch()`, and a publicly accessible URL will be created for your demo. Let's revisit our example demo,  but change the last line as follows:

```python
import gradio as gr

def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="textbox", outputs="textbox")
    
demo.launch(share=True)  # Share your demo with just 1 extra parameter 🚀
```

When you run this code, a public URL will be generated for your demo in a matter of seconds, something like:

👉 &nbsp; `https://a23dsf231adb.gradio.live`

Now, anyone around the world can try your Gradio demo from their browser, while the machine learning model and all computation continues to run locally on your computer.

To learn more about sharing your demo, read our dedicated guide on [sharing your Gradio application](https://www.gradio.app/guides/sharing-your-app).


## An Overview of Gradio

So far, we've been discussing the `Interface` class, which is a high-level class that lets to build demos quickly with Gradio. But what else does Gradio include?

### Custom Demos with `gr.Blocks`

Gradio offers a low-level approach for designing web apps with more customizable layouts and data flows with the `gr.Blocks` class. Blocks supports things like controlling where components appear on the page, handling multiple data flows and more complex interactions (e.g. outputs can serve as inputs to other functions), and updating properties/visibility of components based on user interaction — still all in Python. 

You can build very custom and complex applications using `gr.Blocks()`. For example, the popular image generation [Automatic1111 Web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) is built using Gradio Blocks. We dive deeper into the `gr.Blocks` on our series on [building with Blocks](https://www.gradio.app/guides/blocks-and-event-listeners).

### Chatbots with `gr.ChatInterface`

Gradio includes another high-level class, `gr.ChatInterface`, which is specifically designed to create Chatbot UIs. Similar to `Interface`, you supply a function and Gradio creates a fully working Chatbot UI. If you're interested in creating a chatbot, you can jump straight to [our dedicated guide on `gr.ChatInterface`](https://www.gradio.app/guides/creating-a-chatbot-fast).

### The Gradio Python & JavaScript Ecosystem

That's the gist of the core `gradio` Python library, but Gradio is actually so much more! It's an entire ecosystem of Python and JavaScript libraries that let you build machine learning applications, or query them programmatically, in Python or JavaScript. Here are other related parts of the Gradio ecosystem:

* [Gradio Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client) (`gradio_client`): query any Gradio app programmatically in Python.
* [Gradio JavaScript Client](https://www.gradio.app/guides/getting-started-with-the-js-client) (`@gradio/client`): query any Gradio app programmatically in JavaScript.
* [Gradio-Lite](https://www.gradio.app/guides/gradio-lite) (`@gradio/lite`): write Gradio apps in Python that run entirely in the browser (no server needed!), thanks to Pyodide. 
* [Hugging Face Spaces](https://huggingface.co/spaces): the most popular place to host Gradio applications — for free!

## What's Next?

Keep learning about Gradio sequentially using the Gradio Guides, which include explanations as well as example code and embedded interactive demos. Next up: [let's dive deeper into the Interface class](https://www.gradio.app/guides/the-interface-class).

Or, if you already know the basics and are looking for something specific, you can search the more [technical API documentation](https://www.gradio.app/docs/).


## Gradio Sketch

You can also build Gradio applications without writing any code. Simply type `gradio sketch` into your terminal to open up an editor that lets you define and modify Gradio components, adjust their layouts, add events, all through a web editor. Or [use this hosted version of Gradio Sketch, running on Hugging Face Spaces](https://huggingface.co/spaces/aliabid94/Sketch).
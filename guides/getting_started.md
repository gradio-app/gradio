## Quickstart

**Prerequisite**: Gradio requires Python 3.7 or above, that's it! 

### What Problem is Gradio Solving? 😲

One of the *best ways to share* your machine learning model, API, or data science workflow with others is to create an **interactive demo** that allows your users or colleagues to try out the demo in their browsers. 

A web-based demo is great as it allows anyone who can use a browser (not just technical people) to intuitively try their own inputs and understand what you've built. 

However, creating such web-based demos has traditionally been difficult, as you needed to know web hosting to serve the web app and web development (HTML, CSS, JavaScript) to build a GUI for your demo. 

Gradio allows you to **build demos and share them, directly in Python.** And usually in just a few lines of code! So let's get started. 

### Hello, World ⚡

To get Gradio running with a simple "Hello, World" example, follow these three steps:

<span>1.</span> Install Gradio from pip.

```bash
pip install gradio
```

<span>2.</span> Run the code below as a Python script or in a Python notebook (or in a  [colab notebook](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)).

{{ code["hello_world"] }}

<span>3.</span> The demo below will appear automatically within the Python notebook, or pop in a browser on  [http://localhost:7860](http://localhost:7860/)  if running from a script.

{{ demos["hello_world"] }}

### The `Interface` class 🧡

You'll notice that in order to create the demo, we defined a `gradio.Interface` class. This `Interface` class can wrap almost any Python function with a  user interface. In the example above, we saw a simple text-based function. But the function could be anything from music generator to a tax calculator to (most commonly) the prediction function of a pretrained machine learning model.

The core `Interface` class is initialized with three required parameters:

-   `fn`: the function to wrap a UI around
-   `inputs`: which component(s) to use for the input, e.g. `"text"` or `"image"` or `"audio"` 
-   `outputs`: which component(s) to use for the output, e.g. `"text"` or `"image"` `"label"`

Gradio includes more than 20 different components, most of which can be used as inputs or outputs. ([See docs for complete list](/docs))

### Components Attributes 💻

With these three arguments to `Interface`, you can quickly create user interfaces and  `launch()`  them. But what if you want to change how the UI components look or behave?

Let's say you want to customize the input text field - for example, you wanted it to be larger and have a text hint. If we use the actual input class for  `Textbox`  instead of using the string shortcut, you have access to much more customizability through component attributes.

{{ code["hello_world_2"] }}
{{ demos["hello_world_2"] }}

 To see a list of all the components Gradio supports and what attributes you can use to customize them, check out the [Docs](https://gradio.app/docs).

### Multiple Inputs and Outputs 🔥

Let's say you had a much more complex function, with multiple inputs and outputs. In the example below, we define a function that takes a string, boolean, and number, and returns a string and number. Take a look how you pass a list of input and output components.

{{ code["hello_world_3"] }}
{{ demos["hello_world_3"] }}

You simply wrap the components in a list. Each component in the `inputs` list corresponds to one of the parameters of the function, in order. Each component in the `outputs` list corresponds to one of the values returned by the function, again in order. 

### Images 🎨

Let's try an image-to-image function! When using the  `Image`  component, your function will receive a numpy array of your specified size, with the shape  `(width, height, 3)`, where the last dimension represents the RGB values. We'll return an image as well in the form of a numpy array.

{{ code["sepia_filter"] }}
{{ demos["sepia_filter"] }}

Additionally, our  `Image`  input interface comes with an 'edit' button ✏️ which opens tools for cropping, flipping, rotating, drawing over, and applying filters to images. We've found that manipulating images in this way can help reveal biases or hidden flaws in a machine learning model!

In addition to images, Gradio supports other media types, such as audio or video. Read about these in the [Docs](https://gradio.app/docs).

### DataFrames and Graphs 📈

You can use Gradio to support inputs and outputs from your typical data libraries, such as numpy arrays, pandas dataframes, and plotly graphs. Take a look at the demo below (ignore the complicated data manipulation in the function!)

{{ code["sales_projections"] }}
{{ demos["sales_projections"] }}

### Example Inputs 🦮

You can provide example data that a user can easily load into the model. This can be helpful to demonstrate the types of inputs the model expects, as well as to provide a way to explore your dataset in conjunction with your model. To load example data, you can provide a **nested list** to the  `examples=`  keyword argument of the Interface constructor. Each sublist within the outer list represents a data sample, and each element within the sublist represents an input for each input component. The format of example data for each component is specified in the  [Docs](https://gradio.app/docs).

{{ code["calculator"] }}
{{ demos["calculator"] }}

You can load a large dataset into the examples to browse and interact with the dataset through Gradio. The examples will be automatically paginated (you can configure this through the `examples_per_page` argument of `Interface`).

### Live Interfaces 🪁

You can make interfaces automatically refresh by setting `live=True` in the interface. Now the interface will recalculate as soon as the user input changes.

{{ code["calculator_live"] }}
{{ demos["calculator_live"] }}

Note there is no submit button, because the interface resubmits automatically on change.

### Flagging 🚩

Underneath the output interfaces, there is a "Flag" button. When a user testing your model sees input with interesting output, such as erroneous or unexpected model behaviour, they can flag the input for the interface creator to review. Within the directory provided by the  `flagging_dir=`  argument to the Interface constructor, a CSV file will log the flagged inputs. If the interface involves file data, such as for Image and Audio components, folders will be created to store those flagged data as well.

For example, with the calculator interface shown above, we would have the flagged data stored in the flagged directory shown below:

```directory
+-- calculator.py
+-- flagged/
|   +-- logs.csv
```

*flagged/logs.csv*
```csv
num1,operation,num2,Output
5,add,7,12
6,subtract,1.5,4.5
```

With the sepia interface shown above, we would have the flagged data stored in the flagged directory shown below:

```directory
+-- sepia.py
+-- flagged/
|   +-- logs.csv
|   +-- im/
|   |   +-- 0.png
|   |   +-- 1.png
|   +-- Output/
|   |   +-- 0.png
|   |   +-- 1.png
```

*flagged/logs.csv*
```csv
im,Output
im/0.png,Output/0.png
im/1.png,Output/1.png
```

You can review these flagged inputs by manually exploring the flagging directory, or load them into the examples of the Gradio interface by pointing the  `examples=`  argument to the flagged directory. If you wish for the user to provide a reason for flagging, you can pass a list of strings to the `flagging_options` argument of Interface. Users will have to select one of the strings when flagging, which will be saved as an additional column to the CSV.

### Blocks: More Flexibility and Control 🧱

Gradio offers two APIs to users: (1) **Interface**, a high level abstraction for creating demos (that we've been discussing so far), and (2) **Blocks**, a low-level API for designing web apps with more flexible layouts and data flows. Blocks allows you to do things like: group together related demos, change where components appear on the page, handle complex data flows (e.g. outputs can serve as inputs to other functions), and update properties/visibility of components based on user interaction -- still all in Python. 

As an example, Blocks uses nested `with` statements in Python to lay out components on a page, like this:

{{ code["blocks_flipper"] }}

{{ demos["blocks_flipper"] }}


If you are interested in how Blocks works, [read its dedicated Guide](introduction_to_blocks).

### Sharing Demos 🌎

Gradio demos can be easily shared publicly by setting `share=True` in the `launch()` method. Like this:

```python
gr.Interface(classify_image, "image", "label").launch(share=True)
```

This generates a public, shareable link that you can send to anybody! When you send this link, the user on the other side can try out the model in their browser. Because the processing happens on your device (as long as your device stays on!), you don't have to worry about any packaging any dependencies. A share link usually looks something like this:  **XXXXX.gradio.app**. Although the link is served through a Gradio URL, we are only a proxy for your local server, and do not store any data sent through the interfaces.

Keep in mind, however, that these links are publicly accessible, meaning that anyone can use your model for prediction! Therefore, make sure not to expose any sensitive information through the functions you write, or allow any critical changes to occur on your device. If you set `share=False` (the default, except in colab notebooks), only a local link is created, which can be shared by  [port-forwarding](https://www.ssh.com/ssh/tunneling/example)  with specific users. 

Share links expire after 72 hours. For permanent hosting, see the next section.

![Sharing diagram](/assets/img/sharing.svg)

### Hosting Gradio Demo on Spaces 🤗

If you'd like to have a permanent link to your Gradio demo on the internet, use Huggingface Spaces. Hugging Face Spaces provides the infrastructure to permanently host your machine learning model for free! 

You can either drag and drop a folder containing your Gradio model and all related files, or you can point Spaces to your Git repository and Spaces will pull the Gradio interface from there. See [Huggingface Spaces](http://huggingface.co/spaces/) for more information. 

![Hosting Demo](/assets/img/hf_demo.gif)

### Next Steps

Now that you're familiar with the basics of Gradio, here are some good next steps:

* Check out [the free Gradio course](https://huggingface.co/course/chapter9/1) for a step-by-step walkthrough of everything Gradio-related with lots of examples of how to build your own machine learning demos 📖
* Gradio offers two APIs to users: **Interface**, a high level abstraction covered in this guide, and **Blocks**, a more flexible API for designing web apps with more flexible layouts and data flows. [Read more about Blocks here](/introduction_to_blocks/) 🧱
* If you'd like to stick with **Interface**, but want to add more advanced features to your demo (like authentication, interpretation, or state), check out our guide on [advanced features with the Interface class](/advanced_interface_features) 💪
* If you just want to explore what demos other people have built with Gradio, [browse public Hugging Face Spaces](http://hf.space/), view the underlying Python code, and be inspired 🤗


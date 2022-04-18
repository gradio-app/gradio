## Introduction to the Blocks API 
 
Gradio is a Python library that allows you to quickly build machine learning demos, data science dashboards, or other kinds of web apps, **entirely in Python**. These web apps can be launched from wherever you use Python (jupyter notebooks, colab notebooks, Python terminal, etc.) and shared with anyone instantly using Gradio's auto-generated share links.

To offer both simplicity and more powerful and flexible control for advanced web apps, Gradio offers two different APIs to users:

* `gradio.Interface`: a high-level API that allows you to create a machine learning demo simply by specifying a list of inputs and outputs.

* `gradio.Blocks`: a low-level API that allows you to have full control over the data flows and layout of your application. You can build very complex, multi-step applications using Blocks.

This Guide will teach you the Blocks API and we will create several custom web apps in the process. It will be helpful if you are already familiar with the Interface API before you read this tutorial.

### Why Blocks?

If you have already used `gradio.Interface`, you know that you can easily create fully-fledged machine learning demos with just a few lines of code. The Interface API is very convenient but in some cases may not be sufficiently flexible for your needs. For example, you might want to:

* Group together related demos in one web app
* Change the layout of the components instead of just having the inputs on the left and outputs on the right
* Have multi-step interfaces, in which the output of one model becomes the input to the next model
* Change components based on the input into another component 

These are all use cases where you should use the Blocks API!

### Getting Started with Blocks

After you have installed Gradio, run the code below as a Python script or in a Python notebook (or in a  [colab notebook](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)).

{{ code["hello_world"] }}

<span>3.</span> The interface below will appear automatically within the Python notebook, or pop in a browser on  [http://localhost:7860](http://localhost:7860/)  if running from a script.

{{ demos["hello_world"] }}

### Understanding `Blocks` class

Gradio can wrap almost any Python function with an easy-to-use user interface. In the example above, we saw a simple text-based function. But the function could be anything from image enhancer to a tax calculator to (most commonly) the prediction function of a pretrained machine learning model.

The core  `Interface`  class is initialized with three parameters:

-   `fn`: the function to wrap
-   `inputs`: the input component type(s), e.g. `"image"` or `"audio"` ([see docs for complete list](/docs))
-   `outputs`: the output component type(s) e.g. `"image"` or `"label"` ([see docs for complete list](/docs))

With these three arguments, we can quickly create interfaces and  `launch()`  them. But what if you want to change how the UI components look or behave?


### Sharing Interfaces Publicly

Interfaces can be easily shared publicly by setting `share=True` in the `launch()` method. Like this:

```python
gr.Interface(classify_image, "image", "label").launch(share=True)
```

This generates a public, shareable link that you can send to anybody! When you send this link, the user on the other side can try out the model in their browser. Because the processing happens on your device (as long as your device stays on!), you don't have to worry about any packaging any dependencies. If you're working out of colab notebook, a share link is always automatically created. It usually looks something like this:  **XXXXX.gradio.app**. Although the link is served through a gradio link, we are only a proxy for your local server, and do not store any data sent through the interfaces.

Keep in mind, however, that these links are publicly accessible, meaning that anyone can use your model for prediction! Therefore, make sure not to expose any sensitive information through the functions you write, or allow any critical changes to occur on your device. If you set `share=False` (the default), only a local link is created, which can be shared by  [port-forwarding](https://www.ssh.com/ssh/tunneling/example)  with specific users. 

Share links expire after 72 hours. For permanent hosting, see Hosting Gradio Apps on Spaces below.

![Sharing diagram](/assets/img/sharing.svg)

### Hosting Gradio Apps on Spaces

Huggingface provides the infrastructure to permanently host your Gradio model on the internet, for free! You can either drag and drop a folder containing your Gradio model and all related files, or you can point HF Spaces to your Git repository and HF Spaces will pull the Gradio interface from there. See [Huggingface Spaces](http://huggingface.co/spaces/) for more information. 

![Hosting Demo](/assets/img/hf_demo.gif)


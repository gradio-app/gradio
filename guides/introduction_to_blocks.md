## Introduction to the Blocks API 
 
Gradio is a Python library that allows you to quickly build web-based machine learning demos, data science dashboards, or other kinds of web apps, **entirely in Python**. These web apps can be launched from wherever you use Python (jupyter notebooks, colab notebooks, Python terminal, etc.) and shared with anyone instantly using Gradio's auto-generated share links.

To offer both simplicity and more powerful and flexible control for advanced web apps, Gradio offers two different APIs to users:

* `gradio.Interface`: a high-level API that allows you to create a machine learning demo simply by specifying a list of inputs and outputs.

* `gradio.Blocks`: a low-level API that allows you to have full control over the data flows and layout of your application. You can build very complex, multi-step applications using Blocks.

This Guide will teach you the **Blocks API** and we will create several custom web apps in the process. It will be helpful but not necessary to be familiar with the Interface API before you read this tutorial.

### Why Blocks?

If you have already used `gradio.Interface`, you know that you can easily create fully-fledged machine learning demos with just a few lines of code. The Interface API is very convenient but in some cases may not be sufficiently flexible for your needs. For example, you might want to:

* Group together related demos as multiple tabs in one web app
* Change the layout of your demo instead of just having all of the inputs on the left and outputs on the right
* Have multi-step interfaces, in which the output of one model becomes the input to the next model, or have more flexible data flows in general
* Change a component's properties (for example, the choices in a Dropdown) or its visibilty based on user input

These are all use cases where you should use the Blocks API!


### Getting Started with Blocks

After you have installed Gradio, run the code below as a Python script or in a Python notebook (or in a  [colab notebook](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing))

{{ code["blocks_hello"] }}

The interface below will appear automatically within the Python notebook, or pop in a browser on  [http://localhost:7860](http://localhost:7860/)  if running from a script.

{{ demos["blocks_hello"] }}

### Understanding this Example

This simple example introduces a few concepts about Blocks:

1. Blocks allow you to build web applications that combine markdown, HTML, buttons, and interactive **components** simply by instantiating objects in Python inside of a "`with gradio.Blocks`" context. The *order* in which you instantiate components matters as each element gets rendered into the web app in the order it was defined. (More complex layouts are discussed below)

2. You can define **regular Python functions** anywhere inside your code and use them to run arbitrary Python code on user input. Here, we have a simple function that adds a welcome message before a user's name, but you can write *any* Python function, from a simple calculation to running inference from a machine learning model.

3. You can assign **events** to any component to run a function when the component is clicked/changed/etc. When you assign an event, you must pass in three parameters:
* `fn`: the function to run
* `inputs`: a (list of) component(s) whose values should supplied as the input parameters to the function
* `outputs`: a (list of) component(s) whose values should be updated based on the values returned by the function

    In this example, we run the `update()` function when the value in the `Textbox` named `inp` changes. The function reads the value in `inp`, passes it as the `name` parameter to `update()`, which then supplies value to our second `Textbox` named `out`. 
    
    To see a list of events that each component supports, see the docs.


4. Blocks automatically figures out whether a component should be **interactive** (accept user input) or not, based on the event triggers you define. In our example, the first textbox is interactive, since its value is used by the `update()` function. The second textbox is not interactive, since its value is never used. In rare cases, you might want to override this, which you can do by passing the appropriate boolean to `interactive`, a  parameter that every component accepts.

5. You can write and `launch()` your Blocks anywhere: jupyter notebooks, colab notebooks, or regular Python IDEs since Gradio uses the standard Python interpreter. You can also share Blocks with other people by a single parameter: `launch(share=True)`, which we will discuss at the end of this guide.

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


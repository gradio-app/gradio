# Introduction to Gradio Blocks 🧱 

Pinned: 2
Docs: update

Gradio is a Python library that allows you to quickly build web-based machine learning demos, data science dashboards, or other kinds of web apps, **entirely in Python**. These web apps can be launched from wherever you use Python (jupyter notebooks, colab notebooks, Python terminal, etc.) and shared with anyone instantly using Gradio's auto-generated share links.

To offer both simplicity and more powerful and flexible control for advanced web apps, Gradio offers two different APIs to users:

* ⚡`gradio.Interface`: a high-level API that allows you to create a full machine learning demo simply by providing a list of inputs and outputs.

* 🧱 `gradio.Blocks`: a low-level API that allows you to have full control over the data flows and layout of your application. You can build very complex, multi-step applications using Blocks (as in "building blocks").

This Guide will teach you the **Blocks API** and we will create several custom web apps in the process. It will be helpful but not necessary to be familiar with the Interface API before you read this tutorial.

## Why Blocks 🧱?

If you have already used `gradio.Interface`, you know that you can easily create fully-fledged machine learning demos with just a few lines of code. The Interface API is very convenient but in some cases may not be sufficiently flexible for your needs. For example, you might want to:

* Group together related demos as multiple tabs in one web app
* Change the layout of your demo instead of just having all of the inputs on the left and outputs on the right
* Have multi-step interfaces, in which the output of one model becomes the input to the next model, or have more flexible data flows in general
* Change a component's properties (for example, the choices in a Dropdown) or its visibilty based on user input

These are all use cases where you should use the Blocks API!


## "Hello World" with Blocks

After you have installed Gradio, run the code below as a Python script or in a Python notebook (or in a  [colab notebook](https://colab.research.google.com/drive/1n_uB44G_uENGf0zroeVKgcytFQ-7UwZt?usp=sharing))

$code_blocks_hello

The interface below will appear automatically within the Python notebook, or pop in a browser on  [http://localhost:7860](http://localhost:7860/)  if running from a script.

$demo_blocks_hello


## Understanding this Example

This simple example introduces 5 concepts that underlie Blocks:

1. Blocks allow you to build web applications that combine markdown, HTML, buttons, and interactive **components** simply by *instantiating* objects in Python inside of a "`with gradio.Blocks`" context. The *order* in which you instantiate components <u>matters</u> as each element gets rendered into the web app in the order it was created. (More complex layouts are discussed below)

2. You can define **regular Python functions** anywhere in your code and run them with user input using BLocks. In our example, we have a simple function that adds a welcome message before a user's name, but you can write *any* Python function, from a simple calculation to large machine learning model's inference.

3. You can assign **events** to any Blocks component. This will run your function when the component is clicked/changed/etc. When you assign an event, you pass in three parameters: `fn`: the function  that should be called, `inputs`: the (list) of input component(s), and `outputs`: the (list) of output components that should be called.<p /> 
In this example, we run the `update()` function when the value in the `Textbox` named `inp` changes. The event reads the value in `inp`, passes it as the `name` parameter to `update()`, which then returns a value that gets assigned to our second `Textbox` named `out`. <p /> To see a list of events that each component supports, see [the documentation](https://www.gradio.app/docs).


4. Blocks automatically figures out whether a component should be **interactive** (accept user input) or not, based on the event triggers you define. In our example, the first textbox is interactive, since its value is used by the `update()` function. The second textbox is not interactive, since its value is never used as an input. In some cases, you might want to override this, which you can do by passing the appropriate boolean to `interactive`, a  parameter that every component accepts.

5. You can write and `launch()` your Blocks anywhere: jupyter notebooks, colab notebooks, or regular Python IDEs since Gradio uses the standard Python interpreter. You can also share Blocks with other people by setting a single parameter: `launch(share=True)`, which we will discuss towards the end of this guide.

## Layouts

By default, `Blocks` renders the components that you create *vertically in one column*. You can change that by creating additional columns (`with gradio.Column():`) or rows (`with gradio.Row():`) and creating components within those contexts.

Here's what you should keep in mind: any components created under a `Column` (this is also the default) will be laid out *vertically*. Any component created under a `Row` will be laid out *horizontally*, similar to the [flexbox model in web development](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox).

Finally, you can also create a `with gradio.Tabs():` and within it create multiple  `with gradio.TabItem(name_of_tab):` children. Any component created inside of a `with gradio.TabItem(name_of_tab):` context appears in that tab.

Here is a example with tabs, rows, and columns:

$code_blocks_flipper

$demo_blocks_flipper

You'll notice that in this example, we've also created a `Button` component in each tab, and we've assigned a click event to each button, which is what actually runs the function. So let's talk more about events... 

## Events

Just as you can control the layout, `Blocks` gives you fine-grained control over what events trigger function calls. Each component and many layouts have specific events that they support. 

For example, the `Textbox` component has 2 events: `change()` (when the value inside of the textbox changes), and `submit()` (when a user presses the enter key while focused on the textbox). More complex components can have even more events: for example, the `Audio` component also has separate events for when the audio file is played, cleared, paused, etc. See [the documentation](https://www.gradio.app/docs) for the events each component supports. 

You can attach event trigger to none, one, or more of these events. You create an event trigger by calling the name of the event on the component instance as a function -- e.g. `textbox.change(...)` or `btn.click(...)`. The function takes in three parameters, as discussed above:

* `fn`: the function to run
* `inputs`: a (list of) component(s) whose values should supplied as the input parameters to the function. Each component's value gets mapped to the corresponding function parameter, in order. This parameter can be `None` if the function does not take any parameters.
* `outputs`: a (list of) component(s) whose values should be updated based on the values returned by the function. Each return value gets sets the corresponding component's value, in order. This parameter can be `None` if the function does not return anything.

You can even make the input and output component be the same component, as we do in this example that uses a GPT model to do text completion:

$code_blocks_gpt

$demo_blocks_gpt

## Multistep Demos

In some cases, you might want want a "multi-step" demo, in which you reuse the output of one function as the input to the next. This is really easy to do with Blocks, as you can use a component for the input of one event trigger but the output of another. Take a look at the `text` component in the example below, its value is the result of a speech-to-text model, but also gets passed into a sentiment analysis model:

$code_blocks_speech_text_length

$demo_blocks_speech_text_length

## Updating Component Properties

So far, we have seen how to create events to update the value of another component. But if you want to change *other properties*  of a component (like the visibility of a textbox or the choices in a radio button group)? You can do this by returning a component class's `update()`  method instead of a regular return value from your function. 

This is perhaps most easily illustrated with an example:

$code_blocks_essay

$demo_blocks_essay

You can also use the `gradio.update` function as a short-hand for using the component class's update method.

Here is the previous demo rewritten with `gradio.update`:

$code_blocks_essay_update

## Setting Default Values on Components

You can control the default value displayed in your components when the app first launches by setting the `value` parameter in the component constructor.

In the following simple calculator demo, `num_1` and `num_2` take on the values 4 and 0, respectively, when the app launches.

$code_calculator_blocks
$demo_calculator_blocks

This will work for all components, not just numbers. For example, setting `value` on a `gr.Image` equal to the full filepath of an image
will load that image into the component when the app launches.

## Sharing Blocks Publicly

Blocks  can be easily shared publicly by setting `share=True` in the `launch()` method. Like this:

```python
demo = gr.Blocks()

with demo:
    ...  # define components & events here

demo.launch(share=True)
```

This generates a public, shareable link that you can send to anybody! When you send this link, the user on the other side can try out the demo in their browser. Because the processing happens on your device (as long as your device stays on!), you don't have to worry about any packaging any dependencies. If you're working out of colab notebook, a share link is always automatically created. It usually looks something like this:  **XXXXX.gradio.app**. Although the link is served through a gradio link, we are only a proxy for your local server, and do not store any data sent through the demo.

Keep in mind, however, that these links are publicly accessible, meaning that anyone can use your model for prediction! Therefore, make sure not to expose any sensitive information through the functions you write, or allow any critical changes to occur on your device. If you set `share=False` (the default), only a local link is created, which can be shared by  [port-forwarding](https://www.ssh.com/ssh/tunneling/example) with specific users. 

Share links expire after 72 hours. For permanent hosting, see Hosting Gradio Blocks on Spaces below.

![Sharing diagram](/assets/guides/sharing.svg)

## Hosting Gradio Blocks on Spaces

Huggingface provides the infrastructure to permanently host your Gradio demo on the internet, for free! You can either drag and drop a folder containing your Gradio model and all related files, or you can point HF Spaces to your Git repository and HF Spaces will pull the Gradio interface from there. It's just as easy to share a Blocks demo as it is a regular Gradio Interface.

See [Huggingface Spaces](http://huggingface.co/spaces/) for more information. 

![Hosting Demo](/assets/guides/hf_demo.gif)


## Developing Quickly with Reload Mode

**Prerequisite**: This Guide builds on the Quickstart. Make sure to [read the Quickstart first](/getting_started).

<span id="advanced-features"></span>

In this Guide, we go through several advanced functionalities that your `gradio.Interface` demo can include without you needing to write much more code!

### Authentication 🔒

You may wish to put an authentication page in front of your interface to limit who can open your interface. With the `auth=` keyword argument in the `launch()` method, you can pass a list of acceptable username/password tuples; or, for more complex authentication handling, you can even pass a function that takes a username and password as arguments, and returns True to allow authentication, False otherwise. Here's an example that provides password-based authentication for a single user named "admin":

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label).launch(
    auth=("admin", "pass1234")
)
```

### Interpreting your Predictions 🔬

Most models are black boxes such that the internal logic of the function is hidden from the end user. To encourage transparency, we've made it very easy to add interpretation to your model by  simply setting the `interpretation` keyword in the `Interface` class to `default`. This allows your users to understand what parts of the input are responsible for the output. Take a look at the simple interface below which shows an image classifier that also includes interpretation:

{{ code["image_classifier_interpretation"] }}


In addition to `default`, Gradio also includes [Shapley-based interpretation](https://christophm.github.io/interpretable-ml-book/shap.html), which provides more accurate interpretations, albeit usually with a slower runtime. To use this, simply set the `interpretation` parameter to `"shap"` (note: also make sure the python package `shap` is installed). Optionally, you can modify the the `num_shap` parameter, which controls the tradeoff between accuracy and runtime (increasing this value generally increases accuracy). Here is an example:

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label, interpretation="shap", num_shap=5).launch()
```

This will work for any function, even if internally, the model is a complex neural network or some other black box. If you use Gradio's `default` or `shap` interpretation, the output component must be a `Label`. All common input components are supported. Here is an example with text input.

{{ code["gender_sentence_default_interpretation"] }}

So what is happening under the hood? With these interpretation methods, Gradio runs the prediction multiple times with modified versions of the input. Based on the results, you'll see that the interface automatically highlights the parts of the text (or image, etc.) that contributed increased the likelihood of the class as red. The intensity of color corresponds to the importance of that part of the input. The parts that decrease the class confidence are highlighted blue.

You can also write your own interpretation function. The demo below adds custom interpretation to the previous demo. This function will take the same inputs as the main wrapped function. The output of this interpretation function will be used to highlight the input of each input interface - therefore the number of outputs here corresponds to the number of input interfaces. To see the format for interpretation for each input interface, check the Docs.

{{ code["gender_sentence_custom_interpretation"] }}

### Custom Styling 🧑‍🎨

If you'd like to have more fine-grained control over any aspect of your demo, you can also write your own css or pass in a css file, with the `css` parameter of the `Interface` class.

### Custom Flagging Options 🎌

In some cases, you might like to provide your users or testers with *more* than just a binary option to flag a sample. You can provide `flagging_options` that they select from a dropdown each time they click the flag button. This lets them provide additional feedback every time they flag a sample.

Here's an example:

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label, flagging_options=["incorrect", "ambiguous", "offensive", "other"]).launch()
```

### Loading Hugging Face Models and Spaces 🤗

Gradio integrates nicely with the Hugging Face Hub, allowing you to load models and Spaces with just one line of code. To use this, simply use the `load()` method in the `Interface` class. So:

- To load any model from the Hugging Face Hub and create an interface around it, you pass `"model/"` or `"huggingface/"` followed by the model name, like these examples:

```python
gr.Interface.load("huggingface/gpt2").launch();
```

```python
gr.Interface.load("huggingface/EleutherAI/gpt-j-6B", 
    inputs=gr.inputs.Textbox(lines=5, label="Input Text")  # customizes the input component
).launch()
```

- To load any Space from the Hugging Face Hub and recreate it locally (so that you can customize the inputs and outputs for example), you pass `"spaces/"` followed by the model name:

```python
gr.Interface.load("spaces/eugenesiow/remove-bg", inputs="webcam", title="Remove your webcam background!").launch()
```

One of the great things about loading Hugging Face models or spaces using Gradio is that you can then immediately use the resulting `Interface` object just like function in your Python code (this works for every type of model/space: text, images, audio, video, and even multimodal models):

```python
io = gr.Interface.load("models/EleutherAI/gpt-neo-2.7B")
io("It was the best of times")  # outputs model completion
```

### Putting Interfaces in Parallel and Series ⏸

Gradio also lets you mix interfaces very easily using the `gradio.Parallel` and `gradio.Series` classes. `Parallel` lets you put two similar models (if they have the same input type) in parallel to compare model predictions:

```python
generator1 = gr.Interface.load("huggingface/gpt2")
generator2 = gr.Interface.load("huggingface/EleutherAI/gpt-neo-2.7B")
generator3 = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

gr.Parallel(generator1, generator2, generator3).launch()
```

`Series` lets you put models and spaces in series, piping the output of one model into the input of the next model. 

```python
generator = gr.Interface.load("huggingface/gpt2")
translator = gr.Interface.load("huggingface/t5-small")

gr.Series(generator, translator).launch()  # this demo generates text, then translates it to German, and outputs the final result.
```

And of course, you can also mix `Parallel` and `Series` together whenever that makes sense!

### Queuing to Manage Long Inference Times 👥

If many people are using your interface or if the inference time of your function is long (> 1min), simply set the `enable_queue` parameter in the `launch` method to `True` to prevent timeouts.

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label).launch(enable_queue=True)
```

This sets up a queue of workers to handle the predictions and return the response to the front end. This is strongly recommended if you are planning on uploading your demo to Hugging Face Spaces (as described above) so that you can manage a large number of users simultaneously using your demo.


### Stateful Demos ✨

Your function may use data that persists beyond a single function call. If the data is something accessible to all function calls and all users, you can create a variable outside the function call and access it inside the function. For example, you may load a large model outside the function and use it inside the function so that every function call does not need to reload the model.

Another type of data persistence Gradio supports is session **state**, where data persists across multiple submits within a page load. However, data is *not* shared between different users of your model. To store data in a session state, you need to do three things: (1) Pass in an extra parameter into your function, which represents the state of the interface. (2) At the end of the function, return the updated value of the state as an extra return value (3) Add the `'state'` input and `'state'` output components when creating your `Interface`. See the chatbot example below: 

{{ code["chatbot_demo"] }}
{{ demos["chatbot_demo"] }}

Notice how the state persists across submits within each page, but the state is not shared between the two pages. Some more points to note: you can pass in a default value to the state parameter, which is used as the initial value of the state. The state must be a something that can be serialized to a JSON format (e.g. a dictionary, a list, or a single value. Typically, objects will not work).  


### Next Steps

Now that you know all about `gradio.Interface`, here are some good next steps:

* Check out [the free Gradio course](https://huggingface.co/course/chapter9/1) for a step-by-step walkthrough of everything Gradio-related with lots of examples of how to build your own machine learning demos 📖
* Gradio offers two APIs to users: **Interface**, a high level abstraction covered in this guide, and **Blocks**, a more flexible API for designing web apps with more flexible layouts and data flows. [Read more about Blocks here](/introduction_to_blocks/) 🧱
* If you just want to explore what demos other people have built with Gradio, [browse public Hugging Face Spaces](http://hf.space/), view the underlying Python code, and be inspired 🤗


# Key Features

Let's go through some of the key features of Gradio. This guide is intended to be a high-level overview of various things that you should be aware of as you build your demo. Where appropriate, we link to more detailed guides on specific topics.

1. [Components](#components)
2. [Queuing](#queuing)
3. [Streaming outputs](#streaming-outputs)
4. [Streaming inputs](#streaming-inputs)
5. [Alert modals](#alert-modals)
6. [Styling](#styling)
7. [Progress bars](#progress-bars)
8. [Batch functions](#batch-functions)

## Components

Gradio includes more than 30 pre-built components (as well as many user-built _custom components_) that can be used as inputs or outputs in your demo with a single line of code. These components correspond to common data types in machine learning and data science, e.g. the `gr.Image` component is designed to handle input or output images, the `gr.Label` component displays classification labels and probabilities, the `gr.Plot` component displays various kinds of plots, and so on.

Each component includes various constructor attributes that control the properties of the component. For example, you can control the number of lines in a `gr.Textbox` using the `lines` argument (which takes a positive integer) in its constructor. Or you can control the way that a user can provide an image in the `gr.Image` component using the `sources` parameter (which takes a list like `["webcam", "upload"]`).

**Static and Interactive Components**

Every component has a _static_ version that is designed to *display* data, and most components also have an _interactive_ version designed to let users input or modify the data. Typically, you don't need to think about this distinction, because when you build a Gradio demo, Gradio automatically figures out whether the component should be static or interactive based on whether it is being used as an input or output. However, you can set this manually using the `interactive` argument that every component supports.

**Preprocessing and Postprocessing**

When a component is used as an input, Gradio automatically handles the _preprocessing_ needed to convert the data from a type sent by the user's browser (such as an uploaded image) to a form that can be accepted by your function (such as a `numpy` array).


Similarly, when a component is used as an output, Gradio automatically handles the _postprocessing_ needed to convert the data from what is returned by your function (such as a list of image paths) to a form that can be displayed in the user's browser (a gallery of images).

Consider an example demo with three input components (`gr.Textbox`, `gr.Number`, and `gr.Image`) and two outputs (`gr.Number` and `gr.Gallery`) that serve as a UI for your image-to-image generation model. Below is a diagram of what our preprocessing will send to the model and what our postprocessing will require from it.

![](https://github.com/gradio-app/gradio/blob/main/guides/assets/dataflow.svg?raw=true)

In this image, the following preprocessing steps happen to send the data from the browser to your function:

* The text in the textbox is converted to a Python `str` (essentially no preprocessing)
* The number in the number input is converted to a Python `int` (essentially no preprocessing)
* Most importantly, ihe image supplied by the user is converted to a `numpy.array` representation of the RGB values in the image

Images are converted to NumPy arrays because they are a common format for machine learning workflows. You can control the _preprocessing_ using the component's parameters when constructing the component. For example, if you instantiate the `Image` component with the following parameters, it will preprocess the image to the `PIL` format instead:

```py
img = gr.Image(type="pil")
```

Postprocessing is even simpler! Gradio automatically recognizes the format of the returned data (e.g. does the user's function return a `numpy` array or a `str` filepath for the `gr.Image` component?) and postprocesses it appropriately into a format that can be displayed by the browser.

So in the image above, the following postprocessing steps happen to send the data returned from a user's function to the browser:

* The `float` is displayed as a number and displayed directly to the user
* The list of string filepaths (`list[str]`) is interpreted as a list of image filepaths and displayed as a gallery in the browser

Take a look at the [Docs](https://gradio.app/docs) to see all the parameters for each Gradio component.

## Queuing

Every Gradio app comes with a built-in queuing system that can scale to thousands of concurrent users. You can configure the queue by using `queue()` method which is supported by the `gr.Interface`, `gr.Blocks`, and `gr.ChatInterface` classes. 

For example, you can control the number of requests processed at a single time by setting the `default_concurrency_limit` parameter of `queue()`, e.g.

```python
demo = gr.Interface(...).queue(default_concurrency_limit=5)
demo.launch()
```

This limits the number of requests processed for this event listener at a single time to 5. By default, the `default_concurrency_limit` is actually set to `1`, which means that when many users are using your app, only a single user's request will be processed at a time. This is because many machine learning functions consume a significant amount of memory and so it is only suitable to have a single user using the demo at a time. However, you can change this parameter in your demo easily.

See the [docs on queueing](https://gradio.app/docs/gradio/interface#interface-queue) for more details on configuring the queuing parameters.

## Streaming outputs

In some cases, you may want to stream a sequence of outputs rather than show a single output at once. For example, you might have an image generation model and you want to show the image that is generated at each step, leading up to the final image. Or you might have a chatbot which streams its response one token at a time instead of returning it all at once.

In such cases, you can supply a **generator** function into Gradio instead of a regular function. Creating generators in Python is very simple: instead of a single `return` value, a function should `yield` a series of values instead. Usually the `yield` statement is put in some kind of loop. Here's an example of an generator that simply counts up to a given number:

```python
def my_generator(x):
    for i in range(x):
        yield i
```

You supply a generator into Gradio the same way as you would a regular function. For example, here's a a (fake) image generation model that generates noise for several steps before outputting an image using the `gr.Interface` class:

$code_fake_diffusion
$demo_fake_diffusion

Note that we've added a `time.sleep(1)` in the iterator to create an artificial pause between steps so that you are able to observe the steps of the iterator (in a real image generation model, this probably wouldn't be necessary).

## Streaming inputs

Similarly, Gradio can handle streaming inputs, e.g. a live audio stream that can gets transcribed to text in real time, or an image generation model that reruns every time a user types a letter in a textbox. This is covered in more details in our guide on building [reactive Interfaces](/guides/reactive-interfaces). 

## Alert modals

You may wish to raise alerts to the user. To do so, raise a `gr.Error(message)` to display an error message. You can also issue `gr.Warning(message)` and `gr.Info(messag")` by having them as standalone lines in your function, which will immediately display modals while continuing the execution of your function. 

Note below how the `gr.Error` has to be raised, while the `gr.Warning` and `gr.Info` are regular Python functions. Note as well that the message string can include HTML, which will be rendered inside the alert modal.

```python
def start_process(name):
    gr.Info("Starting process")
    if name is None:
        gr.Warning("Name is empty")
    ...
    if success == False:
        raise gr.Error("Process <b>failed</b>")
```



## Styling

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Interface` constructor. For example:

```python
demo = gr.Interface(..., theme=gr.themes.Monochrome())
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [theming guide](https://gradio.app/guides/theming-guide) for more details.

For additional styling ability, you can pass any CSS (as well as custom JavaScript) to your Gradio application. This is discussed in more detail in our [custom JS and CSS guide](/guides/custom-CSS-and-JS).


## Progress bars

Gradio supports the ability to create custom Progress Bars so that you have customizability and control over the progress update that you show to the user. In order to enable this, simply add an argument to your method that has a default value of a `gr.Progress` instance. Then you can update the progress levels by calling this instance directly with a float between 0 and 1, or using the `tqdm()` method of the `Progress` instance to track progress over an iterable, as shown below.

$code_progress_simple
$demo_progress_simple

If you use the `tqdm` library, you can even report progress updates automatically from any `tqdm.tqdm` that already exists within your function by setting the default argument as `gr.Progress(track_tqdm=True)`!

## Batch functions

Gradio supports the ability to pass _batch_ functions. Batch functions are just
functions which take in a list of inputs and return a list of predictions.

For example, here is a batched function that takes in two lists of inputs (a list of
words and a list of ints), and returns a list of trimmed words as output:

```py
import time

def trim_words(words, lens):
    trimmed_words = []
    time.sleep(5)
    for w, l in zip(words, lens):
        trimmed_words.append(w[:int(l)])
    return [trimmed_words]
```

The advantage of using batched functions is that if you enable queuing, the Gradio server can automatically _batch_ incoming requests and process them in parallel,
potentially speeding up your demo. Here's what the Gradio code looks like (notice the `batch=True` and `max_batch_size=16`)

With the `gr.Interface` class:

```python
demo = gr.Interface(
    fn=trim_words, 
    inputs=["textbox", "number"], 
    outputs=["output"],
    batch=True, 
    max_batch_size=16
)

demo.launch()
```

With the `gr.Blocks` class:

```py
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        word = gr.Textbox(label="word")
        leng = gr.Number(label="leng")
        output = gr.Textbox(label="Output")
    with gr.Row():
        run = gr.Button()

    event = run.click(trim_words, [word, leng], output, batch=True, max_batch_size=16)

demo.launch()
```

In the example above, 16 requests could be processed in parallel (for a total inference time of 5 seconds), instead of each request being processed separately (for a total
inference time of 80 seconds). Many Hugging Face `transformers` and `diffusers` models work very naturally with Gradio's batch mode: here's [an example demo using diffusers to
generate images in batches](https://github.com/gradio-app/gradio/blob/main/demo/diffusers_with_batching/run.py)




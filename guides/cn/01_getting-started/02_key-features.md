# Key Features

Let's go through some of the most popular features of Gradio! Here are Gradio's key features:

1. [Adding example inputs](#example-inputs)
2. [Passing custom error messages](#errors)
3. [Adding descriptive content](#descriptive-content)
4. [Setting up flagging](#flagging)
5. [Preprocessing and postprocessing](#preprocessing-and-postprocessing)
6. [Styling demos](#styling)
7. [Queuing users](#queuing)
8. [Iterative outputs](#iterative-outputs)
9. [Progress bars](#progress-bars)
10. [Batch functions](#batch-functions)
11. [Running on collaborative notebooks](#colab-notebooks)

## Example Inputs

You can provide example data that a user can easily load into `Interface`. This can be helpful to demonstrate the types of inputs the model expects, as well as to provide a way to explore your dataset in conjunction with your model. To load example data, you can provide a **nested list** to the `examples=`  keyword argument of the Interface constructor. Each sublist within the outer list represents a data sample, and each element within the sublist represents an input for each input component. The format of example data for each component is specified in the [Docs](https://gradio.app/docs#components).

$code_calculator
$demo_calculator

You can load a large dataset into the examples to browse and interact with the dataset through Gradio. The examples will be automatically paginated (you can configure this through the `examples_per_page` argument of `Interface`).

Continue learning about examples in the [More On Examples](https://gradio.app/more-on-examples) guide.

## Errors

You wish to pass custom error messages to the user. To do so, raise a `gr.Error("custom message")` to display an error message. If you try to divide by zero in the calculator demo above, a popup modal will display the custom error message. Learn more about Error in the [docs](https://gradio.app/docs#error).

## Descriptive Content

In the previous example, you may have noticed the `title=` and `description=` keyword arguments in the `Interface` constructor that helps users understand your app.

There are three arguments in the `Interface` constructor to specify where this content should go:

* `title`: which accepts text and can display it at the very top of interface, and also becomes the page title.
* `description`: which accepts text, markdown or HTML and places it right under the title.
* `article`: which also accepts text, markdown or HTML and places it below the interface.

![annotated](/assets/guides/annotated.png)

If you're using the `Blocks` API instead, you can insert text, markdown, or HTML anywhere using the `gr.Markdown(...)` or `gr.HTML(...)` components, with descriptive content inside the `Component` constructor.

Another useful keyword argument is `label=`, which is present in every `Component`. This modifies the label text at the top of each `Component`. You can also add the `info=` keyword argument to form elements like `Textbox` or `Radio` to provide further information on their usage.

```python
gr.Number(label='Age', info='In years, must be greater than 0')
```

## Flagging

By default, an `Interface` will have "Flag" button. When a user testing your `Interface` sees input with interesting output, such as erroneous or unexpected model behaviour, they can flag the input for you to review. Within the directory provided by the  `flagging_dir=`  argument to the `Interface` constructor, a CSV file will log the flagged inputs. If the interface involves file data, such as for Image and Audio components, folders will be created to store those flagged data as well.

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

With the sepia interface shown earlier, we would have the flagged data stored in the flagged directory shown below:

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

If you wish for the user to provide a reason for flagging, you can pass a list of strings to the `flagging_options` argument of Interface. Users will have to select one of the strings when flagging, which will be saved as an additional column to the CSV.

## Preprocessing and Postprocessing

![annotated](/assets/img/dataflow.svg)

As you've seen, Gradio includes components that can handle a variety of different data types, such as images, audio, and video. Most components can be used both as inputs or outputs.

When a component is used as an input, Gradio automatically handles the *preprocessing* needed to convert the data from a type sent by the user's browser (such as a base64 representation of a webcam snapshot) to a form that can be accepted by your function (such as a `numpy` array).

Similarly, when a component is used as an output, Gradio automatically handles the *postprocessing* needed to convert the data from what is returned by your function (such as a list of image paths) to a form that can be displayed in the user's browser (such as a `Gallery` of images in base64 format).

You can control the *preprocessing* using the parameters when constructing the image component. For example, here if you instantiate the `Image` component with the following parameters, it will convert the image to the `PIL` type and reshape it to be `(100, 100)` no matter the original size that it was submitted as:

```py
img = gr.Image(shape=(100, 100), type="pil")
```

In contrast, here we keep the original size of the image, but invert the colors before converting it to a numpy array:

```py
img = gr.Image(invert_colors=True, type="numpy")
```

Postprocessing is a lot easier! Gradio automatically recognizes the format of the returned data (e.g. is the `Image` a `numpy` array or a `str` filepath?) and postprocesses it into a format that can be displayed by the browser.

Take a look at the [Docs](https://gradio.app/docs) to see all the preprocessing-related parameters for each Component.

## Styling

Gradio themes are the easiest way to customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Interface` constructor. For example:

```python
demo = gr.Interface(..., theme=gr.themes.Monochrome())
```

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. You can extend these themes or create your own themes from scratch - see the [Theming guide](https://gradio.app/theming-guide) for more details.

For additional styling ability, you can pass any CSS to your app using the `css=` kwarg.
The base class for the Gradio app is `gradio-container`, so here's an example that changes the background color of the Gradio app:

```python
with gr.Interface(css=".gradio-container {background-color: red}") as demo:
    ...
```

Some components can be additionally styled through the `style()` method. For example:

```python
img = gr.Image("lion.jpg").style(height='24', rounded=False)
```

Take a look at the [Docs](https://gradio.app/docs) to see all the styling options for each Component.

## Queuing

If your app expects heavy traffic, use the `queue()` method to control processing rate. This will queue up calls so only a certain number of requests are processed at a single time. Queueing uses websockets, which also prevent network timeouts, so you should use queueing if the inference time of your function is long (> 1min).

With `Interface`:

```python
demo = gr.Interface(...).queue()
demo.launch()
```

With `Blocks`:

```python
with gr.Blocks() as demo:
    #...
demo.queue()
demo.launch()
```

You can control the number of requests processed at a single time as such:

```python
demo.queue(concurrency_count=3)
```

See the [Docs on queueing](/docs/#queue) on configuring other queuing parameters.

To specify only certain functions for queueing in Blocks:

```python
with gr.Blocks() as demo2:
    num1 = gr.Number()
    num2 = gr.Number()
    output = gr.Number()
    gr.Button("Add").click(
        lambda a, b: a + b, [num1, num2], output)
    gr.Button("Multiply").click(
        lambda a, b: a * b, [num1, num2], output, queue=True)
demo2.launch()
```

## Iterative Outputs

In some cases, you may want to stream a sequence of outputs rather than show a single output at once. For example, you might have an image generation model and you want to show the image that is generated at each step, leading up to the final image. Or you might have a chatbot which streams its response one word at a time instead of returning it all at once.

In such cases, you can supply a **generator** function into Gradio instead of a regular function. Creating generators in Python is very simple: instead of a single `return` value, a function should `yield` a series of values instead. Usually the `yield` statement is put in some kind of loop. Here's an example of an generator that simply counts up to a given number:

```python
def my_generator(x):
    for i in range(x):
        yield i
```

You supply a generator into Gradio the same way as you would a regular function. For example, here's a a (fake) image generation model that generates noise for several steps before outputting an image:

$code_fake_diffusion
$demo_fake_diffusion

Note that we've added a `time.sleep(1)` in the iterator to create an artificial pause between steps so that you are able to observe the steps of the iterator (in a real image generation model, this probably wouldn't be necessary).

Supplying a generator into Gradio **requires** you to enable queuing in the underlying Interface or Blocks (see the queuing section above).

## Progress Bars

Gradio supports the ability to create a custom Progress Bars so that you have customizability and control over the progress update that you show to the user. In order to enable this, simply add an argument to your method that has a default value of a `gr.Progress` instance. Then you can update the progress levels by calling this instance directly with a float between 0 and 1, or using the `tqdm()` method of the `Progress` instance to track progress over an iterable, as shown below. Queueing must be enabled for progress updates.

$code_progress_simple
$demo_progress_simple

If you use the `tqdm` library, you can even report progress updates automatically from any `tqdm.tqdm` that already exists within your function by setting the default argument as  `gr.Progress(track_tqdm=True)`!

## Batch Functions

Gradio supports the ability to pass *batch* functions. Batch functions are just
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

The advantage of using batched functions is that if you enable queuing, the Gradio
server can automatically *batch* incoming requests and process them in parallel,
potentially speeding up your demo. Here's what the Gradio code looks like (notice
the `batch=True` and `max_batch_size=16` -- both of these parameters can be passed
into event triggers or into the `Interface` class)

With `Interface`:

```python
demo = gr.Interface(trim_words, ["textbox", "number"], ["output"], 
                    batch=True, max_batch_size=16)
demo.queue()
demo.launch()
```

With `Blocks`:

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

demo.queue()
demo.launch()
```

In the example above, 16 requests could be processed in parallel (for a total inference
time of 5 seconds), instead of each request being processed separately (for a total
inference time of 80 seconds). Many Hugging Face `transformers` and `diffusers` models
work very naturally with Gradio's batch mode: here's [an example demo using diffusers to
generate images in batches](https://github.com/gradio-app/gradio/blob/main/demo/diffusers_with_batching/run.py)

Note: using batch functions with Gradio **requires** you to enable queuing in the underlying Interface or Blocks (see the queuing section above).


## Colab Notebooks

Gradio is able to run anywhere you run Python, including local jupyter notebooks as well as collaborative notebooks, such as [Google Colab](https://colab.research.google.com/). In the case of local jupyter notebooks and Google Colab notbooks, Gradio runs on a local server which you can interact with in your browser. (Note: for Google Colab, this is accomplished by [service worker tunneling](https://github.com/tensorflow/tensorboard/blob/master/docs/design/colab_integration.md), which requires cookies to be enabled in your browser.) For other remote notebooks, Gradio will also run on a server, but you will need to use [SSH tunneling](https://coderwall.com/p/ohk6cg/remote-access-to-ipython-notebooks-via-ssh) to view the app in your local browser. Often a simpler options is to use Gradio's built-in public links, [discussed in the next Guide](/sharing-your-app/#sharing-demos). 
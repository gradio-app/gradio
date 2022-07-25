# Common Features

Let's go through some of the most popular features of Gradio!

## Example Inputs

You can provide example data that a user can easily load into `Interface`. This can be helpful to demonstrate the types of inputs the model expects, as well as to provide a way to explore your dataset in conjunction with your model. To load example data, you can provide a **nested list** to the `examples=`  keyword argument of the Interface constructor. Each sublist within the outer list represents a data sample, and each element within the sublist represents an input for each input component. The format of example data for each component is specified in the [Docs](https://gradio.app/docs).

$code_calculator
$demo_calculator

You can load a large dataset into the examples to browse and interact with the dataset through Gradio. The examples will be automatically paginated (you can configure this through the `examples_per_page` argument of `Interface`).

## Decriptive Content

In the previous example, you may have noticed the `title=` and `description=` keyword arguments in the `Interface` constructor that helps users understand your app.

There are three arguments in `Interface` constructor to specify where this content should go:

* `title`: which accepts text and can displays it at the very top of interface, and also becomes the page title.
* `description`: which accepts text, markdown or HTML and places it right under the title.
* `article`: which is also accepts text, markdown or HTML and places it below the interface.

![annotated](/assets/guides/annotated.png)

If you're using the `Blocks` API instead, you can insert text, markdown, or HTML anywhere using the `gr.Markdown(...)` or `gr.HTML(...)` components, with descriptive content inside the `Component` constructor.

Another useful keyword argument is `label=`, which is present in every `Component`. This modifies the label text at the top of each `Component`.

```python
gr.Number(label='Age')
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

If you wish for the user to provide a reason for flagging, you can pass a list of strings to the `flagging_options` argument of Interface. Users will have to select one of the strings when flagging, which will be saved as an additional column to the CSV.

## Styling

Many components can be styled through the `style()` method. For example:

```python
img = gr.Image("lion.jpg").style(height='24', rounded=False)
```

Take a look at the [Docs](https://gradio.app/docs) to see all the styling options for each Component.

## Queuing

If your app expects heavy traffic, set `enable_queue` parameter in the `launch` method to `True` to prevent timeouts. You should also do this if the inference time of your function is long (> 1min). This will queue up calls so only a single call is processed at a time.

With `Interface`:
```python
demo = gr.Interface(...)
demo.launch(enable_queue=True)
```

With `Blocks`:
```python
with gr.Blocks() as demo:
    #...
demo.launch(enable_queue=True)

# or to specify only certain functions for queueing
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

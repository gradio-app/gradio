# Using Flagging

Related spaces: https://huggingface.co/spaces/aliabd/calculator-flagging-crowdsourced, https://huggingface.co/spaces/aliabd/calculator-flagging-options, https://huggingface.co/spaces/aliabd/calculator-flag-basic
Tags: FLAGGING, DATA

## Introduction

When you demo a machine learning model, you might want to collect data from users who try the model, particularly samples in which the model is not behaving as expected. Capturing these "hard" data points is valuable because it allows you to improve your machine learning model and make it more reliable and robust.

Gradio simplifies the collection of this data by including a **Flag** button with every `Interface`. This allows a user or tester to easily send data back to the machine where the demo is running. In this Guide, we discuss more about how to use the flagging feature, both with `gradio.Interface` as well as with `gradio.Blocks`.

## The **Flag** button in `gradio.Interface`

Flagging with Gradio's `Interface` is especially easy. By default, underneath the output components, there is a button marked **Flag**. When a user testing your model sees input with interesting output, they can click the flag button to send the input and output sample back to the machine where the demo is running, and saves it to a CSV log file (by default). If the demo involves images, audio, video, or other types of files, these are saved separately in a parallel directory and the paths to these files are saved in the CSV file.

![flag button](/assets/guides/flag_button.gif)

There are four parameters `gradio.Interface` that control how flagging works. We will go over them in greater detail.

* `allow_flagging`: this parameter can be set to either `"manual"` (default), `"auto"`, or `"never"`.                 
    * `manual`: users will see a button to flag, and samples are only flagged when the button is clicked.
    * `auto`: users will not see a button to flag, but every sample will be flagged automatically. 
    * `never`: users will not see a button to flag, and no sample will be flagged. 
* `flagging_options`: this parameter can be either `None` (default) or a list of strings.
    * If `None`, then the user simply clicks on the **Flag** button and no additional options are shown.
    * If a list of strings are provided, then the user sees several buttons, corresponding to each of the strings that are provided. For example, if the value of this parameter is `["Incorrect", "Ambiguous"]`, then buttons labeled **Flag as Incorrect** and **Flag as Ambiguous** appear. This only applies if `allow_flagging` is `"manual"`.
    * The chosen option is then logged along with the input and output.
* `flagging_dir`: this parameter takes a string.
    * It represents what to name the directory where flagged data is stored.
* `flagging_callback`: this parameter takes an instance of a subclass of the `FlaggingCallback` class
    * Using this parameter allows you to write custom code that gets run when the flag button is clicked
    * By default, this is set to an instance of `gr.CSVLogger`
    * One example is setting it to an instance of `gr.HuggingFaceDatasetSaver` which can allow you to pipe any flagged data into a HuggingFace Dataset. (See more below.)

## What happens to flagged data?

Within the directory provided by the `flagging_dir` argument, a CSV file will log the flagged data. 

Here's an example: The code below creates the calculator interface embedded below it:

```python
import gradio as gr


def calculator(num1, operation, num2):
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        return num1 / num2


iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual"
)

iface.launch()
```

<gradio-app space="aliabd/calculator-flag-basic/">

When you click the flag button above, the directory where the interface was launched will include a new flagged subfolder, with a csv file inside it. This csv file includes all the data that was flagged. 

```directory
+-- flagged/
|   +-- logs.csv
```
_flagged/logs.csv_
```csv
num1,operation,num2,Output,timestamp
5,add,7,12,2022-01-31 11:40:51.093412
6,subtract,1.5,4.5,2022-01-31 03:25:32.023542
```

If the interface involves file data, such as for Image and Audio components, folders will be created to store those flagged data as well. For example an `image` input to `image` output interface will create the following structure.

```directory
+-- flagged/
|   +-- logs.csv
|   +-- image/
|   |   +-- 0.png
|   |   +-- 1.png
|   +-- Output/
|   |   +-- 0.png
|   |   +-- 1.png
```
_flagged/logs.csv_
```csv
im,Output timestamp
im/0.png,Output/0.png,2022-02-04 19:49:58.026963
im/1.png,Output/1.png,2022-02-02 10:40:51.093412
```

If you wish for the user to provide a reason for flagging, you can pass a list of strings to the `flagging_options` argument of Interface. Users will have to select one of the strings when flagging, which will be saved as an additional column to the CSV.

If we go back to the calculator example, the following code will create the interface embedded below it.  
```python
iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"]
)

iface.launch()
```
<gradio-app space="aliabd/calculator-flagging-options/">

When users click the flag button, the csv file will now include a column indicating the selected option.

_flagged/logs.csv_
```csv
num1,operation,num2,Output,flag,timestamp
5,add,7,-12,wrong sign,2022-02-04 11:40:51.093412
6,subtract,1.5,3.5,off by one,2022-02-04 11:42:32.062512
```

## The HuggingFaceDatasetSaver Callback

Sometimes, saving the data to a local CSV file doesn't make sense. For example, on Hugging Face
Spaces, developers typically don't have access to the underlying ephemeral machine hosting the Gradio
demo. That's why, by default, flagging is turned off in Hugging Face Space. However,
you may want to do something else with the flagged data.

We've made this super easy with the `flagging_callback` parameter.

For example, below we're going to pipe flagged data from our calculator example into a Hugging Face Dataset, e.g. so that we can build a "crowd-sourced" dataset:


```python
import os

HF_TOKEN = os.getenv('HF_TOKEN')
hf_writer = gr.HuggingFaceDatasetSaver(HF_TOKEN, "crowdsourced-calculator-demo")

iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    description="Check out the crowd-sourced dataset at: [https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo](https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo)",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"],
    flagging_callback=hf_writer
)

iface.launch()
```

Notice that we define our own 
instance of  `gradio.HuggingFaceDatasetSaver` using our Hugging Face token and
the name of a dataset we'd like to save samples to. In addition, we also set `allow_flagging="manual"`
since on Hugging Face Spaces, this is set to `"never"` by default. Here's our demo:

<gradio-app space="aliabd/calculator-flagging-crowdsourced/">

You can now see all the examples flagged above in this [public Hugging Face dataset](https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo).

![flagging callback hf](/assets/guides/flagging-callback-hf.png)

We created the `gradio.HuggingFaceDatasetSaver` class, but you can pass your own custom class as long as it inherits from `FLaggingCallback` defined in [this file](https://github.com/gradio-app/gradio/blob/master/gradio/flagging.py). If you create a cool callback, contribute it to the repo! 

## Flagging with Blocks



## Privacy

Please make sure your users understand when the data they submit is being saved, and what you plan on doing with it. This is especially important when you use `allow_flagging=auto` (when all of the data submitted through the demo is being flagged). We suggest including this info in the description.

### That's all! Happy building :) 

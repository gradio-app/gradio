# Using Flagging

Related spaces: https://huggingface.co/spaces/aliabd/calculator-flagging-crowdsourced, https://huggingface.co/spaces/aliabd/calculator-flagging-options, https://huggingface.co/spaces/aliabd/calculator-flag-basic
Tags: FLAGGING, DATA

## Introduction

When you deploy or demo a machine learning model, you may find that it behaves differently than how you expected (e.g. the model makes an incorrect prediction) when a user tries it with their own data. Capturing these "hard" data points is important because it allows you to make you machine learning model more reliable and robust.

Gradio simplifies the collection of this data by including a FLAG button with every `Interface`. This allows your user or tester to easily send data back to you, whether the model is running locally or has been shared by setting `share=True`. 

## The **Flag** button 

Underneath the output interfaces, there is a button marked **Flag**. When a user testing your model sees input with interesting output, such as erroneous or unexpected model behaviour, they can flag the input for the interface creator to review. 

![flag button](/assets/guides/flag_button.gif)

There are four parameters `gr.Interface` that control how flagging works. We will go over them in greater detail.

* `allow_flagging`: this parameter can be set to either `"manual"`, `"auto"`, or `"never"`.                 
    * `manual`: users will see a button to flag, and events are only flagged when it's clicked.
    * `auto`: users will not see a button to flag, but every event will be flagged automatically. 
    * `never`: users will not see a button to flag, and no event will be flagged. 
* `flagging_options`: this parameter can be either `None` (default) or a list of strings.
    * If `None`, then the user simply clicks on the **Flag** button and no additional options are shown.
    * If a list of strings are provided, this allows user to select from a list of options when flagging. Only applies if `allow_flagging` is `"manual"`.
    * The chosen option is then piped along with the input and output.
* `flagging_dir`: this parameter takes a string.
    * It represents what to name the directory where flagged data is stored.
* `flagging_callback`: this parameter takes an instance of a subclass of the `FlaggingCallback` class
    * Using this parameter allows you to write custom code that gets run when the flag button is clicked
    * By default, this is set to an instance of `gr.CSVLogger`
    * One example is setting it to an instance of `gr.HuggingFaceDatasetSaver` which can allow you to pipe any flagged data into a HuggingFace Dataset.

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
    ["number", gr.inputs.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual"
)

iface.launch()
```

<iframe src="https://hf.space/embed/aliabd/calculator-flag-basic/+" frameBorder="0" height="500" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


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
    ["number", gr.inputs.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"]
)

iface.launch()
```
<iframe src="https://hf.space/embed/aliabd/calculator-flagging-options/+" frameBorder="0" height="500" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

When users click the flag button, the csv file will now include a column indicating the selected option.

_flagged/logs.csv_
```csv
num1,operation,num2,Output,flag,timestamp
5,add,7,-12,wrong sign,2022-02-04 11:40:51.093412
6,subtract,1.5,3.5,off by one,2022-02-04 11:42:32.062512
```

## Doing more with the data

Suppose you want to take some action on the flagged data, instead of just saving it. Perhaps you want to trigger your model to retrain, or even just share it with others in a cloud dataset. We've made this super easy with the `flagging_callback` parameter.

For example, below we're going to pipe flagged data from our calculator example into a crowd-sourced Hugging Face Dataset. 

```python
import os

HF_TOKEN = os.getenv('HF_TOKEN')
hf_writer = gr.HuggingFaceDatasetSaver(HF_TOKEN, "crowdsourced-calculator-demo")

iface = gr.Interface(
    calculator,
    ["number", gr.inputs.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"],
    flagging_callback=hf_writer
)

iface.launch()
```
<iframe src="https://hf.space/embed/aliabd/calculator-flagging-crowdsourced/+" frameBorder="0" height="500" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

You can now see all the examples flagged above in this [public HF dataset](https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo/blob/main/data.csv).

![flagging callback hf](/assets/guides/flagging-callback-hf.png)

We created the `gr.HuggingFaceDatasetSaver` class, but you can pass your own custom class as long as it inherits from `FLaggingCallback` defined in [this file](https://github.com/gradio-app/gradio/blob/master/gradio/flagging.py). If you create a cool callback, please contribute it to the repo! 

## Privacy

Please make sure your users understand when the data they submit is being saved, and what you plan on doing with it. This is especially important when you use `allow_flagging=auto`. We suggest including this info in the description so that it's read before the interface.

### That's all! Happy building :) 

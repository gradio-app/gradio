## Using Gradio for Tabular Data Science Workflows

Related spaces: https://huggingface.co/spaces/scikit-learn/gradio-skops-integration, https://huggingface.co/spaces/scikit-learn/tabular-playground, https://huggingface.co/spaces/merve/gradio-analysis-dashboard


## Introduction

Tabular data science is the most widely used domain of machine learning, with problems ranging from customer segmentation to churn prediction. Throughout various stages of the tabular data science workflow, communicating your work to stakeholders or clients can be cumbersome; which prevents data scientists from focusing on what matters, such as data analysis and model building. Data scientists can end up spending hours building a dashboard that takes in dataframe and returning plots, or returning a prediction or plot of clusters in a dataset. In this guide, we'll go through how to use `gradio` to improve your data science workflows. We will also talk about how to use `gradio` and [skops](https://skops.readthedocs.io/en/stable/) to build interfaces with only one line of code!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).

## Let's Create a Simple Interface!

We will take a look at how we can create a simple UI that predicts failures based on product information. 

```python
import gradio as gr
import pandas as pd
import joblib
import datasets


inputs = [gr.Dataframe(row_count = (2, "dynamic"), col_count=(4,"dynamic"), label="Input Data", interactive=1)]

outputs = [gr.Dataframe(row_count = (2, "dynamic"), col_count=(1, "fixed"), label="Predictions", headers=["Failures"])]

model = joblib.load("model.pkl")

# we will give our dataframe as example
df = datasets.load_dataset("merve/supersoaker-failures")
df = df["train"].to_pandas()

def infer(input_dataframe):
  return pd.DataFrame(model.predict(input_dataframe))
  
gr.Interface(fn = infer, inputs = inputs, outputs = outputs, examples = [[df.head(2)]]).launch()
```

Let's break down above code.

* `fn`: the inference function that takes input dataframe and returns predictions.
* `inputs`: the component we take our input with. We define our input as dataframe with 2 rows and 4 columns, which initially will look like an empty dataframe with the aforementioned shape. When the `row_count` is set to `dynamic`, you don't have to rely on the dataset you're inputting to pre-defined component.
* `outputs`: The dataframe component that stores outputs. This UI can take single or multiple samples to infer, and returns 0 or 1 for each sample in one column, so we give `row_count` as 2 and `col_count` as 1 above. `headers` is a list made of header names for dataframe.
* `examples`: You can either pass the input by dragging and dropping a CSV file, or a pandas DataFrame through examples, which headers will be automatically taken by the interface.

We will now create an example for a minimal data visualization dashboard. You can find a more comprehensive version in the related Spaces.

<gradio-app space="scikit-learn/tabular-playground"></gradio-app>

```python
import gradio as gr
import pandas as pd
import datasets
import seaborn as sns
import matplotlib.pyplot as plt

df = datasets.load_dataset("merve/supersoaker-failures")
df = df["train"].to_pandas()
df.dropna(axis=0, inplace=True)

def plot(df):
  plt.scatter(df.measurement_13, df.measurement_15, c = df.loading,alpha=0.5)
  plt.savefig("scatter.png")
  df['failure'].value_counts().plot(kind='bar')
  plt.savefig("bar.png")
  sns.heatmap(df.select_dtypes(include="number").corr())
  plt.savefig("corr.png")
  plots = ["corr.png","scatter.png", "bar.png"]
  return plots
  
inputs = [gr.Dataframe(label="Supersoaker Production Data")]
outputs = [gr.Gallery(label="Profiling Dashboard").style(grid=(1,3))]

gr.Interface(plot, inputs=inputs, outputs=outputs, examples=[df.head(100)], title="Supersoaker Failures Analysis Dashboard").launch()
```

<gradio-app space="merve/gradio-analysis-dashboard-minimal"></gradio-app>

We will use the same dataset we used to train our model, but we will make a dashboard to visualize it this time. 

* `fn`: The function that will create plots based on data.
* `inputs`: We use the same `Dataframe` component we used above.
* `outputs`: The `Gallery` component is used to keep our visualizations.
* `examples`: We will have the dataset itself as the example.

## Easily load tabular data interfaces with one line of code using skops

`skops` is a library built on top of `huggingface_hub` and `sklearn`. With the recent `gradio` integration of `skops`, you can build tabular data interfaces with one line of code!

```python
import gradio as gr

# title and description are optional
title = "Supersoaker Defective Product Prediction"
description = "This model predicts Supersoaker production line failures. Drag and drop any slice from dataset or edit values as you wish in below dataframe component."

gr.Interface.load("huggingface/scikit-learn/tabular-playground", title=title, description=description).launch()
```

<gradio-app space="scikit-learn/gradio-skops-integation"></gradio-app>

`sklearn` models pushed to Hugging Face Hub using `skops` include a `config.json` file that contains an example input  with column names, the task being solved (that can either be `tabular-classification` or `tabular-regression`). From the task type, `gradio` constructs the `Interface` and consumes column names and the example input to build it. You can [refer to skops documentation on hosting models on Hub](https://skops.readthedocs.io/en/latest/auto_examples/plot_hf_hub.html#sphx-glr-auto-examples-plot-hf-hub-py) to learn how to push your models to Hub using `skops`.

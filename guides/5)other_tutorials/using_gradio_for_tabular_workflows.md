## Using Gradio for Tabular Data Science Workflows

Related spaces: https://huggingface.co/spaces/scikit-learn/gradio-skops-integration


## Introduction

Tabular data science is the most widely used domain of machine learning, with problems ranging from customer segmentation to churn prediction. Communicating your work to stakeholders of your project or clients in various stages of tabular data science workflow is very important and can sometimes be cumbersome, preventing data scientists from focusing on what matters, data analysis and model building. Data scientists can end up spending hours building a dashboard that takes in dataframe and returning plots, or returning a prediction or plot of clusters in a dataset. In this guide, we'll go through how to use `gradio` to improve your data science workflows. We will also talk about how to use `gradio` and `skops` to build interfaces with only one line of code!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).

## Let's Create a Simple Interface!

We will take a look at how we can create a simple UI that predicts failures based on product information. 

```python
import gradio as gr
import pandas as pd
import joblib

inputs = [gr.Dataframe(row_count = (2, "dynamic"), col_count=(4,"dynamic"), label="Input Data", interactive=1)]

outputs = [gr.Dataframe(row_count = (2, "dynamic"), col_count=(1, "fixed"), label="Predictions", headers=["Failures"])]

model = joblib.load("model.pkl")

def infer(input_dataframe):
  return pd.DataFrame(model.predict(input_dataframe))
  

gr.Interface(fn = infer, inputs = inputs, outputs = outputs, examples = [[df.head(2)]]).launch()
```

Let's break down above code.

* `fn`: the inference function that takes input dataframe and returns predictions.
* `inputs`: the component we take our input with. We define our input as dataframe with 2 rows and 4 columns, which initially will look like an empty dataframe with the aforementioned shape. When the `row_count` is set to `dynamic`, you don't have to rely on the dataset you're inputting to pre-defined component.
* `outputs`: The dataframe component that stores outputs. This UI can take single or multiple samples to infer, and returns 0 or 1 for each sample in one column, so we give `row_count` as 2 and `col_count` as 1 above. `headers` is a list made of header names for dataframe.
* `examples`: You can either pass the input by dragging and dropping a CSV file, or a pandas DataFrame through examples, which headers will be automatically taken by the interface.
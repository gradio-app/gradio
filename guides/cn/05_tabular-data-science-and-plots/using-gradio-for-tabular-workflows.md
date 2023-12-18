## 使用 Gradio 进行表格数据科学工作流

Related spaces: https://huggingface.co/spaces/scikit-learn/gradio-skops-integration，https://huggingface.co/spaces/scikit-learn/tabular-playground，https://huggingface.co/spaces/merve/gradio-analysis-dashboard

## 介绍

表格数据科学是机器学习中应用最广泛的领域，涉及的问题从客户分割到流失预测不等。在表格数据科学工作流的各个阶段中，将工作内容传达给利益相关者或客户可能很麻烦，这会阻碍数据科学家专注于重要事项，如数据分析和模型构建。数据科学家可能会花费数小时构建一个接受 DataFrame 并返回图表、预测或数据集中的聚类图的仪表板。在本指南中，我们将介绍如何使用 `gradio` 改进您的数据科学工作流程。我们还将讨论如何使用 `gradio` 和[skops](https://skops.readthedocs.io/en/stable/)一行代码即可构建界面！

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 软件包。

## 让我们创建一个简单的界面！

我们将看一下如何创建一个简单的界面，该界面根据产品信息预测故障。

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

让我们来解析上述代码。

- `fn`：推理函数，接受输入数据帧并返回预测结果。
- `inputs`：我们使用 `Dataframe` 组件作为输入。我们将输入定义为具有 2 行 4 列的数据帧，最初的数据帧将呈现出上述形状的空数据帧。当将 `row_count` 设置为 `dynamic` 时，不必依赖于正在输入的数据集来预定义组件。
- `outputs`：用于存储输出的数据帧组件。该界面可以接受单个或多个样本进行推断，并在一列中为每个样本返回 0 或 1，因此我们将 `row_count` 设置为 2，`col_count` 设置为 1。`headers` 是由数据帧的列名组成的列表。
- `examples`：您可以通过拖放 CSV 文件或通过示例传递 pandas DataFrame，界面会自动获取其标题。

现在我们将为简化版数据可视化仪表板创建一个示例。您可以在相关空间中找到更全面的版本。

<gradio-app space="gradio/tabular-playground"></gradio-app>

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
outputs = [gr.Gallery(label="Profiling Dashboard", columns=(1,3))]

gr.Interface(plot, inputs=inputs, outputs=outputs, examples=[df.head(100)], title="Supersoaker Failures Analysis Dashboard").launch()
```

<gradio-app space="gradio/gradio-analysis-dashboard-minimal"></gradio-app>

我们将使用与训练模型相同的数据集，但这次我们将创建一个可视化仪表板以展示它。

- `fn`：根据数据创建图表的函数。
- `inputs`：我们使用了与上述相同的 `Dataframe` 组件。
- `outputs`：我们使用 `Gallery` 组件来存放我们的可视化结果。
- `examples`：我们将数据集本身作为示例。

## 使用 skops 一行代码轻松加载表格数据界面

`skops` 是一个构建在 `huggingface_hub` 和 `sklearn` 之上的库。通过最新的 `gradio` 集成，您可以使用一行代码构建表格数据界面！

```python
import gradio as gr

# 标题和描述是可选的
title = "Supersoaker产品缺陷预测"
description = "该模型预测Supersoaker生产线故障。在下面的数据帧组件中，您可以拖放数据集的任意切片或自行编辑值。"

gr.load("huggingface/scikit-learn/tabular-playground", title=title, description=description).launch()
```

<gradio-app space="gradio/gradio-skops-integration"></gradio-app>

使用 `skops` 将 `sklearn` 模型推送到 Hugging Face Hub 时，会包含一个包含示例输入和列名的 `config.json` 文件，解决的任务类型是 `tabular-classification` 或 `tabular-regression`。根据任务类型，`gradio` 构建界面并使用列名和示例输入来构建它。您可以[参考 skops 在 Hub 上托管模型的文档](https://skops.readthedocs.io/en/latest/auto_examples/plot_hf_hub.html#sphx-glr-auto-examples-plot-hf-hub-py)来了解如何使用 `skops` 将模型推送到 Hub。

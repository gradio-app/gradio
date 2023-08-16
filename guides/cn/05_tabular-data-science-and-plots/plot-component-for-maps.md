# 如何使用地图组件绘制图表

Related spaces:
Tags: PLOTS, MAPS

## 简介

本指南介绍如何使用 Gradio 的 `Plot` 组件在地图上绘制地理数据。Gradio 的 `Plot` 组件可以与 Matplotlib、Bokeh 和 Plotly 一起使用。在本指南中，我们将使用 Plotly 进行操作。Plotly 可以让开发人员轻松创建各种地图来展示他们的地理数据。点击[这里](https://plotly.com/python/maps/)查看一些示例。

## 概述

我们将使用纽约市的 Airbnb 数据集，该数据集托管在 kaggle 上，点击[这里](https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data)。我已经将其上传到 Hugging Face Hub 作为一个数据集，方便使用和下载，点击[这里](https://huggingface.co/datasets/gradio/NYC-Airbnb-Open-Data)。使用这些数据，我们将在地图上绘制 Airbnb 的位置，并允许基于价格和位置进行筛选。下面是我们将要构建的演示。 ⚡️

$demo_map_airbnb

## 步骤 1-加载 CSV 数据 💾

让我们首先从 Hugging Face Hub 加载纽约市的 Airbnb 数据。

```python
from datasets import load_dataset

dataset = load_dataset("gradio/NYC-Airbnb-Open-Data", split="train")
df = dataset.to_pandas()

def filter_map(min_price, max_price, boroughs):
    new_df = df[(df['neighbourhood_group'].isin(boroughs)) &
            (df['price'] > min_price) & (df['price'] < max_price)]
    names = new_df["name"].tolist()
    prices = new_df["price"].tolist()
    text_list = [(names[i], prices[i]) for i in range(0, len(names))]
```

在上面的代码中，我们先将 CSV 数据加载到一个 pandas dataframe 中。让我们首先定义一个函数，这将作为 gradio 应用程序的预测函数。该函数将接受最低价格、最高价格范围和筛选结果地区的列表作为参数。我们可以使用传入的值 (`min_price`、`max_price` 和地区列表) 来筛选数据框并创建 `new_df`。接下来，我们将创建包含每个 Airbnb 的名称和价格的 `text_list`，以便在地图上使用作为标签。

## 步骤 2-地图图表 🌐

Plotly 使得处理地图变得很容易。让我们看一下下面的代码，了解如何创建地图图表。

```python
import plotly.graph_objects as go

fig = go.Figure(go.Scattermapbox(
            customdata=text_list,
            lat=new_df['latitude'].tolist(),
            lon=new_df['longitude'].tolist(),
            mode='markers',
            marker=go.scattermapbox.Marker(
                size=6
            ),
            hoverinfo="text",
            hovertemplate='<b>Name</b>: %{customdata[0]}<br><b>Price</b>: $%{customdata[1]}'
        ))

fig.update_layout(
    mapbox_style="open-street-map",
    hovermode='closest',
    mapbox=dict(
        bearing=0,
        center=go.layout.mapbox.Center(
            lat=40.67,
            lon=-73.90
        ),
        pitch=0,
        zoom=9
    ),
)
```

上面的代码中，我们通过传入经纬度列表来创建一个散点图。我们还传入了名称和价格的自定义数据，以便在鼠标悬停在每个标记上时显示额外的信息。接下来，我们使用 `update_layout` 来指定其他地图设置，例如缩放和居中。

有关使用 Mapbox 和 Plotly 创建散点图的更多信息，请点击[这里](https://plotly.com/python/scattermapbox/)。

## 步骤 3-Gradio 应用程序 ⚡️

我们将使用两个 `gr.Number` 组件和一个 `gr.CheckboxGroup` 组件，允许用户指定价格范围和地区位置。然后，我们将使用 `gr.Plot` 组件作为我们之前创建的 Plotly + Mapbox 地图的输出。

```python
with gr.Blocks() as demo:
    with gr.Column():
        with gr.Row():
            min_price = gr.Number(value=250, label="Minimum Price")
            max_price = gr.Number(value=1000, label="Maximum Price")
        boroughs = gr.CheckboxGroup(choices=["Queens", "Brooklyn", "Manhattan", "Bronx", "Staten Island"], value=["Queens", "Brooklyn"], label="Select Boroughs:")
        btn = gr.Button(value="Update Filter")
        map = gr.Plot()
    demo.load(filter_map, [min_price, max_price, boroughs], map)
    btn.click(filter_map, [min_price, max_price, boroughs], map)
```

我们使用 `gr.Column` 和 `gr.Row` 布局这些组件，并为演示加载时和点击 " 更新筛选 " 按钮时添加了事件触发器，以触发地图更新新的筛选条件。

以下是完整演示代码：

$code_map_airbnb

## 步骤 4-部署 Deployment 🤗

如果你运行上面的代码，你的应用程序将在本地运行。
如果要获取临时共享链接，可以将 `share=True` 参数传递给 `launch`。

但如果你想要一个永久的部署解决方案呢？
让我们将我们的 Gradio 应用程序部署到免费的 HuggingFace Spaces 平台。

如果你以前没有使用过 Spaces，请按照之前的指南[这里](/using_hugging_face_integrations)。

## 结论 🎉

你已经完成了！这是构建地图演示所需的所有代码。

链接到演示：[地图演示](https://huggingface.co/spaces/gradio/map_airbnb)和[完整代码](https://huggingface.co/spaces/gradio/map_airbnb/blob/main/run.py)（在 Hugging Face Spaces）

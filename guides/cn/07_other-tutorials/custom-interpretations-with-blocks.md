# 使用 Blocks 进行自定义机器学习解释

Tags: INTERPRETATION, SENTIMENT ANALYSIS

**前提条件**: 此指南要求您了解 Blocks 和界面的解释功能。请确保[首先阅读 Blocks 指南](https://gradio.app/quickstart/#blocks-more-flexibility-and-control)以及[高级界面功能指南](/advanced-interface-features#interpreting-your-predictions)的解释部分。

## 简介

如果您有使用界面类的经验，那么您就知道解释机器学习模型的预测有多么容易，只需要将 `interpretation` 参数设置为 "default" 或 "shap" 即可。

您可能想知道是否可以将同样的解释功能添加到使用 Blocks API 构建的应用程序中。不仅可以做到，而且 Blocks 的灵活性还可以以不可能使用界面来显示解释的方式！

本指南将展示如何：

1. 在 Blocks 应用程序中重新创建界面的解释功能的行为。
2. 自定义 Blocks 应用程序中的解释显示方式。

让我们开始吧！

## 设置 Blocks 应用程序

让我们使用 Blocks API 构建一款情感分类应用程序。该应用程序将以文本作为输入，并输出此文本表达负面或正面情感的概率。我们会有一个单独的输入 `Textbox` 和一个单独的输出 `Label` 组件。以下是应用程序的代码以及应用程序本身。

```python
import gradio as gr
from transformers import pipeline

sentiment_classifier = pipeline("text-classification", return_all_scores=True)

def classifier(text):
    pred = sentiment_classifier(text)
    return {p["label"]: p["score"] for p in pred[0]}

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")

    classify.click(classifier, input_text, label)
demo.launch()
```

<gradio-app space="freddyaboulton/sentiment-classification"> </gradio-app>

## 向应用程序添加解释

我们的目标是向用户呈现输入中的单词如何 contributed 到模型的预测。
这将帮助用户理解模型的工作方式，并评估其有效性。
例如，我们应该期望我们的模型能够将“happy”和“love”这些词与积极的情感联系起来；如果模型没有联系起来，那么这意味着我们在训练过程中出现了错误！

对于输入中的每个单词，我们将计算模型预测的积极情感如何受该单词的影响。
一旦我们有了这些 `(word, score)` 对，我们就可以使用 Gradio 将其可视化给用户。

[shap](https://shap.readthedocs.io/en/stable/index.html) 库将帮助我们计算 `(word, score)` 对，而 Gradio 将负责将输出显示给用户。

以下代码计算 `(word, score)` 对：

```python
def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])

    # Dimensions are (batch size, text size, number of classes)
    # Since we care about positive sentiment, use index 1
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))
    # Scores contains (word, score) pairs


    # Format expected by gr.components.Interpretation
    return {"original": text, "interpretation": scores}
```

现在，我们所要做的就是添加一个按钮，在单击后运行此函数。
为了显示解释，我们将使用 `gr.components.Interpretation`。
这将使输入中的每个单词变成红色或蓝色。
如果它有助于积极情感，则为红色，如果它有助于负面情感，则为蓝色。
这就是界面如何显示文本的解释输出。

```python
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
                interpret = gr.Button("Interpret")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")
        with gr.Column():
            interpretation = gr.components.Interpretation(input_text)
    classify.click(classifier, input_text, label)
    interpret.click(interpretation_function, input_text, interpretation)

demo.launch()
```

<gradio-app space="freddyaboulton/sentiment-classification-interpretation"> </gradio-app>

## 自定义解释的显示方式

`gr.components.Interpretation` 组件以很好的方式显示单个单词如何 contributed 到情感预测，但是如果我们还想显示分数本身，怎么办呢？

一种方法是生成一个条形图，其中单词在水平轴上，条形高度对应 shap 得分。

我们可以通过修改我们的 `interpretation_function` 来执行此操作，以同时返回一个 matplotlib 条形图。我们将在单独的选项卡中使用 'gr.Plot' 组件显示它。

这是解释函数的外观：

```python
def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])
    # Dimensions are (batch size, text size, number of classes)
    # Since we care about positive sentiment, use index 1
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))

    scores_desc = sorted(scores, key=lambda t: t[1])[::-1]

    # Filter out empty string added by shap
    scores_desc = [t for t in scores_desc if t[0] != ""]

    fig_m = plt.figure()

    # Select top 5 words that contribute to positive sentiment
    plt.bar(x=[s[0] for s in scores_desc[:5]],
            height=[s[1] for s in scores_desc[:5]])
    plt.title("Top words contributing to positive sentiment")
    plt.ylabel("Shap Value")
    plt.xlabel("Word")
    return {"original": text, "interpretation": scores}, fig_m
```

以下是应用程序代码：

```python
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
                interpret = gr.Button("Interpret")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")
        with gr.Column():
            with gr.Tabs():
                with gr.TabItem("Display interpretation with built-in component"):
                    interpretation = gr.components.Interpretation(input_text)
                with gr.TabItem("Display interpretation with plot"):
                    interpretation_plot = gr.Plot()

    classify.click(classifier, input_text, label)
    interpret.click(interpretation_function, input_text, [interpretation, interpretation_plot])

demo.launch()
```

demo 在这里 !

<gradio-app space="freddyaboulton/sentiment-classification-interpretation-tabs"> </gradio-app>

## Beyond Sentiment Classification （超越情感分类）

尽管到目前为止我们已经集中讨论了情感分类，但几乎可以为任何机器学习模型添加解释。
输出必须是 `gr.Image` 或 `gr.Label`，但输入几乎可以是任何内容 (`gr.Number`, `gr.Slider`, `gr.Radio`, `gr.Image`)。

这是一个使用 Blocks 构建的图像分类模型解释演示：

<gradio-app space="freddyaboulton/image-classification-interpretation-blocks"> </gradio-app>

## 结语

我们深入地探讨了解释的工作原理以及如何将其添加到您的 Blocks 应用程序中。

我们还展示了 Blocks API 如何让您控制解释在应用程序中的可视化方式。

添加解释是使您的用户了解和信任您的模型的有用方式。现在，您拥有了将其添加到所有应用程序所需的所有工具！

# 命名实体识别 （Named-Entity Recognition）

相关空间：https://huggingface.co/spaces/rajistics/biobert_ner_demo，https://huggingface.co/spaces/abidlabs/ner，https://huggingface.co/spaces/rajistics/Financial_Analyst_AI
标签：NER，TEXT，HIGHLIGHT

## 简介

命名实体识别（NER）又称为标记分类或文本标记，它的任务是对一个句子进行分类，将每个单词（或 "token"）归为不同的类别，比如人名、地名或词性等。

例如，给定以下句子：

> 芝加哥有巴基斯坦餐厅吗？

命名实体识别算法可以识别出：

- "Chicago" as a **location**
- "Pakistani" as an **ethnicity**

等等。

使用 `gradio`（特别是 `HighlightedText` 组件），您可以轻松构建一个 NER 模型的 Web 演示并与团队分享。

这是您将能够构建的一个演示的示例：

$demo_ner_pipeline

本教程将展示如何使用预训练的 NER 模型并使用 Gradio 界面部署该模型。我们将展示两种不同的使用 `HighlightedText` 组件的方法--根据您的 NER 模型，可以选择其中任何一种更容易学习的方式！

### 环境要求

确保您已经[安装](/getting_started)了 `gradio` Python 包。您还需要一个预训练的命名实体识别模型。在本教程中，我们将使用 `transformers` 库中的一个模型。

### 方法一：实体字典列表

许多命名实体识别模型输出的是一个字典列表。每个字典包含一个*实体*，一个 " 起始 " 索引和一个 " 结束 " 索引。这就是 `transformers` 库中的 NER 模型的操作方式。

```py
from transformers import pipeline
ner_pipeline = pipeline("ner")
ner_pipeline("芝加哥有巴基斯坦餐厅吗？")
```

输出结果：

```bash
[{'entity': 'I-LOC',
  'score': 0.9988978,
  'index': 2,
  'word': 'Chicago',
  'start': 5,
  'end': 12},
 {'entity': 'I-MISC',
  'score': 0.9958592,
  'index': 5,
  'word': 'Pakistani',
  'start': 22,
  'end': 31}]
```

如果您有这样的模型，将其连接到 Gradio 的 `HighlightedText` 组件非常简单。您只需要将这个**实体列表**与**原始文本**以字典的形式传递给模型，其中键分别为 `"entities"` 和 `"text"`。

下面是一个完整的示例：

$code_ner_pipeline
$demo_ner_pipeline

### 方法二：元组列表

将数据传递给 `HighlightedText` 组件的另一种方法是使用元组列表。每个元组的第一个元素应该是被归类为特定实体的单词或词组。第二个元素应该是实体标签（如果不需要标签，则为 `None`）。`HighlightedText` 组件会自动组合单词和标签来显示实体。

在某些情况下，这比第一种方法更简单。下面是一个使用 Spacy 的词性标注器演示此方法的示例：

$code_text_analysis
$demo_text_analysis

---

到此为止！您已经了解了为您的 NER 模型构建基于 Web 的图形用户界面所需的全部内容。

有趣的提示：只需在 `launch()` 中设置 `share=True`，即可立即与其他人分享您的 NER 演示。

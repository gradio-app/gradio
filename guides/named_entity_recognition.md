# Named-Entity Recognition 

Related spaces: https://huggingface.co/spaces/rajistics/biobert_ner_demo, https://huggingface.co/spaces/abidlabs/ner, https://huggingface.co/spaces/rajistics/Financial_Analyst_AI
Tags: NER, TEXT, HIGHLIGHT
Docs: highlightedtext

## Introduction

Named-entity recognition (NER), also known as token classification or text tagging, is the task of taking a sentence and classifying every word (or "token") into different categories, such as names of people or names of locations, or different parts of speech. 

For example, given the sentence:

> Does Chicago have any Pakistani restaurants?

A named-entity recognition algorithm may  identify:

* "Chicago" as a **location**
* "Pakistani" as an **ethnicity**  


and so on. 

Using `gradio` (specifically the `HighlightedText` component), you can easily build a web demo of your NER model and share that with the rest of your team.

Here is an example of a demo that you'll be able to build:

$demo_ner_pipeline

This tutorial will show how to take a pretrained NER model and deploy it with a Gradio interface. We will show two different ways to use the `HighlightedText` component -- depending on your NER model, either of these two ways may be easier to learn! 

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). You will also need a pretrained named-entity recognition model. You can use your own, or this in this tutorial, we will use one from the `transformers` library.

### Approach 1: List of Entity Dictionaries

Many named-entity recognition models output a list of dictionaries. Each dictionary consists of an *entity*, a "start" index, and an "end" index. This is, for example, how NER models in the `transformers` library operate:

```py
from transformers import pipeline 
ner_pipeline = pipeline("ner")
ner_pipeline("Does Chicago have any Pakistani restaurants")
```

Output:

```
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

If you have such a model, it is very easy to hook it up to Gradio's `HighlightedText` component. All you need to do is pass in this **list of entities**, along with the **original text** the the model, together as dictionary, with the keys being `"entities"` and `"text"` respectively.

Here is a complete example:

$code_ner_pipeline
$demo_ner_pipeline

### Approach 2: List of Tuples

An alternative way to pass data into the `HighlightedText` component is a list of tuples. The first element of each tuple should be the word or words that are being classified into a particular entity. The second element should be the entity label (or `None` if they should be unlabeled). The `HighlightedText` component automatically strings together the words and labels to display the entities.

In some cases, this can be easier than the first approach. Here is a demo showing this approach using Spacy's parts-of-speech tagger:

$code_text_analysis
$demo_text_analysis


--------------------------------------------


And you're done! That's all you need to know to build a web-based GUI for your NER model. 

Fun tip: you can share your NER demo instantly with others simply by setting `share=True` in `launch()`. 



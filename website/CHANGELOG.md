# Upcoming Release 

## New Features

### 1. New Sketching and inpainting for Images! :pr:`1456` 

```python
code here
```
       
## Bug Fixes

### 1. Something here

## Documentation Changes

### 1. Auto Release Notes 🤖

We've created a new system for automatically tracking the changes that go into new releases. On every pull request commit,
a github action will check whether the `website/CHANGELOG.md` file has been updated with a line containing a brief summary
of the change and its associated pull request number. This check can be skipped if the `no-changelog-update` label is added
to the PR. The `CHANGELOG.md` file is then converted and displayed on our website!


## Testing and Infrastructure Changes

### 1. Demos now deployed to huggingface spaces :pr:`1600`

## Breaking Changes

### 1. Something here

## Full Changelog

* Automated release notes :pr:`2306` 
* Demos now deployed to huggingface spaces :pr:`1600`

## Contributors Shoutout


<br>

# Version 3.3

[See the full changelog on Github](https://github.com/gradio-app/gradio/compare/v3.2...v3.3)

## New Features

### 1. Iterative Outputs ⏳  

You can now create an iterative output simply by having your function return a generator!

Here's (part of) an example that was used to generate the interface below it. [See full code](https://colab.research.google.com/drive/1m9bWS6B82CT7bw-m4L6AJR8za7fEK7Ov?usp=sharing).

```python
def predict(steps, seed):
    generator = torch.manual_seed(seed)
    for i in range(1,steps):
        yield pipeline(generator=generator, num_inference_steps=i)["sample"][0]
```


![example](https://user-images.githubusercontent.com/9021060/189086273-f5e7087d-71fa-4158-90a9-08e84da0421c.mp4)

### 2. Accordion Layout 🆕 

This version of Gradio introduces a new layout component to Blocks: the Accordion. Wrap your elements in a neat, expandable layout that allows users to toggle them as needed. 

Usage: ([Read the docs](https://gradio.app/docs/#accordion))

```python
with gr.Accordion("open up"):
# components here 
```

![accordion](https://user-images.githubusercontent.com/9021060/189088465-f0ffd7f0-fc6a-42dc-9249-11c5e1e0529b.gif)

### 3. Skops Integration 📈 

Our new integration with [skops](https://huggingface.co/blog/skops) allows you to load tabular classification and regression models directly from the [hub](https://huggingface.co/models). 

Here's a classification example showing how quick it is to set up an interface for a [model](https://huggingface.co/scikit-learn/tabular-playground).

```python
import gradio as gr
gr.Interface.load("models/scikit-learn/tabular-playground").launch()
```

![187936493-5c90c01d-a6dd-400f-aa42-833a096156a1](https://user-images.githubusercontent.com/9021060/189090519-328fbcb4-120b-43c8-aa54-d6fccfa6b7e8.png)


## Bug Fixes

## Documentation Changes

## Testing and Infrastructure Changes

## Breaking Changes

## Full Changelog

* safari fixes by @pngwn in :pr:`2138`
* Fix roundedness and form borders by @aliabid94 in :pr:`2147`
* Better processing of example data prior to creating dataset component by @freddyaboulton in :pr:`2147`
* Show error on Connection drops by @aliabid94 in :pr:`2147`
* 3.2 release! by @abidlabs in :pr:`2139`
* Fixed Named API Requests by @abidlabs in :pr:`2151`
* Quick Fix: Cannot upload Model3D image after clearing it by @dawoodkhan82 in :pr:`2168`
* Fixed misleading log when server_name is '0.0.0.0' by @lamhoangtung in :pr:`2176`
* Keep embedded PngInfo metadata by @cobryan05 in :pr:`2170`
* Skops integration: Load tabular classification and regression models from the hub by @freddyaboulton in :pr:`2126`
* Respect original filename when cached example files are downloaded by @freddyaboulton in :pr:`2145`
* Add manual trigger to deploy to pypi by @abidlabs in :pr:`2192`
* Fix bugs with gr.update by @freddyaboulton in :pr:`2157`
* Make queue per app by @aliabid94 in :pr:`2193`
* Preserve Labels In Interpretation Components by @freddyaboulton in :pr:`2166`
* Quick Fix: Multiple file download not working by @dawoodkhan82 in :pr:`2169`
* use correct MIME type for js-script file by @daspartho in :pr:`2200`
* Add accordion component by @aliabid94 in :pr:`2208`


## Contributors Shoutout

* @lamhoangtung made their first contribution in :pr:`2176`
* @cobryan05 made their first contribution in :pr:`2170`
* @daspartho made their first contribution in :pr:`2200`
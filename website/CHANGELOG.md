# Upcoming Release 

## New Features

### 1. New Sketching and inpainting for Images! :pr:1456 

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

### 1. Demos now deployed to huggingface spaces :pr:1600

## Breaking Changes

### 1. Something here

## Full Changelog

* Automated release notes :pr:2306
* Demos now deployed to huggingface spaces :pr:1600

## Contributors Shoutout


<br>

# Version 3.4

## New Features

### 1. Gallery Captions 🖼️ 

You can now pass captions to images in the Gallery component. To do so you need to pass a {List} of (image, {str} caption) tuples. This is optional and the component also accepts just a list of the images. 

Here's an example: 

```python
import gradio as gr

images_with_captions = [
    ("https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6", "Cheetah by David Groves"),
    ("https://images.unsplash.com/photo-1546182990-dffeafbe841d", "Lion by Francesco"), 
    ("https://images.unsplash.com/photo-1561731216-c3a4d99437d5", "Tiger by Mike Marrah")
    ]

with gr.Blocks() as demo:
    gr.Gallery(value=images_with_captions)

demo.launch()
```

<img src="https://user-images.githubusercontent.com/9021060/192399521-7360b1a9-7ce0-443e-8e94-863a230a7dbe.gif" alt="gallery_captions" width="1000"/>

### 2. Type Values into the Slider 🔢 

You can now type values directly on the Slider component! Here's what it looks like: 

![type-slider](https://user-images.githubusercontent.com/9021060/192399877-76b662a1-fede-4417-a932-fc15f0da7360.gif)

### 3. Better Sketching and Inpainting 🎨 

We've made a lot of changes to our Image component so that it can support better sketching and inpainting. 

Now supports:
* A standalone black-and-white sketch
```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Sketchpad(), gr.Image())
demo.launch()
```
![bw](https://user-images.githubusercontent.com/9021060/192410264-b08632b5-7b2a-4f86-afb0-5760e7b474cf.gif)


* A standalone color sketch
```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Paint(), gr.Image())
demo.launch()
```
![color-sketch](https://user-images.githubusercontent.com/9021060/192410500-3c8c3e64-a5fd-4df2-a991-f0a5cef93728.gif)


* An uploadable image with black-and-white or color sketching

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Image(source='upload', tool='color-sketch'), gr.Image()) # for black and white, tool = 'sketch'
demo.launch()
```
![sketch-new](https://user-images.githubusercontent.com/9021060/192402422-e53cb7b6-024e-448c-87eb-d6a35a63c476.gif)


* Webcam with black-and-white or color sketching

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Image(source='webcam', tool='color-sketch'), gr.Image()) # for black and white, tool = 'sketch'
demo.launch()
```
![webcam-sketch](https://user-images.githubusercontent.com/9021060/192410820-0ffaf324-776e-4e1f-9de6-0fdbbf4940fa.gif)


As well as other fixes 


## Bug Fixes
1. Fix bug where max concurrency count is not respected in queue by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2286
2. fix : queue could be blocked by @SkyTNT in https://github.com/gradio-app/gradio/pull/2288
3. Supports `gr.update()` in example caching by @abidlabs in https://github.com/gradio-app/gradio/pull/2309
4. Clipboard fix for iframes by @abidlabs in https://github.com/gradio-app/gradio/pull/2321
5. Fix: Dataframe column headers are reset when you add a new column by @dawoodkhan82 in https://github.com/gradio-app/gradio/pull/2318
6. Added support for URLs for Video, Audio, and Image by @abidlabs in https://github.com/gradio-app/gradio/pull/2256
7. Add documentation about how to create and use the Gradio FastAPI app by @abidlabs in https://github.com/gradio-app/gradio/pull/2263

## Documentation Changes
1. Adding a Playground Tab to the Website by @aliabd in https://github.com/gradio-app/gradio/pull/1860
3. Gradio for Tabular Data Science Workflows Guide by @merveenoyan in https://github.com/gradio-app/gradio/pull/2199
4. Promotes `postprocess` and `preprocess` to documented parameters by @abidlabs in https://github.com/gradio-app/gradio/pull/2293
5. Update 2)key_features.md by @voidxd in https://github.com/gradio-app/gradio/pull/2326
6. Add docs to blocks context postprocessing function by @Ian-GL in https://github.com/gradio-app/gradio/pull/2332

## Testing and Infrastructure Changes
1. Website fixes and refactoring by @aliabd in https://github.com/gradio-app/gradio/pull/2280
2. Don't deploy to spaces on release by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2313

## What's Changed
* Website fixes and refactoring by @aliabd in https://github.com/gradio-app/gradio/pull/2280
* Fix bug where max concurrency count is not respected in queue by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2286
* Promotes `postprocess` and `preprocess` to documented parameters by @abidlabs in https://github.com/gradio-app/gradio/pull/2293
* Raise warning when trying to cache examples but not all inputs have examples by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2279
* fix : queue could be blocked by @SkyTNT in https://github.com/gradio-app/gradio/pull/2288
* Don't deploy to spaces on release by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2313
* Supports `gr.update()` in example caching by @abidlabs in https://github.com/gradio-app/gradio/pull/2309
* Respect Upstream Queue when loading interfaces/blocks from Spaces by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2294
* Clipboard fix for iframes by @abidlabs in https://github.com/gradio-app/gradio/pull/2321
* Sketching + Inpainting Capabilities to Gradio by @abidlabs in https://github.com/gradio-app/gradio/pull/2144
* Update 2)key_features.md by @voidxd in https://github.com/gradio-app/gradio/pull/2326
* release 3.4b3 by @abidlabs in https://github.com/gradio-app/gradio/pull/2328
* Fix: Dataframe column headers are reset when you add a new column by @dawoodkhan82 in https://github.com/gradio-app/gradio/pull/2318
* Start queue when gradio is a sub application by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2319
* Fix Web Tracker Script by @aliabd in https://github.com/gradio-app/gradio/pull/2308
* Add docs to blocks context postprocessing function by @Ian-GL in https://github.com/gradio-app/gradio/pull/2332
* Fix typo in iterator variable name in run_predict function by @freddyaboulton in https://github.com/gradio-app/gradio/pull/2340
* Add captions to galleries by @aliabid94 in https://github.com/gradio-app/gradio/pull/2284
* Typeable value on gradio.Slider by @dawoodkhan82 in https://github.com/gradio-app/gradio/pull/2329

## New Contributors
* @SkyTNT made their first contribution in https://github.com/gradio-app/gradio/pull/2288
* @voidxd made their first contribution in https://github.com/gradio-app/gradio/pull/2326

# Version 3.3

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

* safari fixes by @pngwn in :pr:2138
* Fix roundedness and form borders by @aliabid94 in :pr:2147
* Better processing of example data prior to creating dataset component by @freddyaboulton in :pr:2147
* Show error on Connection drops by @aliabid94 in :pr:2147
* 3.2 release! by @abidlabs in :pr:2139
* Fixed Named API Requests by @abidlabs in :pr:2151
* Quick Fix: Cannot upload Model3D image after clearing it by @dawoodkhan82 in :pr:2168
* Fixed misleading log when server_name is '0.0.0.0' by @lamhoangtung in :pr:2176
* Keep embedded PngInfo metadata by @cobryan05 in :pr:2170
* Skops integration: Load tabular classification and regression models from the hub by @freddyaboulton in :pr:2126
* Respect original filename when cached example files are downloaded by @freddyaboulton in :pr:2145
* Add manual trigger to deploy to pypi by @abidlabs in :pr:2192
* Fix bugs with gr.update by @freddyaboulton in :pr:2157
* Make queue per app by @aliabid94 in :pr:2193
* Preserve Labels In Interpretation Components by @freddyaboulton in :pr:2166
* Quick Fix: Multiple file download not working by @dawoodkhan82 in :pr:2169
* use correct MIME type for js-script file by @daspartho in :pr:2200
* Add accordion component by @aliabid94 in :pr:2208


## Contributors Shoutout

* @lamhoangtung made their first contribution in :pr:2176
* @cobryan05 made their first contribution in :pr:2170
* @daspartho made their first contribution in :pr:2200
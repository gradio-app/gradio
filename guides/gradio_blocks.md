# Gradio Blocks

related_spaces: https://huggingface.co/spaces/akhaliq/ArcaneGAN-blocks, https://huggingface.co/spaces/akhaliq/animeganv2-blocks, https://huggingface.co/spaces/aliabd/blocks-image-audio, https://huggingface.co/spaces/merve/gr-blocks
tags: BLOCKS
Docs: block

## Introduction

Blocks is the new way of creating Machine Learning demos with gradio! We built it to allow for much wider use cases than our `Interface` based API.

With blocks, you have greater flexibility in..

* Layout
    * Put a `component` anywhere on the page 
    * Use `columnns`, `rows`, or `tabs` to organize the content 
* Functionality 
    * Define your own `buttons` with their own workflows
    * Hide or show a `component` based on your own logic 
    * Add `markdown` anywhere oon the page
    * Use new abstraction blocks like `TabbedInterfaces`, `MultiStepInterface` etc

Below is a live blocks demo:

<iframe src="https://hf.space/gradioiframe/aliabd/blocks-image-audio/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Let's get started!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).

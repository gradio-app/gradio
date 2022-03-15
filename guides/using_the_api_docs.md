# Using the API Docs

tags: API

## Introduction

Every gradio interface comes with an API you can use directly. To find out how to use it, just click the `view the api` button at the bottom of the page (whether its hosted on spaces, generated using `share=True`, or running locally).

![view the api button](website/src/assets/img/guides/using_the_api_docs/view-the-api-button.gif)

This button opens up interface-specific API docs. This will show you the predict endpoint, payload, response, as well as sample code snippets in Python, JS and cURL.

# What will the API docs tell you?

Below is an (iframed) example: the API Docs of [this space](https://huggingface.co/spaces/erogol/CoquiTTS).

It shows that there are 7 sections on the page

* The predict **endpoint**: where to send the payload
* The **inputs** and their types
* The **outputs** and their types
* The **payload**: what to send and how to structure it 
* The **response**: what to expect to receive 
* A live **demo** and **code snippets** in Python, JS and cURL
* Other **methods** related to the inputs/outputs 


<iframe src="https://hf.space/gradioiframe/erogol/CoquiTTS/api" frameBorder="5" height="725" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

### That's all! Happy building :)
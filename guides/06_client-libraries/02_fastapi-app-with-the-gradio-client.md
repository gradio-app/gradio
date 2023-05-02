# Building a FastAPI App with the Gradio Python Client

Tags: CLIENT, API, WEB APP

In this blog post, we will demonstrate how to use the `gradio_client` Python library, which enables developers to make requests to a Gradio app programmatically, within a FastAPI web app. The web app we will be building is called "Acapellify," and it will take a YouTube video URL as input and return a version of that video without instrumental music.

**Prequisites**

Before we begin, make sure you are running Python 3.9 or later, and have the following libraries installed:

* `gradio_client`
* `fastapi`
* `youtube-dl`
* `ffmpeg`

You can install these libraries from `pip`: 

``` bash
$ pip install gradio_client fastapi youtube-dl ffmpeg
```

## Step 1: Write the Acappelify Video Function

Let's start with what seems like the most complex bi -- using machine learning to remove the music from a video. 






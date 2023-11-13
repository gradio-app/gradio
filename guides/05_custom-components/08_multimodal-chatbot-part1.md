# Build a Custom Multimodal Chatbot - Part 1

This is the first in a two part series where we build a custom Multimodal Chatbot component.
In part 1, we will modify the Gradio Chatbot component to display text and media files (video, audio, image) in the same message.
In part 2, we will build a custom Textbox component that will be able to send multimodal messages (text and media files) to the chatbot.

You can follow along with the author of this post as he implements the chatbot component in the following YouTube video!

<iframe width="560" height="315" src="https://www.youtube.com/embed/IVJkOHTBPn0?si=bs-sBv43X-RVA8ly" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Here's a preview of what our multimodal chatbot component will look like:

![MultiModal Chatbot](https://gradio-builds.s3.amazonaws.com/assets/MultimodalChatbot.png)


## Part 1 - Creating our project

For this demo we will be tweaking the existing Gradio `Chatbot`` component to display text and media files in the same message.
Let's create a new custom component directory by templating off of the `Chatbot` component source code.

```bash
gradio cc create MultimodalChatbot --template Chatbot
```

And we're ready to go!

Tip: Make sure to ,odify the `Author` key in the `pyproject.toml` file, `authors = [{ name = "YOUR NAME", email = "YOUR EMAIL" }]`.

## Part 2 - The backend

Open up the `multimodalchatbot.py` file in your favorite code editor and let's get started modifying the backend of our component.

The first thing we will do is create the `data_model` of our component.
The `data_model` is the data format that your python component will receive and send to the javascript client running the UI.
You can read more about the `data_model` (here)[./backend]
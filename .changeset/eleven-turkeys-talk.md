---
"gradio": minor
"gradio_client": minor
---

highlight:

#### Create Discord Bots from Gradio Apps 🤖

We're excited to announce that Gradio can now automatically create a discord bot from any `gr.ChatInterface` app. 

It's as easy as importing `gradio_client`, connecting to the app, and calling `deploy_discord`!

*🦙 Turning Llama 2 70b into a discord bot 🦙*
```python
import gradio_client as grc
grc.Client("ysharma/Explore_llamav2_with_TGI").deploy_discord(to_id="llama2-70b-discord-bot")
```

<img src="https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/guide/llama_chat.gif">

#### Getting started with template spaces

To help get you started, we have created an organization on Hugging Face called [gradio-discord-bots](https://huggingface.co/gradio-discord-bots) with template spaces you can use to turn state of the art LLMs powered by Gradio to discord bots.

Currently we have template spaces for:

* [Llama-2-70b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-70b-chat-hf) powered by a FREE Hugging Face Inference Endpoint!
* [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-13b-chat-hf) powered by Hugging Face Inference Endpoints.
* [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/llama-2-13b-chat-transformers) powered by Hugging Face transformers.
* [falcon-7b-instruct](https://huggingface.co/spaces/gradio-discord-bots/falcon-7b-instruct) powered by Hugging Face Inference Endpoints.
* [gpt-3.5-turbo](https://huggingface.co/spaces/gradio-discord-bots/gpt-35-turbo), powered by openai. Requires an OpenAI key.

But once again, you can deploy ANY `gr.ChatInterface` app exposed on the internet! So don't hesitate to try it on your own Chatbots.

❗️ Additional Note ❗️: Technically, any gradio app that exposes an api route that takes in a single string and outputs a single string can be deployed to discord. But `gr.ChatInterface` apps naturally lend themselves to discord's chat functionality so we suggest you start with those.


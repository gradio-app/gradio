# 🚀 Deploying Apps as Discord Bots 🚀

Tags: NLP, TEXT, CHAT

We're excited to announce that Gradio now supports deploying apps as Discord bots! 🤖 

Discord is a popular communication platform that allows users to chat and interact with each other in real-time. By integrating your Gradio app with Discord, you can bring cutting edge AI to your discord server, giving you the ability to interact with your users and community in a whole new way.

## 💻 How does it work? 💻

With `gradio_client` version `0.3.0`, any gradio `ChatInterface` app can automatically be deployed as a discord bot via the `deploy_discord` method of the `Client` class.

Technically, any gradio app that exposes an api route that takes in a single string and outputs a single string can be deployed to discord. In this guide, we will focus on `gr.ChatInterface` as those apps naturally lend themselves to discord's chat functionality.

## 🛠️ Requirements 🛠️

Make sure you have the latest `gradio_client` version installed.

```bash
pip install gradio_client>=0.3.0
```

Also, make sure you have a [Hugging Face account](https://huggingface.co/) and a [write access token](https://huggingface.co/docs/hub/security-tokens).

## 🏃‍♀️ Getting Started 🏃‍♀️

We have created an organization on Hugging Face called [gradio-discord-bots](https://huggingface.co/gradio-discord-bots) containing several template spaces that explain how to deploy state of the art LLMs powered by gradio as discord bots.

The easiest way to get started is by deploying Meta's Llama 2 LLM with 70 billion parameter. Simply go to this [space](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-70b-chat-hf) and follow the instructions. 

The deployment can be done in one line! 🤯

```python
import gradio_client as grc
grc.Client("ysharma/Explore_llamav2_with_TGI").deploy_discord(to_id="llama2-70b-discord-bot")
```

## 🦜 Additional LLMs 🦜

In addion to Meta's 70 billion Llama 2 model, we have prepared template spaces for the following LLMs and deployment options:

* [gpt-3.5-turbo](https://huggingface.co/spaces/gradio-discord-bots/gpt-35-turbo), powered by openai. Required OpenAI key.
* [falcon-7b-instruct](https://huggingface.co/spaces/gradio-discord-bots/falcon-7b-instruct) powered by Hugging Face Inference Endpoints.
* [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-13b-chat-hf) powered by Hugging Face Inference Endpoints.
* [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/llama-2-13b-chat-transformers) powered by Hugging Face transformers.

To deploy any of these models to discord, simply follow the instructions in the linked space for that model.

## Deploying non-chat gradio apps to discord

As mentioned above, you don't need a `gr.ChatInterface` if you want to deploy your gradio app to discord. All that's needed is an api route that takes in a single string and outputs a single string. 

The following code will deploy a space that translates english to german as a discord bot.

```python
import gradio_client as grc
client = grc.Client("freddyaboulton/english-to-german")
client.deploy_discord(api_names=['german'])
```

## Deploying Via CLI

The linked spaces show how to deploy to discord via the `deploy_discord` method of the Client class. However, you can also deploy to discord via the command line. Install the latest version of gradio and run

```bash
gradio deploy-discord --help
```

## Conclusion

That's it for this guide! We're really excited about this feature. Tag [@Gradio](https://twitter.com/Gradio) on twitter and show us how your discord community interacts with your discord bots. 
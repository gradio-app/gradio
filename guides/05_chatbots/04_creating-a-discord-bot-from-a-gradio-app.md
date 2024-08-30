# 🚀 Creating Discord Bots from Gradio Apps 🚀

Tags: NLP, TEXT, CHAT

We're excited to announce that Gradio can now automatically create a discord bot from a deployed app! 🤖

Discord is a popular communication platform that allows users to chat and interact with each other in real-time. By turning your Gradio app into a Discord bot, you can bring cutting edge AI to your discord server and give your community a whole new way to interact.

## 💻 How does it work? 💻

With `gradio_client` version `0.3.0`, any gradio `ChatInterface` app on the internet can automatically be deployed as a discord bot via the `deploy_discord` method of the `Client` class.

Technically, any gradio app that exposes an api route that takes in a single string and outputs a single string can be deployed to discord. In this guide, we will focus on `gr.ChatInterface` as those apps naturally lend themselves to discord's chat functionality.

## 🛠️ Requirements 🛠️

Make sure you have the latest `gradio_client` and `gradio` versions installed.

```bash
pip install gradio_client>=0.3.0 gradio>=3.38.0
```

Also, make sure you have a [Hugging Face account](https://huggingface.co/) and a [write access token](https://huggingface.co/docs/hub/security-tokens).

⚠️ Tip ⚠️: Make sure you login to the Hugging Face Hub by running `huggingface-cli login`. This will let you skip passing your token in all subsequent commands in this guide.

## 🏃‍♀️ Quickstart 🏃‍♀️

### Step 1: Implementing our chatbot

Let's build a very simple Chatbot using `ChatInterface` that simply repeats the user message. Write the following code into an `app.py`

```python
import gradio as gr

def slow_echo(message, history):
    return message

demo = gr.ChatInterface(slow_echo).queue().launch()
```

### Step 2: Deploying our App

In order to create a discord bot for our app, it must be accessible over the internet. In this guide, we will use the `gradio deploy` command to deploy our chatbot to Hugging Face spaces from the command line. Run the following command.

```bash
gradio deploy --title echo-chatbot --app-file app.py
```

This command will ask you some questions, e.g. requested hardware, requirements, but the default values will suffice for this guide.
Note the URL of the space that was created. Mine is https://huggingface.co/spaces/freddyaboulton/echo-chatbot

### Step 3: Creating a Discord Bot

Turning our space into a discord bot is also a one-liner thanks to the `gradio deploy-discord`. Run the following command:

```bash
gradio deploy-discord --src freddyaboulton/echo-chatbot
```

❗️ Advanced ❗️: If you already have a discord bot token you can pass it to the `deploy-discord` command. Don't worry, if you don't have one yet!

```bash
gradio deploy-discord --src freddyaboulton/echo-chatbot --discord-bot-token <token>
```

Note the URL that gets printed out to the console. Mine is https://huggingface.co/spaces/freddyaboulton/echo-chatbot-gradio-discord-bot

### Step 4: Getting a Discord Bot Token

If you didn't have a discord bot token for step 3, go to the URL that got printed in the console and follow the instructions there.
Once you obtain a token, run the command again but this time pass in the token:

```bash
gradio deploy-discord --src freddyaboulton/echo-chatbot --discord-bot-token <token>
```

### Step 5: Add the bot to your server

Visit the space of your discord bot. You should see "Add this bot to your server by clicking this link:" followed by a URL. Go to that URL and add the bot to your server!

### Step 6: Use your bot!

By default the bot can be called by starting a message with `/chat`, e.g. `/chat <your prompt here>`.

⚠️ Tip ⚠️: If either of the deployed spaces goes to sleep, the bot will stop working. By default, spaces go to sleep after 48 hours of inactivity. You can upgrade the hardware of your space to prevent it from going to sleep. See this [guide](https://huggingface.co/docs/hub/spaces-gpus#using-gpu-spaces) for more information.

<img src="https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/guide/echo_slash.gif">

### Using the `gradio_client.Client` Class

You can also create a discord bot from a deployed gradio app with python.

```python
import gradio_client as grc
grc.Client("freddyaboulton/echo-chatbot").deploy_discord()
```

## 🦾 Using State of The Art LLMs 🦾

We have created an organization on Hugging Face called [gradio-discord-bots](https://huggingface.co/gradio-discord-bots) containing several template spaces that explain how to deploy state of the art LLMs powered by gradio as discord bots.

The easiest way to get started is by deploying Meta's Llama 2 LLM with 70 billion parameter. Simply go to this [space](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-70b-chat-hf) and follow the instructions.

The deployment can be done in one line! 🤯

```python
import gradio_client as grc
grc.Client("ysharma/Explore_llamav2_with_TGI").deploy_discord(to_id="llama2-70b-discord-bot")
```

## 🦜 Additional LLMs 🦜

In addition to Meta's 70 billion Llama 2 model, we have prepared template spaces for the following LLMs and deployment options:

- [gpt-3.5-turbo](https://huggingface.co/spaces/gradio-discord-bots/gpt-35-turbo), powered by openai. Required OpenAI key.
- [falcon-7b-instruct](https://huggingface.co/spaces/gradio-discord-bots/falcon-7b-instruct) powered by Hugging Face Inference Endpoints.
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-13b-chat-hf) powered by Hugging Face Inference Endpoints.
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/llama-2-13b-chat-transformers) powered by Hugging Face transformers.

To deploy any of these models to discord, simply follow the instructions in the linked space for that model.

## Deploying non-chat gradio apps to discord

As mentioned above, you don't need a `gr.ChatInterface` if you want to deploy your gradio app to discord. All that's needed is an api route that takes in a single string and outputs a single string.

The following code will deploy a space that translates english to german as a discord bot.

```python
import gradio_client as grc
client = grc.Client("freddyaboulton/english-to-german")
client.deploy_discord(api_names=['german'])
```

## Conclusion

That's it for this guide! We're really excited about this feature. Tag [@Gradio](https://twitter.com/Gradio) on twitter and show us how your discord community interacts with your discord bots.

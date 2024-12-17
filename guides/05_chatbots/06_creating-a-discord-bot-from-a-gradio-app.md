# 🚀 Creating Discord Bots with Gradio 🚀

Tags: NLP, TEXT, CHAT

You can make your Gradio app available as a Discord bot to let users in your Discord server interact with it directly.  

## How does it work?

The Discord bot will listen to messages mentioning it in channels. When it receives a message (which can include text as well as files), it will send it to your Gradio app via Gradio's built in API. Your bot will reply with the response it receives from the API. 

Because Gradio's API is very flexible, you can create Discord bots that support text, images, audio, streaming, history, and a wide variety of other features very easily. 

![]()

## Prerequisites

* Have a running Gradio app. This app can be running locally or on Hugging Face Spaces. In this example, we will be using the [Gradio Studio Space](), which takes in an image and/or text and generates the code to generate the corresponding Gradio app.
* Install the latest version of `gradio` and the `discord.py` libraries:

```
pip install --upgrade gradio discord.py~=2
```


## 🏃‍♀️ Quickstart 🏃‍♀️

### Step 1: Write a basic Discord app

Let's write a skeleton 

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

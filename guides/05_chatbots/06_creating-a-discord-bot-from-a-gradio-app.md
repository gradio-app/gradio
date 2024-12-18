# 🚀 Creating Discord Bots with Gradio 🚀

Tags: CHAT, DEPLOY, DISCORD

You can make your Gradio app available as a Discord bot to let users in your Discord server interact with it directly. 

## How does it work?

The Discord bot will listen to messages mentioning it in channels. When it receives a message (which can include text as well as files), it will send it to your Gradio app via Gradio's built-in API. Your bot will reply with the response it receives from the API. 

Because Gradio's API is very flexible, you can create Discord bots that support text, images, audio, streaming, chat history, and a wide variety of other features very easily. 

* show screenshot here
![]()

## Prerequisites

* Install the latest version of `gradio` and the `discord.py` libraries:

```
pip install --upgrade gradio discord.py~=2.0
```
* Have a running Gradio app. This app can be running locally or on Hugging Face Spaces. In this example, we will be using the [Gradio Studio Space](), which takes in an image and/or text and generates the code to generate the corresponding Gradio app.

Now, we are ready to get started!


### 1. Create a Discord application

First, go to the [Discord apps dashboard](https://discord.com/developers/applications). Look for the "New Application" button and click it. Give your application a name, and then click "Create".

* image

On the resulting screen, you will see basic information about your application. Under the Settings section, click on the Bot option. You can update your Bot's username if you would like.

Then click on the "Reset Token" button. A new token will be generated. Copy it as we will need it for the next step.

Scroll down to the section that says "Privileged Gateway Intents". Your bot will need certain permissions to work correctly. In this tutorial, we will only be using the "Message Content Intent" so click the toggle to enable this intent. Save the changes.

### 2. Write a Discord bot

Let's start by writing a very simple Discord bot, just to make sure that everything is working. Write the following Python code in a file called `bot.py`, pasting the discord bot token from the previous step:

```python
# bot.py
import discord

TOKEN = #PASTE YOUR DISCORD BOT TOKEN HERE

client = discord.Client()

@client.event
async def on_ready():
    print(f'{client.user} has connected to Discord!')

client.run(TOKEN)
```

Now, run this file: `python bot.py`, which should run and print a message like:

```text
We have logged in as GradioPlaygroundBot#1451
```



### 4. Install the bot in your Discord Server

* talk about chat history

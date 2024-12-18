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
pip install --upgrade gradio discord.py~=2
```
* Have a running Gradio app. This app can be running locally or on Hugging Face Spaces. In this example, we will be using the [Gradio Studio Space](), which takes in an image and/or text and generates the code to generate the corresponding Gradio app.

Now, we are ready to get started!


### 1. Create a Discord application

First, go to the [Discord apps dashboard](https://discord.com/developers/applications). Look for the "New Application" button and click it. Then, choose the option to create your app from scratch.




### 2. Write a basic Discord bot

Let's write a skeleton 

```python

```

We will update this later with the actual logic we'd like to run.

### 3. Deploy your Discord bot


### 4. Install the bot in your Discord Server

### 5. Update your Discord bot to call Gradio

* talk about chat history

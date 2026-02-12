# 🚀 Creating Discord Bots with Gradio 🚀

Tags: CHAT, DEPLOY, DISCORD

You can make your Gradio app available as a Discord bot to let users in your Discord server interact with it directly. 

## How does it work?

The Discord bot will listen to messages mentioning it in channels. When it receives a message (which can include text as well as files), it will send it to your Gradio app via Gradio's built-in API. Your bot will reply with the response it receives from the API. 

Because Gradio's API is very flexible, you can create Discord bots that support text, images, audio, streaming, chat history, and a wide variety of other features very easily. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-18%20at%204.26.55%E2%80%AFPM.gif)

## Prerequisites

* Install the latest version of `gradio` and the `discord.py` libraries:

```
pip install --upgrade gradio discord.py~=2.0
```

* Have a running Gradio app. This app can be running locally or on Hugging Face Spaces. In this example, we will be using the [Gradio Playground Space](https://huggingface.co/spaces/abidlabs/gradio-playground-bot), which takes in an image and/or text and generates the code to generate the corresponding Gradio app.

Now, we are ready to get started!


### 1. Create a Discord application

First, go to the [Discord apps dashboard](https://discord.com/developers/applications). Look for the "New Application" button and click it. Give your application a name, and then click "Create".

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/discord-4.png)

On the resulting screen, you will see basic information about your application. Under the Settings section, click on the "Bot" option. You can update your bot's username if you would like.

Then click on the "Reset Token" button. A new token will be generated. Copy it as we will need it for the next step.

Scroll down to the section that says "Privileged Gateway Intents". Your bot will need certain permissions to work correctly. In this tutorial, we will only be using the "Message Content Intent" so click the toggle to enable this intent. Save the changes.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/discord-3.png)



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

If that is working, we are ready to add Gradio-specific code. We will be using the [Gradio Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client) to query the Gradio Playground Space mentioned above. Here's the updated `bot.py` file:

```python
import discord
from gradio_client import Client, handle_file
import httpx
import os

TOKEN = #PASTE YOUR DISCORD BOT TOKEN HERE

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)
gradio_client = Client("abidlabs/gradio-playground-bot")

def download_image(attachment):
    response = httpx.get(attachment.url)
    image_path = f"./images/{attachment.filename}"
    os.makedirs("./images", exist_ok=True)
    with open(image_path, "wb") as f:
        f.write(response.content)
    return image_path

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    # Ignore messages from the bot itself
    if message.author == client.user:
        return

    # Check if the bot is mentioned in the message and reply
    if client.user in message.mentions:
        # Extract the message content without the bot mention
        clean_message = message.content.replace(f"<@{client.user.id}>", "").strip()

        # Handle images (only the first image is used)
        files = []
        if message.attachments:
            for attachment in message.attachments:
                if any(attachment.filename.lower().endswith(ext) for ext in ['png', 'jpg', 'jpeg', 'gif', 'webp']):
                    image_path = download_image(attachment)
                    files.append(handle_file(image_path))
                    break
        
        # Stream the responses to the channel
        for response in gradio_client.submit(
            message={"text": clean_message, "files": files},
        ):
            await message.channel.send(response[-1])

client.run(TOKEN)
```

### 3. Add the bot to your Discord Server

Now we are ready to install the bot on our server. Go back to the [Discord apps dashboard](https://discord.com/developers/applications). Under the Settings section, click on the "OAuth2" option. Scroll down to the "OAuth2 URL Generator" box and select the "bot" checkbox:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/discord-2.png)



Then in "Bot Permissions" box that pops up underneath, enable the following permissions:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/discord-1.png)


Copy the generated URL that appears underneath, which should look something like:

```text
https://discord.com/oauth2/authorize?client_id=1319011745452265575&permissions=377957238784&integration_type=0&scope=bot
```

Paste it into your browser, which should allow you to add the Discord bot to any Discord server that you manage.


### 4. That's it!

Now you can mention your bot from any channel in your Discord server, optionally attach an image, and it will respond with generated Gradio app code!

The bot will:
1. Listen for mentions
2. Process any attached images
3. Send the text and images to your Gradio app
4. Stream the responses back to the Discord channel

 This is just a basic example - you can extend it to handle more types of files, add error handling, or integrate with different Gradio apps.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-18%20at%204.26.55%E2%80%AFPM.gif)

If you build a Discord bot from a Gradio app, feel free to share it on X and tag [the Gradio account](https://x.com/Gradio), and we are happy to help you amplify!
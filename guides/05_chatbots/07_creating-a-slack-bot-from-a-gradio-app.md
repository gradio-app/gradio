# 🚀 Creating a Slack Bot from a Gradio App 🚀

Tags: CHAT, DEPLOY, SLACK

You can make your Gradio app available as a Slack bot to let users in your Slack workspace interact with it directly. 

## How does it work?

The Slack bot will listen to messages mentioning it in channels. When it receives a message (which can include text as well as files), it will send it to your Gradio app via Gradio's built-in API. Your bot will reply with the response it receives from the API. 

Because Gradio's API is very flexible, you can create Slack bots that support text, images, audio, streaming, chat history, and a wide variety of other features very easily. 

## Prerequisites

* Install the latest version of `gradio` and the `slack-bolt` library:

```bash
pip install --upgrade gradio slack-bolt
```

* Have a running Gradio app. This app can be running locally or on Hugging Face Spaces. In this example, we will be using the [Gradio Playground Space](https://huggingface.co/spaces/abidlabs/gradio-playground-bot), which takes in an image and/or text and generates the code to generate the corresponding Gradio app.

Now, we are ready to get started!

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch" and give your app a name
3. Select the workspace where you want to develop your app
4. Under "OAuth & Permissions", scroll to "Scopes" and add these Bot Token Scopes:
   - `app_mentions:read`
   - `chat:write`
   - `files:read`
   - `files:write`
5. Install the app to your workspace
6. Copy your "Bot User OAuth Token" (starts with `xoxb-`) as we'll need it later

### 2. Write a Slack bot

Let's create a simple Slack bot that integrates with your Gradio app. Create a file called `bot.py`:

```python
# bot.py
import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from gradio_client import Client, handle_file
import httpx

# Initialize the Slack app
app = App(token=os.environ["SLACK_BOT_TOKEN"])
gradio_client = Client("abidlabs/gradio-playground-bot")

def download_file(file_info, client):
    response = client.files_info(file=file_info["id"])
    file_url = response["file"]["url_private"]
    
    headers = {"Authorization": f"Bearer {os.environ['SLACK_BOT_TOKEN']}"}
    response = httpx.get(file_url, headers=headers)
    
    file_path = f"./images/{file_info['name']}"
    os.makedirs("./images", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(response.content)
    return file_path

@app.event("app_mention")
def handle_mention(event, say, client):
    # Extract the message without the bot mention
    text = event["text"]
    bot_user_id = event["authorizations"][0]["user_id"]
    clean_message = text.replace(f"<@{bot_user_id}>", "").strip()
    
    # Handle attached files (images)
    files = []
    if "files" in event:
        for file_info in event["files"]:
            if file_info["mimetype"].startswith("image/"):
                image_path = download_file(file_info, client)
                files.append(handle_file(image_path))
                break
    
    # Submit to Gradio and send responses
    for response in gradio_client.submit(
        message={"text": clean_message, "files": files},
    ):
        say(response[-1])

if __name__ == "__main__":
    # Start the app using Socket Mode
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()
```

To run this bot, you'll need to set two environment variables:
- `SLACK_BOT_TOKEN`: The Bot User OAuth Token from step 1 (starts with `xoxb-`)
- `SLACK_APP_TOKEN`: Generate this in the "Basic Information" section under "App-Level Tokens" (starts with `xapp-`)

### 3. Enable Socket Mode

1. Go back to your Slack App settings
2. Enable Socket Mode in the "Socket Mode" section
3. Generate an App-Level Token with the `connections:write` scope
4. Save this token as your `SLACK_APP_TOKEN` environment variable

### 4. That's it!

Run your bot with:

```bash
python bot.py
```

Now you can mention your bot in any channel it's in, optionally attach an image, and it will respond with generated Gradio app code!

The bot will:
1. Listen for mentions
2. Process any attached images
3. Send the text and images to your Gradio app
4. Stream the responses back to the Slack channel

This is just a basic example - you can extend it to handle more types of files, add error handling, or integrate with different Gradio apps!

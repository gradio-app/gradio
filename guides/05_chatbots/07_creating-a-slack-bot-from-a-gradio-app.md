# 🚀 Creating a Slack Bot from a Gradio App 🚀

Tags: CHAT, DEPLOY, SLACK

You can make your Gradio app available as a Slack bot to let users in your Slack workspace interact with it directly. 

## How does it work?

The Slack bot will listen to messages mentioning it in channels. When it receives a message (which can include text as well as files), it will send it to your Gradio app via Gradio's built-in API. Your bot will reply with the response it receives from the API. 

Because Gradio's API is very flexible, you can create Slack bots that support text, images, audio, streaming, chat history, and a wide variety of other features very easily. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-19%20at%203.30.00%E2%80%AFPM.gif)

## Prerequisites

* Install the latest version of `gradio` and the `slack-bolt` library:

```bash
pip install --upgrade gradio slack-bolt~=1.0
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
5. In the same "OAuth & Permissions" page, scroll back up and click the button to install the app to your workspace.
6. Note the "Bot User OAuth Token" (starts with `xoxb-`) that appears as we'll need it later
7. Click on "Socket Mode" in the menu bar. When the page loads, click the toggle to "Enable Socket Mode"
8. Give your token a name, such as `socket-token` and copy the token that is generated (starts with `xapp-`) as we'll need it later.
9. Finally, go to the "Event Subscription" option in the menu bar. Click the toggle to "Enable Events" and subscribe to the `app_mention` bot event.

### 2. Write a Slack bot

Let's start by writing a very simple Slack bot, just to make sure that everything is working. Write the following Python code in a file called `bot.py`, pasting the two tokens from step 6 and step 8 in the previous section.

```py
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

SLACK_BOT_TOKEN = # PASTE YOUR SLACK BOT TOKEN HERE
SLACK_APP_TOKEN = # PASTE YOUR SLACK APP TOKEN HERE

app = App(token=SLACK_BOT_TOKEN)

@app.event("app_mention")
def handle_app_mention_events(body, say):
    user_id = body["event"]["user"]
    say(f"Hi <@{user_id}>! You mentioned me and said: {body['event']['text']}")

if __name__ == "__main__":
    handler = SocketModeHandler(app, SLACK_APP_TOKEN)
    handler.start()
```

If that is working, we are ready to add Gradio-specific code. We will be using the [Gradio Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client) to query the Gradio Playground Space mentioned above. Here's the updated `bot.py` file:

```python
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

SLACK_BOT_TOKEN = # PASTE YOUR SLACK BOT TOKEN HERE
SLACK_APP_TOKEN = # PASTE YOUR SLACK APP TOKEN HERE

app = App(token=SLACK_BOT_TOKEN)
gradio_client = Client("abidlabs/gradio-playground-bot")

def download_image(url, filename):
    headers = {"Authorization": f"Bearer {SLACK_BOT_TOKEN}"}
    response = httpx.get(url, headers=headers)
    image_path = f"./images/{filename}"
    os.makedirs("./images", exist_ok=True)
    with open(image_path, "wb") as f:
        f.write(response.content)
    return image_path

def slackify_message(message):   
    # Replace markdown links with slack format and remove code language specifier after triple backticks
    pattern = r'\[(.*?)\]\((.*?)\)'
    cleaned = re.sub(pattern, r'<\2|\1>', message)
    cleaned = re.sub(r'```\w+\n', '```', cleaned)
    return cleaned.strip()

@app.event("app_mention")
def handle_app_mention_events(body, say):
    # Extract the message content without the bot mention
    text = body["event"]["text"]
    bot_user_id = body["authorizations"][0]["user_id"]
    clean_message = text.replace(f"<@{bot_user_id}>", "").strip()
    
    # Handle images if present
    files = []
    if "files" in body["event"]:
        for file in body["event"]["files"]:
            if file["filetype"] in ["png", "jpg", "jpeg", "gif", "webp"]:
                image_path = download_image(file["url_private_download"], file["name"])
                files.append(handle_file(image_path))
                break
    
    # Submit to Gradio and send responses back to Slack
    for response in gradio_client.submit(
        message={"text": clean_message, "files": files},
    ):
        cleaned_response = slackify_message(response[-1])
        say(cleaned_response)

if __name__ == "__main__":
    handler = SocketModeHandler(app, SLACK_APP_TOKEN)
    handler.start()
```
### 3. Add the bot to your Slack Workplace

Now, create a new channel or navigate to an existing channel in your Slack workspace where you want to use the bot. Click the "+" button next to "Channels" in your Slack sidebar and follow the prompts to create a new channel.

Finally, invite your bot to the channel:
1. In your new channel, type `/invite @YourBotName`
2. Select your bot from the dropdown
3. Click "Invite to Channel"

### 4. That's it!

Now you can mention your bot in any channel it's in, optionally attach an image, and it will respond with generated Gradio app code!

The bot will:
1. Listen for mentions
2. Process any attached images
3. Send the text and images to your Gradio app
4. Stream the responses back to the Slack channel

This is just a basic example - you can extend it to handle more types of files, add error handling, or integrate with different Gradio apps!

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-19%20at%203.30.00%E2%80%AFPM.gif)

If you build a Slack bot from a Gradio app, feel free to share it on X and tag [the Gradio account](https://x.com/Gradio), and we are happy to help you amplify!
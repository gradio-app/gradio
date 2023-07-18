import asyncio
import os
import threading
from concurrent.futures import wait
from threading import Event
from typing import Optional

import discord
import gradio as gr
from discord import Permissions
from discord.ext import commands
from discord.utils import oauth_url

import gradio_client as grc

event = Event()

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")


def get_client(session: Optional[str] = None) -> grc.Client:
    client = grc.Client("<<app-src>>")
    if session:
        client.session_hash = session
    return client


intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")
    event.set()
    print("------")


thread_to_client = {}
thread_to_user = {}


@bot.command(name="<<command-name>>")
@discord.app_commands.describe(
    prompt="Enter some text to chat with the bot! Like this: chat Hello, how are you?"
)
async def chat(ctx, _prompt: str):
    if ctx.author.id == bot.user.id:
        return
    try:
        channel = ctx.message.channel
        message = await channel.send("Creating thread...")
        prompt = ctx.message.content.replace(
            f"{bot.command_prefix}<<command-name>>", ""
        ).strip()
        thread = await message.create_thread(name=prompt, auto_archive_duration=60)
        loop = asyncio.get_running_loop()
        client = await loop.run_in_executor(None, get_client, None)
        job = client.submit(prompt, api_name="/chat")
        wait([job])

        thread_to_client[thread.id] = client
        thread_to_user[thread.id] = ctx.author.id
        await thread.send(f"{job.outputs()[-1]}")
    except Exception as e:
        print(f"{e}")


async def continue_chat(message):
    """Continues a given conversation based on chathistory"""
    try:
        client = thread_to_client[message.channel.id]
        prompt = message.content
        job = client.submit(prompt, api_name="/chat")
        wait([job])
        await message.reply(f"{job.outputs()[-1]}")

    except Exception as e:
        print(f"Error: {e}")


@bot.event
async def on_message(message):
    """Continue the chat"""
    try:
        if not message.author.bot:
            if message.channel.id in thread_to_user:
                if thread_to_user[message.channel.id] == message.author.id:
                    await continue_chat(message)
            else:
                await bot.process_commands(message)

    except Exception as e:
        print(f"Error: {e}")


# running in thread
def run_bot():
    if not DISCORD_TOKEN:
        print("DISCORD_TOKEN NOT SET")
        event.set()
    else:
        bot.run(DISCORD_TOKEN)


threading.Thread(target=run_bot).start()

event.wait()

if not DISCORD_TOKEN:
    welcome_message = """

    You have not specified a DISCORD_TOKEN, which means you have not created a bot account.

    # How to create a bot account?

    ## 1. Go to https://discord.com/developers/applications and click 'New Application'
    
    ## 2. Give your bot a name 🤖

    ![](https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/BotName.png)
    
    ## 3. Click the 'Reset Token' button to get a new token. Write it down and keep it safe 🔐
    
    ![](https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/ResetToken.png)
    
    ## 4. Optionally make the bot public if you want anyone to be able to add it to your server
    
    ## 5. On the left hand side under 'Bot', enable 'Message Content Intent' under 'Priviledged Gateway Intents'
    
    ![](https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/MessageContentIntent.png)

    ## 6. The token from step 3 is the DISCORD_TOKEN. Call client.deploy_discord(DISCORD_TOKEN, ...) or add the token as a space secret
    manually.
"""
else:
    permissions = Permissions(326417525824)
    url = oauth_url(bot.user.id, permissions=permissions)
    welcome_message = f"""
    ### Add this bot to your server by going to the following URL: 
    
    {url}
    """


with gr.Blocks() as demo:
    gr.Markdown(
        f"""
    # Discord bot of <<app-src>>
    {welcome_message}
    """
    )

demo.launch()

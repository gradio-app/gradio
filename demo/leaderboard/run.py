# URL: https://huggingface.co/spaces/gradio/leaderboard
# DESCRIPTION: A simple dashboard ranking spaces by number of likes.
# imports 
import gradio as gr
import requests
import pandas as pd
from huggingface_hub.hf_api import SpaceInfo
path = f"https://huggingface.co/api/spaces"


# defining the core fn
def get_blocks_party_spaces():
    r = requests.get(path)
    d = r.json()
    spaces = [SpaceInfo(**x) for x in d]
    blocks_spaces = {}
    for i in range(0,len(spaces)):
        if spaces[i].id.split('/')[0] == 'Gradio-Blocks' and hasattr(spaces[i], 'likes') and spaces[i].id != 'Gradio-Blocks/Leaderboard' and spaces[i].id != 'Gradio-Blocks/README':
            blocks_spaces[spaces[i].id]=spaces[i].likes
    df = pd.DataFrame(
    [{"Spaces_Name": Spaces, "likes": likes} for Spaces,likes in blocks_spaces.items()])
    df = df.sort_values(by=['likes'],ascending=False)
    return df

# defining the block
block = gr.Blocks()

# starting the block
with block:    
    # setting up text on the page
    gr.Markdown("""Leaderboard for the most popular Blocks Event Spaces. To learn more and join, see <a href="https://huggingface.co/Gradio-Blocks" target="_blank" style="text-decoration: underline">Blocks Party Event</a>""")
    # defining the layout
    with gr.Tabs():
        with gr.TabItem("Blocks Party Leaderboard"):
            with gr.Row():
                # defining the output
                data = gr.outputs.Dataframe(type="pandas")
            with gr.Row():
                # defining the button
                data_run = gr.Button("Refresh")
                # naming the fn that will run when the button is clicked, and update the output 
                data_run.click(get_blocks_party_spaces, inputs=None, outputs=data)
    # running the function on page load in addition to when the button is clicked
    block.load(get_blocks_party_spaces, inputs=None, outputs=data)               

 # launch    
block.launch()


import gradio as gr
import requests
import pandas as pd
from huggingface_hub.hf_api import SpaceInfo
path = f"https://huggingface.co/api/spaces"


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

block = gr.Blocks()

with block:    
    gr.Markdown("""Leaderboard for the most popular Blocks Event Spaces. To learn more and join, see <a href="https://huggingface.co/Gradio-Blocks" target="_blank" style="text-decoration: underline">Blocks Party Event</a>""")
    with gr.Tabs():
        with gr.TabItem("Blocks Party Leaderboard"):
            with gr.Row():
                data = gr.outputs.Dataframe(type="pandas")
            with gr.Row():
                data_run = gr.Button("Refresh")
                data_run.click(get_blocks_party_spaces, inputs=None, outputs=data)
    # running the function on page load in addition to when the button is clicked
    block.load(get_blocks_party_spaces, inputs=None, outputs=data)               

block.launch()


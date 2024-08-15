from __future__ import annotations

import gradio as gr
from huggingface_hub import whoami

def hello(profile: gr.OAuthProfile | None) -> str:
    if profile is None:
        return "I don't know you."
    return f"Hello {profile.name}"

def list_organizations(oauth_token: gr.OAuthToken | None) -> str:
    if oauth_token is None:
        return "Please deploy this on Spaces and log in to list organizations."
    org_names = [org["name"] for org in whoami(oauth_token.token)["orgs"]]
    return f"You belong to {', '.join(org_names)}."

with gr.Blocks() as demo:
    gr.LoginButton()
    m1 = gr.Markdown()
    m2 = gr.Markdown()
    demo.load(hello, inputs=None, outputs=m1)
    demo.load(list_organizations, inputs=None, outputs=m2)

if __name__ == "__main__":
    demo.launch()

import requests
from upload_demos import demos, upload_demo_to_space, AUTH_TOKEN, gradio_version
from gradio.networking import url_ok


for demo in demos:
    space_id = "gradio/" + demo
    space_url = requests.get(f"https://huggingface.co/api/spaces/{space_id}/host").json().get("host")
    if not url_ok(space_url):
        print(f"{space_id} was down, restarting")
        upload_demo_to_space(demo_name=demo, space_id=space_id, hf_token=AUTH_TOKEN, gradio_version=gradio_version)

from upload_demos import demos, upload_demo_to_space, AUTH_TOKEN, latest_gradio_stable
from gradio.networking import url_ok
import huggingface_hub

for demo in demos:
    space_id = "gradio/" + demo
    subdomain = huggingface_hub.space_info(space_id).subdomain
    if not url_ok(f"https://{subdomain}.hf.space"):
        print(f"{space_id} was down, restarting")
        upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo, hf_token=AUTH_TOKEN, gradio_version=latest_gradio_stable)

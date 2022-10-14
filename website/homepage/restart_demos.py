from upload_demos import demos, upload_demo_to_space, AUTH_TOKEN, gradio_version
from gradio.networking import url_ok


for demo in demos:
    space_id = "gradio/" + demo
    if not url_ok(f"https://hf.space/embed/{space_id}/+"):
        print(f"{space_id} was down, restarting")
        upload_demo_to_space(demo_name=demo, space_id=space_id, hf_token=AUTH_TOKEN, gradio_version=gradio_version)

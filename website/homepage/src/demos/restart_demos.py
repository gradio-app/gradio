from upload_demos import demos_by_category, upload_demo_to_space, AUTH_TOKEN, gradio_version
from gradio.networking import url_ok


for category in demos_by_category:
    for demo in category["demos"]:
        space_id = "gradio/" + demo["dir"]
        if not url_ok(f"https://hf.space/embed/{space_id}/+"):
            print(f"{space_id} was down, restarting")
            upload_demo_to_space(demo_name=demo["dir"], space_id=space_id, hf_token=AUTH_TOKEN, gradio_version=gradio_version)

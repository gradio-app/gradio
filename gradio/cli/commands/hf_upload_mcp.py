def main(url_or_space_id: str):
    from pathlib import Path

    import requests
    from huggingface_hub import space_info

    import gradio as gr

    if url_or_space_id.startswith("http"):
        url = url_or_space_id
    else:
        url = f"https://{space_info(url_or_space_id).subdomain}.hf.space"

    print(f"Uploading to {url}")

    def upload_to_space(file: str):
        """Upload a local file to a Hugging Face Space.
        Arguments:
            file: A complete, absolutepath to a local file to upload.
        Returns:
            A URL to the uploaded file.
        """

        with open(Path(file.strip()).resolve(), "rb") as f:
            response = requests.post(f"{url}/gradio_api/upload", files={"files": f})
        result = response.json()[0]
        return f"{url}/gradio_api/file={result}"

    gr.Interface(
        fn=upload_to_space,
        inputs=gr.Textbox(label="File"),
        outputs=gr.Textbox(label="Uploaded File URL"),
    ).launch(mcp_server=True)


if __name__ == "__main__":
    import typer

    typer.run(main)

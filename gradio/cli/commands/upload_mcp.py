def main(url_or_space_id: str, source_directory: str):
    import requests
    from gradio_client.utils import is_http_url_like
    from huggingface_hub import space_info
    from mcp.server.fastmcp import FastMCP

    from gradio.utils import abspath, is_in_or_equal

    source_path = abspath(source_directory)

    mcp = FastMCP("upload-mcp")

    if is_http_url_like(url_or_space_id):
        url = url_or_space_id.rstrip("/")
    else:
        url = f"https://{space_info(url_or_space_id).subdomain}.hf.space"

    @mcp.tool()
    def upload_file_to_gradio(file: str) -> str:
        """Generate a Gradio File Input for a local file by uploading it to a Gradio app and returning the URL.
        Arguments:
            file: A complete, absolute path to a local file to upload.
        Returns:
            Gradio File Input - A URL to the uploaded file.
        """

        target_path = abspath(file)

        if not is_in_or_equal(target_path, source_path):
            raise ValueError(f"File {file} is not in {source_path}")

        with open(target_path, "rb") as f:
            response = requests.post(f"{url}/gradio_api/upload", files={"files": f})
        response.raise_for_status()
        result = response.json()[0]
        return f"{url}/gradio_api/file={result}"

    mcp.run(transport="stdio")


if __name__ == "__main__":
    import typer

    typer.run(main)

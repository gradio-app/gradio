# The File Upload MCP Server

Tags: MCP, TOOL, LLM, SERVER, DOCS

If you've tried to to use a remote Gradio MCP server that takes a file as input (image, video, audio), you've probably run into this error:

<img src="https://huggingface.co/datasets/freddyaboulton/bucket/resolve/main/MCPError.png">

The reason is that since the Gradio server is hosted on a different machine, any input files must be available via a public URL so that they can downloaded in the remote machine.

There are many ways to host files on the internet, but they all require adding a manual step to your workflow. In the age of LLM agents, shouldn't we expect them to handle this step for you?

In this post, we'll show how you can connect your LLM to the "File Upload" MCP server so that it can handle the file uploading for you when appropriate!

## Using the File Upload MCP Server

As of version 5.36.0, Gradio now comes with a built-in MCP server that can upload files to a running Gradio application. In the `View API` page of the server, you should see the following code snippet if any of the tools require file inputs:

<img src="foo">

The command to start the MCP server takes two arguments:

- The URL (or Hugging Face space id) of the gradio application to upload the files to.
- The local directory on your computer with which the server is allowed to upload files from. For security, please make this directory as narrow as possible to prevent unintended file uploads.

As stated in the image, you need to install [uv](https://docs.astral.sh/uv/getting-started/installation/) (a python package manager that can run python scripts) before connecting from your MCP client. 

If you have gradio installed locally and you don't want to install uv, you can replace the `uvx` command with the path to gradio binary. It should look like this:

```json
"upload-files": {
    "command": "<absoluate-path-to-gradio>",
    "args": [
    "upload-mcp",
    "http://localhost:7860/",
    "/Users/freddyboulton/Pictures"
    ]
}
```

After connecting to the upload server, your LLM agent will know when to upload files for you automatically!

## Conclusion

In this guide, we've covered how you can connect to the Upload File MCP Server so that your agent can upload files before using Gradio MCP servers. Remember to set the `<UPLOAD_DIRECTORY>` as small as possible to prevent unintended file uploads!


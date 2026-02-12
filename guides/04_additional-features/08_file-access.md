# Security and File Access

Sharing your Gradio app with others (by hosting it on Spaces, on your own server, or through temporary share links) **exposes** certain files on your machine to the internet. Files that are exposed can be accessed at a special URL:

```bash
http://<your-gradio-app-url>/gradio_api/file=<local-file-path>
```

This guide explains which files are exposed as well as some best practices for making sure the files on your machine are secure.

## Files Gradio allows users to access 

- **1. Static files**. You can designate static files or directories using the `gr.set_static_paths` function. Static files  are not be copied to the Gradio cache (see below) and will be served directly from your computer. This can help save disk space and reduce the time your app takes to launch but be mindful of possible security implications as any static files are accessible to all useres of your Gradio app.

- **2. Files in the `allowed_paths` parameter in `launch()`**. This parameter allows you to pass in a list of additional directories or exact filepaths you'd like to allow users to have access to. (By default, this parameter is an empty list).

- **3. Files in Gradio's cache**. After you launch your Gradio app, Gradio copies certain files into a temporary cache and makes these files accessible to users. Let's unpack this in more detail below.


## The Gradio cache

First, it's important to understand why Gradio has a cache at all. Gradio copies files to a cache directory before returning them to the frontend. This prevents files from being overwritten by one user while they are still needed by another user of your application. For example, if your prediction function returns a video file, then Gradio will move that video to the cache after your prediction function runs and returns a URL the frontend can use to show the video. Any file in the cache is available via URL to all users of your running application.

Tip: You can customize the location of the cache by setting the `GRADIO_TEMP_DIR` environment variable to an absolute path, such as `/home/usr/scripts/project/temp/`. 

### Files Gradio moves to the cache

Gradio moves three kinds of files into the cache

1. Files specified by the developer before runtime, e.g. cached examples, default values of components, or files passed into parameters such as the `avatar_images` of `gr.Chatbot`

2. File paths returned by a prediction function in your Gradio application, if they ALSO meet one of the conditions below:

* It is in the `allowed_paths` parameter of the `Blocks.launch` method.
* It is in the current working directory of the python interpreter.
* It is in the temp directory obtained by `tempfile.gettempdir()`.

**Note:** files in the current working directory whose name starts with a period (`.`) will not be moved to the cache, even if they are returned from a prediction function, since they often contain sensitive information. 

If none of these criteria are met, the prediction function that is returning that file will raise an exception instead of moving the file to cache. Gradio performs this check so that arbitrary files on your machine cannot be accessed.

3. Files uploaded by a user to your Gradio app (e.g. through the `File` or `Image` input components).

Tip: If at any time Gradio blocks a file that you would like it to process, add its path to the `allowed_paths` parameter.

## The files Gradio will not allow others to access

While running, Gradio apps will NOT ALLOW users to access:

- **Files that you explicitly block via the `blocked_paths` parameter in `launch()`**. You can pass in a list of additional directories or exact filepaths to the `blocked_paths` parameter in `launch()`. This parameter takes precedence over the files that Gradio exposes by default, or by the `allowed_paths` parameter or the `gr.set_static_paths` function.

- **Any other paths on the host machine**. Users should NOT be able to access other arbitrary paths on the host.

## Uploading Files

Sharing your Gradio application will also allow users to upload files to your computer or server. You can set a maximum file size for uploads to prevent abuse and to preserve disk space. You can do this with the `max_file_size` parameter of `.launch`. For example, the following two code snippets limit file uploads to 5 megabytes per file.

```python
import gradio as gr

demo = gr.Interface(lambda x: x, "image", "image")

demo.launch(max_file_size="5mb")
# or
demo.launch(max_file_size=5 * gr.FileSize.MB)
```

## Best Practices

* Set a `max_file_size` for your application.
* Do not return arbitrary user input from a function that is connected to a file-based output component (`gr.Image`, `gr.File`, etc.). For example, the following interface would allow anyone to move an arbitrary file in your local directory to the cache: `gr.Interface(lambda s: s, "text", "file")`. This is because the user input is treated as an arbitrary file path. 
* Make `allowed_paths` as small as possible. If a path in `allowed_paths` is a directory, any file within that directory can be accessed. Make sure the entires of `allowed_paths` only contains files related to your application.
* Run your gradio application from the same directory the application file is located in. This will narrow the scope of files Gradio will be allowed to move into the cache. For example, prefer `python app.py` to `python Users/sources/project/app.py`.


## Example: Accessing local files
Both `gr.set_static_paths` and the `allowed_paths` parameter in launch expect absolute paths. Below is a minimal example to display a local `.png` image file in an HTML block.

```txt
├── assets
│   └── logo.png
└── app.py
```
For the example directory structure, `logo.png` and any other files in the `assets` folder can be accessed from your Gradio app in `app.py` as follows:

```python
from pathlib import Path

import gradio as gr

gr.set_static_paths(paths=[Path.cwd().absolute()/"assets"])

with gr.Blocks() as demo:
    gr.HTML("<img src='/gradio_api/file=assets/logo.png'>")

demo.launch()
```

# Security and File Access

Sharing your Gradio app with others (by hosting it on Spaces, on your own server, or through temporary share links) **exposes** certain files on your machine to the internet.

This guide explains which files are exposed as well as some best practices for making sure the files on your machine are secure.

## The Gradio cache

First, it's important to understand that Gradio copies files to a `cache` directory before returning them to the frontend. This prevents files from being overwritten by one user while they are still needed by another user of your application. For example, if your prediction function returns a video file, then Gradio will move that video to the `cache` after your prediction function runs and returns a URL the frontend can use to show the video. Any file in the `cache` is available via URL to all users of your running application.

Tip: You can customize the location of the cache by setting the `GRADIO_TEMP_DIR` environment variable to an absolute path, such as `/home/usr/scripts/project/temp/`. 

## The files Gradio will move to the cache

Before placing a file in the cache, Gradio will check to see if the file meets at least one of following criteria:

1. It was uploaded by a user.
2. It is in the `allowed_paths` parameter of the `Blocks.launch` method.
3. It is in the current working directory of the python interpreter.
4. It is in the temp directory obtained by `tempfile.gettempdir()`.
5. It was specified by the developer before runtime, e.g. cached examples or default values of components.

Note: files in the current working directory whose name starts with a period (`.`) will not be moved to the cache, since they often contain sensitive information. 

If none of these criteria are met, the prediction function that is returning that file will raise an exception instead of moving the file to cache. Gradio performs this check so that arbitrary files on your machine cannot be accessed.

Tip: If at any time Gradio blocks a file that you would like it to process, add its path to the `allowed_paths` parameter.

## The files Gradio will allow others to access 

In short, these are the files located in the `cache` and any other additional paths **YOU** grant access to via `allowed_paths` or `gr.set_static_paths`.

- **The `allowed_paths` parameter in `launch()`**. This parameter allows you to pass in a list of additional directories or exact filepaths you'd like to allow users to have access to. (By default, this parameter is an empty list).

- **Static files that you explicitly set via the `gr.set_static_paths` function**. This parameter allows you to pass in a list of directories or filenames that will be considered static. This means that they will not be copied to the cache and will be served directly from your computer. This can help save disk space and reduce the time your app takes to launch but be mindful of possible security implications.

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
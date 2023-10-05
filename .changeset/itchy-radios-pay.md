---
"@gradio/app": minor
"@gradio/client": minor
"@gradio/file": minor
"@gradio/fileexplorer": minor
"@gradio/theme": minor
"gradio": minor
"gradio_client": minor
---

highlight:

#### new `FileExplorer` component

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).


---
"@gradio/app": minor
"@gradio/paramviewer": minor
"gradio": minor
---

highlight: 

#### Custom component documentation generator

If your custom component has type hints and docstrings for both parameters and return values, you can now automatically generate a documentation page and README.md with no additional effort. Simply run the following command:

```sh
gradio cc docs
```

This will generate a Gradio app that you can upload to spaces providing rich documentation for potential users. The documentation page includes:

- A live embedded demo, pulled from your demo app.
- A fully working code snippet, pulled from your demo app.
- An API reference for initialising the component, with types, default values and descriptions.
- An explanation of how the component affects the user's predict function inputs and outputs.
- Any additional interfaces or classes that are necessary to understand the API reference.

A README will also be generated detailing the same information but in a format that is optimised for viewing on GitHub or PyPi!

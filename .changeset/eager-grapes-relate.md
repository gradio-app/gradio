---
"@gradio/app": minor
"@gradio/paramviewer": minor
"gradio": minor
---

highlight: 

#### Custom component documentation generator

As long as your custom component has type hints for both parameters and returns values as well as docstrings explaining these values, you can now automatically generate a documentation page and readme with no additional effort. Simple run the following command:

```sh
gradio cc docs
```

This will generate a Gradio app that you can upload to spaces providing rich documentation for ptential users. The documentation page includes:

- A live embedded demo, pulled from your demo app.
- A fully working code snippet, pulled from your demo app.
- An API reference for initialising the component with types, default values and descriptions.
- An explanation of how the component affects the users predict function inputs and outputs.
- Any additional interfaces or classes that are necessary to understand the API reference.

A README will also be generating detailing the same information but in a format that is optimised for viewing on GitHub or PyPi!

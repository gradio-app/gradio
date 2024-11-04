# Custom Components in 5 minutes

Gradio includes the ability for developers to create their own custom components and use them in Gradio apps.You can publish your components as Python packages so that other users can use them as well.

Users will be able to use all of Gradio's existing functions, such as `gr.Blocks`, `gr.Interface`, API usage, themes, etc. with Custom Components. This guide will cover how to get started making custom components.

## Installation

You will need to have:

* Python 3.10+ (<a href="https://www.python.org/downloads/" target="_blank">install here</a>)
* pip 21.3+ (`python -m pip install --upgrade pip`)
* Node.js 20+ (<a href="https://nodejs.dev/en/download/package-manager/" target="_blank">install here</a>)
* npm 9+ (<a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/" target="_blank">install here</a>)
* Gradio 5+ (`pip install --upgrade gradio`)

## The Workflow

The Custom Components workflow consists of 4 steps: create, dev, build, and publish.

1. create: creates a template for you to start developing a custom component.
2. dev: launches a development server with a sample app & hot reloading allowing you to easily develop your custom component
3. build: builds a python package containing to your custom component's Python and JavaScript code -- this makes things official!
4. publish: uploads your package to [PyPi](https://pypi.org/) and/or a sample app to [HuggingFace Spaces](https://hf.co/spaces).

Each of these steps is done via the Custom Component CLI. You can invoke it with `gradio cc` or `gradio component`

Tip: Run `gradio cc --help` to get a help menu of all available commands. There are some commands that are not covered in this guide. You can also append `--help` to any command name to bring up a help page for that command, e.g. `gradio cc create --help`.

## 1. create

Bootstrap a new template by running the following in any working directory:

```bash
gradio cc create MyComponent --template SimpleTextbox
```

Instead of `MyComponent`, give your component any name.

Instead of `SimpleTextbox`, you can use any Gradio component as a template. `SimpleTextbox` is actually a special component that a stripped-down version of the `Textbox` component that makes it particularly useful when creating your first custom component.
Some other components that are good if you are starting out: `SimpleDropdown`, `SimpleImage`, or `File`.

Tip: Run `gradio cc show` to get a list of available component templates.

The `create` command will:

1. Create a directory with your component's name in lowercase with the following structure:
```directory
- backend/ <- The python code for your custom component
- frontend/ <- The javascript code for your custom component
- demo/ <- A sample app using your custom component. Modify this to develop your component!
- pyproject.toml <- Used to build the package and specify package metadata.
```

2. Install the component in development mode

Each of the directories will have the code you need to get started developing!

## 2. dev

Once you have created your new component, you can start a development server by `entering the directory` and running

```bash
gradio cc dev
```

You'll see several lines that are printed to the console.
The most important one is the one that says:

> Frontend Server (Go here): http://localhost:7861/

The port number might be different for you.
Click on that link to launch the demo app in hot reload mode.
Now, you can start making changes to the backend and frontend you'll see the results reflected live in the sample app!
We'll go through a real example in a later guide.

Tip: You don't have to run dev mode from your custom component directory. The first argument to `dev` mode is the path to the directory. By default it uses the current directory.

## 3. build

Once you are satisfied with your custom component's implementation, you can `build` it to use it outside of the development server.

From your component directory, run:

```bash
gradio cc build
```

This will create a `tar.gz` and `.whl` file in a `dist/` subdirectory.
If you or anyone installs that `.whl` file (`pip install <path-to-whl>`) they will be able to use your custom component in any gradio app!

The `build` command will also generate documentation for your custom component. This takes the form of an interactive space and a static `README.md`. You can disable this by passing `--no-generate-docs`. You can read more about the documentation generator in [the dedicated guide](https://gradio.app/guides/documenting-custom-components).

## 4. publish

Right now, your package is only available on a `.whl` file on your computer.
You can share that file with the world with the `publish` command!

Simply run the following command from your component directory:

```bash
gradio cc publish
```

This will guide you through the following process:

1. Upload your distribution files to PyPi. This is optional. If you decide to upload to PyPi, you will need a PyPI username and password. You can get one [here](https://pypi.org/account/register/).
2. Upload a demo of your component to hugging face spaces. This is also optional.


Here is an example of what publishing looks like:

<video autoplay muted loop>
  <source src="https://gradio-builds.s3.amazonaws.com/assets/text_with_attachments_publish.mov" type="video/mp4" />
</video>


## Conclusion

Now that you know the high-level workflow of creating custom components, you can go in depth in the next guides!
After reading the guides, check out this [collection](https://huggingface.co/collections/gradio/custom-components-65497a761c5192d981710b12) of custom components on the HuggingFace Hub so you can learn from other's code.

Tip: If you want to start off from someone else's custom component see this [guide](./frequently-asked-questions#do-i-always-need-to-start-my-component-from-scratch).

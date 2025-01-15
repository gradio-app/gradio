# Frequently Asked Questions

## What do I need to install before using Custom Components?

Before using Custom Components, make sure you have Python 3.10+, Node.js v18+, npm 9+, and Gradio 4.0+ (preferably Gradio 5.0+) installed.

## Are custom components compatible between Gradio 4.0 and 5.0?

Custom components built with Gradio 5.0 should be compatible with Gradio 4.0. If you built your custom component in Gradio 4.0 you will have to rebuild your component to be compatible with Gradio 5.0. Simply follow these steps:
1. Update the `@gradio/preview` package. `cd` into the `frontend` directory and run `npm update`.
2.  Modify the `dependencies` key in `pyproject.toml` to pin the maximum allowed Gradio version at version 5, e.g. `dependencies = ["gradio>=4.0,<6.0"]`.
3. Run the build and publish commands

## What templates can I use to create my custom component?
Run `gradio cc show` to see the list of built-in templates.
You can also start off from other's custom components!
Simply `git clone` their repository and make your modifications.

## What is the development server?
When you run `gradio cc dev`, a development server will load and run a Gradio app of your choosing.
This is like when you run `python <app-file>.py`, however the `gradio` command will hot reload so you can instantly see your changes. 

## The development server didn't work for me 

**1. Check your terminal and browser console**

Make sure there are no syntax errors or other obvious problems in your code. Exceptions triggered from python will be displayed in the terminal. Exceptions from javascript will be displayed in the browser console and/or the terminal.

**2. Are you developing on Windows?**

Chrome on Windows will block the local compiled svelte files for security reasons. We recommend developing your custom component in the windows subsystem for linux (WSL) while the team looks at this issue.

**3. Inspect the window.__GRADIO_CC__ variable**

In the browser console, print the `window.__GRADIO__CC` variable (just type it into the console). If it is an empty object, that means
that the CLI could not find your custom component source code. Typically, this happens when the custom component is installed in a different virtual environment than the one used to run the dev command. Please use the `--python-path` and `gradio-path` CLI arguments to specify the path of the python and gradio executables for the environment your component is installed in. For example, if you are using a virtualenv located at `/Users/mary/venv`, pass in `/Users/mary/bin/python` and `/Users/mary/bin/gradio` respectively.

If the `window.__GRADIO__CC` variable is not empty (see below for an example), then the dev server should be working correctly. 

![](https://gradio-builds.s3.amazonaws.com/demo-files/gradio_CC_DEV.png)

**4. Make sure you are using a virtual environment**
It is highly recommended you use a virtual environment to prevent conflicts with other python dependencies installed in your system.


## Do I always need to start my component from scratch?
No! You can start off from an existing gradio component as a template, see the [five minute guide](./custom-components-in-five-minutes).
You can also start from an existing custom component if you'd like to tweak it further. Once you find the source code of a custom component you like, clone the code to your computer and run `gradio cc install`. Then you can run the development server to make changes.If you run into any issues, contact the author of the component by opening an issue in their repository. The [gallery](https://www.gradio.app/custom-components/gallery) is a good place to look for published components. For example, to start from the [PDF component](https://www.gradio.app/custom-components/gallery?id=freddyaboulton%2Fgradio_pdf), clone the space with `git clone https://huggingface.co/spaces/freddyaboulton/gradio_pdf`, `cd` into the `src` directory, and run `gradio cc install`.


## Do I need to host my custom component on HuggingFace Spaces?
You can develop and build your custom component without hosting or connecting to HuggingFace.
If you would like to share your component with the gradio community, it is recommended to publish your package to PyPi and host a demo on HuggingFace so that anyone can install it or try it out.

## What methods are mandatory for implementing a custom component in Gradio?

You must implement the `preprocess`, `postprocess`, `example_payload`, and `example_value` methods. If your component does not use a data model, you must also define the `api_info`, `flag`, and `read_from_flag` methods. Read more in the [backend guide](./backend).

## What is the purpose of a `data_model` in Gradio custom components?

A `data_model` defines the expected data format for your component, simplifying the component development process and self-documenting your code. It streamlines API usage and example caching.

## Why is it important to use `FileData` for components dealing with file uploads?

Utilizing `FileData` is crucial for components that expect file uploads. It ensures secure file handling, automatic caching, and streamlined client library functionality.

## How can I add event triggers to my custom Gradio component?

You can define event triggers in the `EVENTS` class attribute by listing the desired event names, which automatically adds corresponding methods to your component.

## Can I implement a custom Gradio component without defining a `data_model`?

Yes, it is possible to create custom components without a `data_model`, but you are going to have to manually implement `api_info`, `flag`, and `read_from_flag` methods.

## Are there sample custom components I can learn from?

We have prepared this [collection](https://huggingface.co/collections/gradio/custom-components-65497a761c5192d981710b12) of custom components on the HuggingFace Hub that you can use to get started!

## How can I find custom components created by the Gradio community?

We're working on creating a gallery to make it really easy to discover new custom components.
In the meantime, you can search for HuggingFace Spaces that are tagged as a `gradio-custom-component` [here](https://huggingface.co/search/full-text?q=gradio-custom-component&type=space)
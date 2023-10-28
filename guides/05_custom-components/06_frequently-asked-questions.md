# Frequently Asked Questions

## What do I need to install before using Custom Components?
Before using Custom Components, make sure you have Python 3.8+, Node.js v16.14+, npm 9+, and gradio 4.0 installed.

## What templates can I use to create my custom component?
Run `gradio cc show` to see the list of built-in templates.
You can also start off from other's custom components!
Simply `git clone` their repository and make your modifications.

## What is the development server?
When you run `gradio cc dev`, a development server will load and run a Gradio app of your choosing.
This is like when you run `python <app-file>.py`, except that changes 

## The development server didn't work for me 
Make sure you have your package installed along with any dependencies you have added by running `gradio cc install`.
Make sure there aren't any syntax or import errors in the python or javascript code.

## Do I need to host my custom component on HuggingFace Spaces?
You can develop and build your custom component without hosting or connecting to HuggingFace.
If you would like to share your component with the gradio community, it is recommended to publish your package to PyPi and host a demo on HuggingFace so that anyone can install it or try it out.


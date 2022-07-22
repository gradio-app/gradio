# How to Create a New Component

Docs: component

## Introduction

The purpose of this guide is to illustrate how to add a new component, which you can use in your Gradio applications.

### Prerequisites

Make sure you have followed the [CONTRIBUTING.md](../CONTRIBUTING.md) guide in order to setup your local development environment (both client and server side).

## Step 1 - Create a New Python Class and Import it

The first thing to do is to create a new class within the [components.py](https://github.com/gradio-app/gradio/blob/main/gradio/components.py) file. This Python class should inherit from a list of base components and should be placed within the file in the correct section with respect to the type of component you want to add (e.g. output components or static components).
In general, it is advisable to take an existing component as a reference (e.g. [TextBox](https://github.com/gradio-app/gradio/blob/main/gradio/components.py#L290)), copy its code as a skeleton and then adapt it to the case at hand.

Once defined, it is necessary to import the new class inside [\_\_init\_\_](https://github.com/gradio-app/gradio/blob/main/gradio/__init__.py) module class in order to make it module visible.

### Step 1.1 - Writing Unit Test for Python Class

When developing new components, you should also write a suite of unit tests for it. The tests should be placed in the [gradio/test/test_components.py](https://github.com/gradio-app/gradio/blob/main/test/test_components.py) file. Again, as above, take a cue from the tests of other components (e.g. [Textbox](https://github.com/gradio-app/gradio/blob/main/test/test_components.py)) and add as many unit tests as you think are appropriate to test all the different aspects and functionalities of the new component.

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

## Step 2 - Create a New Svelte Component
The steps to create the frontend part of your new component and map it to its Python code are:

- Create a new UI-side Svelte component and figure out where to place it. The alternatives are: create a package for the new component in the [ui/packages folder](https://github.com/gradio-app/gradio/tree/main/ui/packages), if this is completely different from existing components or add the new component to an existing package, such as to the [form package](https://github.com/gradio-app/gradio/tree/main/ui/packages/form).
- Create a file in the [src folder](https://github.com/gradio-app/gradio/tree/main/ui/packages/form/src) with an appropriate name, note: the name must start with a capital letter. Initially add any text/html to this file so that the component renders something. 
- Export this file inside [index.ts](https://github.com/gradio-app/gradio/blob/main/ui/packages/form/src/index.ts) by doing export { default as FileName } from "./FileName.svelte" 
- Create the real component in [ui/packages/app/components](https://github.com/gradio-app/gradio/tree/main/ui/packages/app/components), copy the folder of another component, rename it and edit the code inside it, keeping the structure.
- Add the mapping for your component in the [directory.ts file](https://github.com/gradio-app/gradio/blob/main/ui/packages/app/src/components/directory.ts). To do this copy and paste the mapping line of any component and edit its text. The key name must be the lowercase version of the actual component name in the Python library. So if you named your component MyAwesomeComponent, the key of the map must be myawesomecomponent.


### Step 2.1 . Writing Unit Test for Svelte Component

When developing new components, you should also write a suite of unit tests for it. The tests should be placed in the new component's folder in a file named MyAwesomeComponent.test.ts. Again, as above, take a cue from the tests of other components (e.g. [Textbox.test.ts](https://github.com/gradio-app/gradio/blob/main/ui/packages/app/src/components/Textbox/Textbox.test.ts)) and add as many unit tests as you think are appropriate to test all the different aspects and functionalities of the new component.


### Step 3 - Create a New Demo

The last step is to create a demo in the [gradio/demo folder](https://github.com/gradio-app/gradio/tree/main/demo), which will use the newly added component. Again, the suggestion is to reference an existing demo, possibly one that has similar input and output to what will be yours. For example, if as input your demo will take an image you can refer to [demo/fake_gan](https://github.com/gradio-app/gradio/blob/main/demo/fake_gan/run.py). Write the code for the demo in a file called run.py, add the necessary requirements and an image showing the application interface. Finally add a gif showing its usage. To test the application:

- run on a terminal `python path/demo/run.py` which starts the backend at the address [http://localhost:7860](http://localhost:7860).
- in another terminal, from the ui folder, run `pnpm dev` to start the frontend at [localhost:3000](localhost:3000) with hot reload functionalities.

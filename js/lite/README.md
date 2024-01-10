# Gradio-Lite: Serverless Gradio Running Entirely in Your Browser


Gradio is a popular Python library for creating interactive machine learning apps. Traditionally, Gradio applications have relied on server-side infrastructure to run, which can be a hurdle for developers who need to host their applications. 

Enter Gradio-lite (`@gradio/lite`): a library that leverages [Pyodide](https://pyodide.org/en/stable/) to bring Gradio directly to your browser. 

## What is `@gradio/lite`?

`@gradio/lite` is a JavaScript library that enables you to run Gradio applications directly within your web browser. It achieves this by utilizing Pyodide, a Python runtime for WebAssembly, which allows Python code to be executed in the browser environment. With `@gradio/lite`, you can **write regular Python code for your Gradio applications**, and they will **run seamlessly in the browser** without the need for server-side infrastructure.

## Getting Started

Let's build a "Hello World" Gradio app in `@gradio/lite`


### 1. Import JS and CSS 

Start by creating a new HTML file, if you don't have one already. The best way to use @gradio/lite currently is via the CDN. Import the JavaScript and CSS corresponding to the `@gradio/lite` package by using the following code:


```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
</html>
```

Note that you should generally use the latest version of `@gradio/lite` that is available. You can see the [versions available here](https://www.jsdelivr.com/package/npm/@gradio/lite?tab=files).

### 2. Create the `<gradio-lite>` tags

Somewhere in the body of your HTML page (wherever you'd like the Gradio app to be rendered), create opening and closing `<gradio-lite>` tags. 

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
		</gradio-lite>
	</body>
</html>
```

Note: you can add the `theme` attribute to the `<gradio-lite>` tag to force the theme to be dark or light (by default, it respects the system theme). E.g.

```html
<gradio-lite theme="dark">
...
</gradio-lite>
```

### 3. Write your Gradio app inside of the tags

Now, write your Gradio app as you would normally, in Python! Keep in mind that since this is Python, whitespace and indentations matter. 

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
		import gradio as gr

		def greet(name):
			return "Hello, " + name + "!"
		
		gr.Interface(greet, "textbox", "textbox").launch()
		</gradio-lite>
	</body>
</html>
```

And that's it! You should now be able to open your HTML page in the browser and see the Gradio app rendered! Note that it may take a little while for the Gradio app to load initially since Pyodide can take a while to install in your browser.

**Note on debugging**: to see any errors in your Gradio-lite application, open the inspector in your web browser. All errors (including Python errors) will be printed there.

## More Examples: Adding Additional Files and Requirements

What if you want to create a Gradio app that spans multiple files? Or that has custom Python requirements? Both are possible with `@gradio/lite`!

### Multiple Files

Adding multiple files within a `@gradio/lite` app is very straightrward: use the `<gradio-file>` tag. You can have as many `<gradio-file>` tags as you want, but each one needs to have a `name` attribute and the entry point to your Gradio app should have the `entrypoint` attribute.

Here's an example:

```html
<gradio-lite>

<gradio-file name="app.py" entrypoint>
import gradio as gr
from utils import add

demo = gr.Interface(fn=add, inputs=["number", "number"], outputs="number")

demo.launch()
</gradio-file>

<gradio-file name="utils.py" >
def add(a, b):
	return a + b
</gradio-file>

</gradio-lite>		

```

### Additional Requirements

If your Gradio app has additional requirements, it is usually possible to [install them in the browser using micropip](https://pyodide.org/en/stable/usage/loading-packages.html#loading-packages). We've created a wrapper to make this paticularly convenient: simply list your requirements in the same syntax as a `requirements.txt` and enclose them with `<gradio-requirements>` tags.

Here, we install `transformers_js_py` to run a text classification model directly in the browser!

```html
<gradio-lite>

<gradio-requirements>
transformers_js_py
</gradio-requirements>

<gradio-file name="app.py" entrypoint>
from transformers_js import import_transformers_js
import gradio as gr

transformers = await import_transformers_js()
pipeline = transformers.pipeline
pipe = await pipeline('sentiment-analysis')

async def classify(text):
	return await pipe(text)

demo = gr.Interface(classify, "textbox", "json")
demo.launch()
</gradio-file>

</gradio-lite>	

```

**Try it out**: You can see this example running in [this Hugging Face Static Space](https://huggingface.co/spaces/abidlabs/gradio-lite-classify), which lets you host static (serverless) web applications for free. Visit the page and you'll be able to run a machine learning model without internet access!

## Benefits of Using `@gradio/lite`

### 1. Serverless Deployment
The primary advantage of @gradio/lite is that it eliminates the need for server infrastructure. This simplifies deployment, reduces server-related costs, and makes it easier to share your Gradio applications with others.

### 2. Low Latency
By running in the browser, @gradio/lite offers low-latency interactions for users. There's no need for data to travel to and from a server, resulting in faster responses and a smoother user experience.

### 3. Privacy and Security
Since all processing occurs within the user's browser, `@gradio/lite` enhances privacy and security. User data remains on their device, providing peace of mind regarding data handling.

### Limitations

* Currently, the biggest limitation in using `@gradio/lite` is that your Gradio apps will generally take more time (usually 5-15 seconds) to load initially in the browser. This is because the browser needs to load the Pyodide runtime before it can render Python code. 

* Not every Python package is supported by Pyodide. While `gradio` and many other popular packages (including `numpy`, `scikit-learn`, and `transformers-js`) can be installed in Pyodide, if your app has many dependencies, its worth checking whether whether the dependencies are included in Pyodide, or can be [installed with `micropip`](https://micropip.pyodide.org/en/v0.2.2/project/api.html#micropip.install).

## Try it out!

You can immediately try out `@gradio/lite` by copying and pasting this code in a local `index.html` file and opening it with your browser:

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
		import gradio as gr

		def greet(name):
			return "Hello, " + name + "!"
		
		gr.Interface(greet, "textbox", "textbox").launch()
		</gradio-lite>
	</body>
</html>
```


We've also created a playground on the Gradio website that allows you to interactively edit code and see the results immediately! 

Playground: https://www.gradio.app/playground



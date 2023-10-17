# Gradio-Lite: Serverless Gradio Running Entirely in Your Browser

Gradio is a popular Python library for creating interactive machine learning apps. Traditionally, Gradio applications have relied on server-side infrastructure to run, which can be a hurdle for developers who need to host their applications. 

Enter Gradio-lite (`@gradio/lite`): a library that leverages [Pyodide](https://pyodide.org/en/stable/) to bring Gradio directly to your browser. In this blog post, we'll explore what `@gradio/lite` is, go over some example code, and discuss the benefits it offers for running Gradio applications.

## What is `@gradio/lite`?

`@gradio/lite` is a JavaScript library that enables you to run Gradio applications directly within your web browser. It achieves this by utilizing Pyodide, a Python runtime for WebAssembly, which allows Python code to be executed in the browser environment. With `@gradio/lite`, you can **write regular Python code for your Gradio applications**, and they will **run seamlessly in the browser** without the need for server-side infrastructure.

## Getting Started

Let's build a "Hello World" Gradio app in `@gradio/lite`


### 1. Import JS and CSS 

Start by creating a new HTML file, if you don't have one already. Importing the Javascript and CSS corresponding to the `@gradio/lite` package by using the following code:


```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.css" />
	</head>
</html>
```

Note that you should generally use the latest version of `@gradio/lite` that is available. You can see the [versions available here](https://www.jsdelivr.com/package/npm/@gradio/lite?tab=files).

### 2. Create the `<gradio-lite>` tags

Somewhere in the body of your HTML page (wherever you'd like the Gradio app to be rendered), create opening and closing `<gradio-lite>` tags. 

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
		</gradio-lite>
	</body>
</html>
```

### 3. Write your Gradio app inside of the tags

Now, write your Gradio app as you would normally, in Python! Keep in mind that since this is Python, whitespace and indentations matter. 

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
		import gradio as gr

		def greet(name):
			return "Hello, " + name + "!"
		
		gr.Interface(greet, "textbox", "textbox")
		</gradio-lite>
	</body>
</html>
```

And that's it! You should now be able to open your HTML page in the browser and see the Gradio app rendered! Note that it may take a little while for the Gradio app to load initially since Pyiodide can take a while to install in your browser. 

## More Examples: Adding Additional Files and Requirements

What if you want to create a Gradio app that spans multiple files? Or that has custom Python requirements? Both are possible with `@gradio/lite`!




## Benefits of Using `@gradio/lite`

### 1. Serverless Deployment
The primary advantage of @gradio/lite is that it eliminates the need for server infrastructure. This simplifies deployment, reduces server-related costs, and makes it easier to share your Gradio applications with others.

### 2. Low Latency
By running in the browser, @gradio/lite offers low-latency interactions for users. There's no need for data to travel to and from a server, resulting in faster responses and a smoother user experience.

### 3. Privacy and Security
Since all processing occurs within the user's browser, `@gradio/lite` enhances privacy and security. User data remains on their device, providing peace of mind regarding data handling.

### Limitations

The biggest limitation in using `@gradio/lite` is that your Gradio apps will generally take more time (usually 5-15 seconds) to load in the browser. This is because the browser needs to load the Pyiodide runtime before it can render Python code. This is 

## Try it out!





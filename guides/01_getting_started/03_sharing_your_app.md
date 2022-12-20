# Sharing Your App

## Sharing Demos

Gradio demos can be easily shared publicly by setting `share=True` in the `launch()` method. Like this:

```python
demo.launch(share=True)
```

This generates a public, shareable link that you can send to anybody! When you send this link, the user on the other side can try out the model in their browser. Because the processing happens on your device (as long as your device stays on!), you don't have to worry about any packaging any dependencies. A share link usually looks something like this:  **XXXXX.gradio.app**. Although the link is served through a Gradio URL, we are only a proxy for your local server, and do not store any data sent through your app.

Keep in mind, however, that these links are publicly accessible, meaning that anyone can use your model for prediction! Therefore, make sure not to expose any sensitive information through the functions you write, or allow any critical changes to occur on your device. If you set `share=False` (the default, except in colab notebooks), only a local link is created, which can be shared by  [port-forwarding](https://www.ssh.com/ssh/tunneling/example)  with specific users. 

<img style="width: 40%" src="/assets/guides/sharing.svg">

Share links expire after 72 hours.

## Hosting on HF Spaces

If you'd like to have a permanent link to your Gradio demo on the internet, use Hugging Face Spaces. [Hugging Face Spaces](http://huggingface.co/spaces/) provides the infrastructure to permanently host your machine learning model for free! 

You can either drag and drop a folder containing your Gradio model and all related files, or you can point Spaces to your Git repository and Spaces will pull the Gradio app from there. See [this guide how to host on Hugging Face Spaces](https://huggingface.co/blog/gradio-spaces) for more information. 

![Hosting Demo](/assets/guides/hf_demo.gif)

## Embedding Hosted Spaces

Once you have hosted your app on Hugging Face Spaces, you may want to embed the demo on a different website, such as your blog or your portfolio. Embedding an interactive demo allows people to try out the machine learning model that you have built, without needing to download or install anything — right in their browser! The best part is that you can embed interative demos even in static websites, such as GitHub pages.

There are two ways to embed your Gradio demos, hosted on Hugging Face Spaces. You can find quick links to both options directly on the Space page, in the "Embed this Space" dropdown option:

![Embed this Space dropdown option](/assets/guides/embed_this_space.png)

### Embedding with Web Components

Using web components is faster then iframes, and will automatically adjust to other content on your site. To embed with Web Components:

1. Import the gradio JS library into into your site by adding the script below in your site (replace {GRADIO_VERSION} in the URL with the library version of Gradio you are using). 

    ```html
&lt;script type="module"
src="https://gradio.s3-us-west-2.amazonaws.com/{GRADIO_VERSION}/gradio.js">
&lt;/script>
    ```

2. Add 
    ```html
&lt;gradio-app src="https://$your_space_host.hf.space">&lt;/gradio-app>
    ```
element where you want to place the app. Set the `src=` attribute to your Space's embed URL, which you can find in the Embed this Space button. For example:

    ```html
&lt;gradio-app src="https://abidlabs-pytorch-image-classifier.hf.space">&lt;/gradio-app>
    ```

<script>
fetch("https://pypi.org/pypi/gradio/json"
).then(r => r.json()
).then(obj => {
    let v = obj.info.version;
    content = document.querySelector('.prose');
    content.innerHTML = content.innerHTML.replaceAll("{GRADIO_VERSION}", v);
});
</script>

### Embedding with IFrames

To embed with IFrames instead, simply add this element:

```html
&lt;iframe src="https://$your_space_host.hf.space">&lt;/iframe>
```

For example: 

```html
&lt;iframe src="https://abidlabs-pytorch-image-classifier.hf.space">&lt;/iframe>
```

## API Page

$demo_hello_world

See the "view api" link in footer of the app above? This is a page that documents the REST API that users can use to query the `Interface` function. `Blocks` apps can also generate an API page, though the API has to be explicitly named for each event listener, such as

```python
btn.click(add, [num1, num2], output, api_name="addition")
```

This will document the endpoint `/api/addition/` to the automatically generated API page. 

## Authentication

You may wish to put an authentication page in front of your app to limit who can open your app. With the `auth=` keyword argument in the `launch()` method, you can provide a tuple with a username and password, or a  list of acceptable username/password tuples;  Here's an example that provides password-based authentication for a single user named "admin":

```python
demo.launch(auth=("admin", "pass1234"))
```

For more complex authentication handling, you can even pass a function that takes a username and password as arguments, and returns True to allow authentication, False otherwise. This can be used for, among other things, making requests to 3rd-party authentication services.

Here's an example of a function that accepts any login where the username and password are the same:

```python
def same_auth(username, password):
    return username == password
demo.launch(auth=same_auth)
```

## Accessing the Network Request Directly

When a user makes a prediction to your app, you may need the underlying network request, in order to get the request headers (e.g. for advanced authentication), log the client's IP address, or for other reasons. Gradio supports this in a similar manner to FastAPI: simply add a function parameter whose type hint is `gr.Request` and Gradio will pass in the network request as that parameter. Here is an example:

```python
import gradio as gr

def echo(name, request: gr.Request):
    if request:
        print("Request headers dictionary:", request.headers)
        print("IP address:", request.client.host)
    return name

io = gr.Interface(echo, "textbox", "textbox").launch()
```

Note: if your function is called directly instead of through the UI (this happens, for 
example, when examples are cached), then `request` will be `None`. You should handle
this case explicitly to ensure that your app does not throw any errors. That is why
we have the explicit check `if request`.

## Mounting Within Another FastAPI App

In some cases, you might have an existing FastAPI app, and you'd like to add a path for a Gradio demo.
You can easily do this with `gradio.mount_gradio_app()`.

Here's a complete example:

$code_custom_path

Note that this approach also allows you run your Gradio apps on custom paths (`http://localhost:8000/gradio` in the example above).

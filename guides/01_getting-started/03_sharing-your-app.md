# Sharing Your App

How to share your Gradio app: 

1. [Sharing demos with the share parameter](#sharing-demos)
2. [Hosting on HF Spaces](#hosting-on-hf-spaces)
3. [Embedding hosted spaces](#embedding-hosted-spaces)
4. [Embedding with web components](#embedding-with-web-components)
5. [Using the API page](#api-page)
6. [Adding authentication to the page](#authentication)
7. [Accessing Network Requests](#accessing-the-network-request-directly)
8. [Mounting within FastAPI](#mounting-within-another-fastapi-app)
9. [Security](#security-and-file-access)

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

<video autoplay muted loop>
  <source src="/assets/guides/hf_demo.mp4" type="video/mp4" />
</video>

## Embedding Hosted Spaces

Once you have hosted your app on Hugging Face Spaces (or on your own server), you may want to embed the demo on a different website, such as your blog or your portfolio. Embedding an interactive demo allows people to try out the machine learning model that you have built, without needing to download or install anything — right in their browser! The best part is that you can embed interactive demos even in static websites, such as GitHub pages.

There are two ways to embed your Gradio demos. You can find quick links to both options directly on the Hugging Face Space page, in the "Embed this Space" dropdown option:

![Embed this Space dropdown option](/assets/guides/embed_this_space.png)

### Embedding with Web Components

Web components typically offer a better experience to users than IFrames. Web components load lazily, meaning that they won't slow down the loading time of your website, and they automatically adjust their height based on the size of the Gradio app. 

To embed with Web Components:

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
element where you want to place the app. Set the `src=` attribute to your Space's embed URL, which you can find in the "Embed this Space" button. For example:

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

You can see examples of how web components look <a href="https://www.gradio.app">on the Gradio landing page</a>.

You can also customize the appearance and behavior of your web component with attributes that you pass into the `<gradio-app>` tag:

* `src`: as we've seen, the `src` attributes links to the URL of the hosted Gradio demo that you would like to embed
* `space`: an optional shorthand if your Gradio demo is hosted on Hugging Face Space. Accepts a `username/space_name` instead of a full URL. Example: `gradio/Echocardiogram-Segmentation`. If this attribute attribute is provided, then `src` does not need to be provided.
* `control_page_title`: a boolean designating whether the html title of the page should be set to the title of the Gradio app (by default `"false"`)
* `initial_height`: the initial height of the web component while it is loading the Gradio app, (by default `"300px"`). Note that the final height is set based on the size of the Gradio app.
* `container`: whether to show the border frame and information about where the Space is hosted (by default `"true"`)
* `info`: whether to show just the information about where the Space is hosted underneath the embedded app (by default `"true"`)
* `autoscroll`: whether to autoscroll to the output when prediction has finished (by default `"false"`)
* `eager`: whether to load the Gradio app as soon as the page loads (by default `"false"`)
* `theme_mode`: whether to use the `dark`, `light`, or default `system` theme mode (by default `"system"`)

Here's an example of how to use these attributes to create a Gradio app that does not lazy load and has an initial height of 0px. 

```html
&lt;gradio-app space="gradio/Echocardiogram-Segmentation" eager="true" 
initial_height="0px">&lt;/gradio-app>
```

_Note: While Gradio's CSS will never impact the embedding page, the embedding page can affect the style of the embedded Gradio app. Make sure that any CSS in the parent page isn't so general that it could also apply to the embedded Gradio app and cause the styling to break. Element selectors such as `header { ... }` and `footer { ... }` will be the most likely to cause issues._

### Embedding with IFrames

To embed with IFrames instead (if you cannot add javascript to your website, for example), add this element:

```html
&lt;iframe src="https://$your_space_host.hf.space">&lt;/iframe>
```

Again, you can find the `src=` attribute to your Space's embed URL, which you can find in the "Embed this Space" button.

Note: if you use IFrames, you'll probably want to add a fixed `height` attribute and set `style="border:0;"` to remove the boreder. In addition, if your app requires permissions such as access to the webcam or the microphone, you'll need to provide that as well using the `allow` attribute.

## API Page

$demo_hello_world

If you click and open the space above, you'll see a "Use via API" link in the footer of the app. 

![Use via API](/assets/guides/use_via_api.png)

This is a page that documents the REST API that users can use to query the `Interface` function. `Blocks` apps can also generate an API page, though the API has to be explicitly named for each event listener, such as

```python
btn.click(add, [num1, num2], output, api_name="addition")
```

This will document the endpoint `/api/addition/` to the automatically generated API page. 

*Note*: For Gradio apps in which [queueing is enabled](https://gradio.app/key-features#queuing), users can bypass the queue if they make a POST request to your API endpoint. To disable this behavior, set `api_open=False` in the `queue()` method.

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

For authentication to work properly, third party cookies must be enabled in your browser.
This is not the case by default for Safari, Chrome Incognito Mode.

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

## Security and File Access

Sharing your Gradio app with others (by hosting it on Spaces, on your own server, or through temporary share links) **exposes** certain files on the host machine to users of your Gradio app. This is done so that Gradio apps are able to display output files created by Gradio or created by your prediction function.

In particular, Gradio apps grant users access to three kinds of files:

* Files in the same folder (or a subdirectory) of where the Gradio script is launched from. For example, if the path to your gradio scripts is `/home/usr/scripts/project/app.py` and you launch it from `/home/usr/scripts/project/`, then users of your shared Gradio app will be able to access any files inside `/home/usr/scripts/project/`. This is needed so that you can easily reference these files in your Gradio app.

* Temporary files created by Gradio. These are files that are created by Gradio as part of running your prediction function. For example, if your prediction function returns a video file, then Gradio will save that video to a temporary file and then send the path to the temporary file to the front end. You can customize the location of temporary files created by Gradio by setting the environment variable GRADIO_TEMP_DIR to an absolute path, such as `/home/usr/scripts/project/temp/`.

* Files that you explicitly allow via the `allowed_paths` parameter in `launch()`. This parameter  allows you to pass in a list of additional directories or exact filepaths you'd like to allow users to have access to. (By default, this parameter is an empty list).

Users should NOT be able to access other arbitrary paths on the host. Furthermore, as a security measure, you can also **block** specific files or directories from being able to be accessed by users. To do this, pass in a list of additional directories or exact filepaths to the `blocked_paths` parameter in `launch()`. This parameter takes precedence over the files that Gradio exposes by default or by the `allowed_paths`.

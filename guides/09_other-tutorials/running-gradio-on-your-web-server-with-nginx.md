# Running a Gradio App on your Web Server with Nginx

Tags: DEPLOYMENT, WEB SERVER, NGINX

## Introduction

Gradio is a Python library that allows you to quickly create customizable web apps for your machine learning models and data processing pipelines. Gradio apps can be deployed on [Hugging Face Spaces](https://hf.space) for free.

In some cases though, you might want to deploy a Gradio app on your own web server. You might already be using [Nginx](https://www.nginx.com/), a highly performant web server, to serve your website (say `https://www.example.com`), and you want to attach Gradio to a specific subpath on your website (e.g. `https://www.example.com/gradio-demo`).

In this Guide, we will guide you through the process of running a Gradio app behind Nginx on your own web server to achieve this.

**Prerequisites**

1. A Linux web server with [Nginx installed](https://www.nginx.com/blog/setting-up-nginx/) and [Gradio installed](/quickstart)
2. A working Gradio app saved as a python file on your web server

## Editing your Nginx configuration file

1. Start by editing the Nginx configuration file on your web server. By default, this is located at: `/etc/nginx/nginx.conf`

In the `http` block, add the following line to include server block configurations from a separate file:

```bash
include /etc/nginx/sites-enabled/*;
```

2. Create a new file in the `/etc/nginx/sites-available` directory (create the directory if it does not already exist), using a filename that represents your app, for example: `sudo nano /etc/nginx/sites-available/my_gradio_app`

3. Paste the following into your file editor:

```bash
server {
    listen 80;
    server_name example.com www.example.com;  # Change this to your domain name

    location /gradio-demo/ {  # Change this if you'd like to server your Gradio app on a different path
        proxy_pass http://127.0.0.1:7860/; # Change this if your Gradio app will be running on a different port
        proxy_buffering off;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


Tip: Setting the `X-Forwarded-Host` and `X-Forwarded-Proto` headers is important as Gradio uses these, in conjunction with the `root_path` parameter discussed below, to construct the public URL that your app is being served on. Gradio uses the public URL to fetch various static assets. If these headers are not set, your Gradio app may load in a broken state.

*Note:* The `$host` variable does not include the host port. If you are serving your Gradio application on a raw IP address and port, you should use the `$http_host` variable instead, in these lines:

```bash
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
```

## Run your Gradio app on your web server

1. Before you launch your Gradio app, you'll need to set the `root_path` to be the same as the subpath that you specified in your nginx configuration. This is necessary for Gradio to run on any subpath besides the root of the domain.

    *Note:* Instead of a subpath, you can also provide a complete URL for `root_path` (beginning with `http` or `https`) in which case the `root_path` is treated as an absolute URL instead of a URL suffix (but in this case, you'll need to update the `root_path` if the domain changes).

Here's a simple example of a Gradio app with a custom `root_path` corresponding to the Nginx configuration above.

```python
import gradio as gr
import time

def test(x):
time.sleep(4)
return x

gr.Interface(test, "textbox", "textbox").queue().launch(root_path="/gradio-demo")
```

2. Start a `tmux` session by typing `tmux` and pressing enter (optional)

It's recommended that you run your Gradio app in a `tmux` session so that you can keep it running in the background easily

3. Then, start your Gradio app. Simply type in `python` followed by the name of your Gradio python file. By default, your app will run on `localhost:7860`, but if it starts on a different port, you will need to update the nginx configuration file above.

## Restart Nginx

1. If you are in a tmux session, exit by typing CTRL+B (or CMD+B), followed by the "D" key.

2. Finally, restart nginx by running `sudo systemctl restart nginx`.

And that's it! If you visit `https://example.com/gradio-demo` on your browser, you should see your Gradio app running there


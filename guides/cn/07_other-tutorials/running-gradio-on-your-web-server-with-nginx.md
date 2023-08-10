# 在 Web 服务器上使用 Nginx 运行 Gradio 应用

标签：部署，Web 服务器，Nginx

## 介绍

Gradio 是一个 Python 库，允许您快速创建可定制的 Web 应用程序，用于机器学习模型和数据处理流水线。Gradio 应用可以免费部署在[Hugging Face Spaces](https://hf.space)上。

然而，在某些情况下，您可能希望在自己的 Web 服务器上部署 Gradio 应用。您可能已经在使用[Nginx](https://www.nginx.com/)作为高性能的 Web 服务器来提供您的网站（例如 `https://www.example.com`），并且您希望将 Gradio 附加到网站的特定子路径上（例如 `https://www.example.com/gradio-demo`）。

在本指南中，我们将指导您在自己的 Web 服务器上的 Nginx 后面运行 Gradio 应用的过程，以实现此目的。

**先决条件**

1. 安装了 [Nginx 的 Linux Web 服务器](https://www.nginx.com/blog/setting-up-nginx/) 和 [Gradio](/quickstart) 库

2. 在 Web 服务器上将 Gradio 应用保存为 Python 文件

## 编辑 Nginx 配置文件

1. 首先编辑 Web 服务器上的 Nginx 配置文件。默认情况下，文件位于：`/etc/nginx/nginx.conf`

在 `http` 块中，添加以下行以从单独的文件包含服务器块配置：

```bash
include /etc/nginx/sites-enabled/*;
```

2. 在 `/etc/nginx/sites-available` 目录中创建一个新文件（如果目录不存在则创建），文件名表示您的应用，例如：`sudo nano /etc/nginx/sites-available/my_gradio_app`

3. 将以下内容粘贴到文件编辑器中：

```bash
server {
    listen 80;
    server_name example.com www.example.com;  # 将此项更改为您的域名

    location /gradio-demo/ {  # 如果要在不同路径上提供Gradio应用，请更改此项
        proxy_pass http://127.0.0.1:7860/; # 如果您的Gradio应用将在不同端口上运行，请更改此项
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 在 Web 服务器上运行 Gradio 应用

1. 在启动 Gradio 应用之前，您需要将 `root_path` 设置为与 Nginx 配置中指定的子路径相同。这对于 Gradio 在除域的根路径之外的任何子路径上运行是必要的。

以下是一个具有自定义 `root_path` 的简单示例 Gradio 应用：

```python
import gradio as gr
import time

def test(x):
    time.sleep(4)
    return x

gr.Interface(test, "textbox", "textbox").queue().launch(root_path="/gradio-demo")
```

2. 通过键入 `tmux` 并按回车键（可选）启动 `tmux` 会话

推荐在 `tmux` 会话中运行 Gradio 应用，以便可以轻松地在后台运行它

3. 然后，启动您的 Gradio 应用。只需输入 `python`，后跟您的 Gradio Python 文件的名称。默认情况下，应用将在 `localhost:7860` 上运行，但如果它在其他端口上启动，您需要更新上面的 Nginx 配置文件。

## 重新启动 Nginx

1. 如果您在 tmux 会话中，请通过键入 CTRL + B（或 CMD + B），然后按下 "D" 键来退出。

2. 最后，通过运行 `sudo systemctl restart nginx` 重新启动 nginx。

就是这样！如果您在浏览器中访问 `https://example.com/gradio-demo`，您应该能够看到您的 Gradio 应用在那里运行。

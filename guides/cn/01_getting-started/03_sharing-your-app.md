# 分享您的应用

如何分享您的 Gradio 应用：

1. [使用 share 参数分享演示](#sharing-demos)
2. [在 HF Spaces 上托管](#hosting-on-hf-spaces)
3. [嵌入托管的空间](#embedding-hosted-spaces)
4. [使用 Web 组件嵌入](#embedding-with-web-components)
5. [使用 API 页面](#api-page)
6. [在页面上添加身份验证](#authentication)
7. [访问网络请求](#accessing-the-network-request-directly)
8. [在 FastAPI 中挂载](#mounting-within-another-fastapi-app)
9. [安全性](#security-and-file-access)

## 分享演示

通过在 `launch()` 方法中设置 `share=True`，可以轻松公开分享 Gradio 演示。就像这样：

```python
demo.launch(share=True)
```

这将生成一个公开的可分享链接，您可以将其发送给任何人！当您发送此链接时，对方用户可以在其浏览器中尝试模型。因为处理过程发生在您的设备上（只要您的设备保持开启！），您不必担心任何打包依赖项的问题。一个分享链接通常看起来像这样：**XXXXX.gradio.app**。尽管链接是通过 Gradio URL 提供的，但我们只是您本地服务器的代理，并不会存储通过您的应用发送的任何数据。

但请记住，这些链接可以被公开访问，这意味着任何人都可以使用您的模型进行预测！因此，请确保不要通过您编写的函数公开任何敏感信息，也不要允许在您的设备上进行任何关键更改。如果您设置 `share=False`（默认值，在 colab 笔记本中除外），则只创建一个本地链接，可以通过[端口转发](https://www.ssh.com/ssh/tunneling/example)与特定用户共享。

<img style="width: 40%" src="/assets/guides/sharing.svg">

分享链接在 72 小时后过期。

## 在 HF Spaces 上托管

如果您想在互联网上获得您的 Gradio 演示的永久链接，请使用 Hugging Face Spaces。 [Hugging Face Spaces](http://huggingface.co/spaces/) 提供了免费托管您的机器学习模型的基础设施！

在您创建了一个免费的 Hugging Face 账户后，有三种方法可以将您的 Gradio 应用部署到 Hugging Face Spaces：

1. 从终端：在应用目录中运行 `gradio deploy`。CLI 将收集一些基本元数据，然后启动您的应用。要更新您的空间，可以重新运行此命令或启用 Github Actions 选项，在 `git push` 时自动更新 Spaces。
2. 从浏览器：将包含 Gradio 模型和所有相关文件的文件夹拖放到 [此处](https://huggingface.co/new-space)。
3. 将 Spaces 与您的 Git 存储库连接，Spaces 将从那里拉取 Gradio 应用。有关更多信息，请参阅 [此指南如何在 Hugging Face Spaces 上托管](https://huggingface.co/blog/gradio-spaces)。

<video autoplay muted loop>
  <source src="/assets/guides/hf_demo.mp4" type="video/mp4" />
</video>

## 嵌入托管的空间

一旦您将应用托管在 Hugging Face Spaces（或您自己的服务器上），您可能希望将演示嵌入到不同的网站上，例如您的博客或个人作品集。嵌入交互式演示使人们可以在他们的浏览器中尝试您构建的机器学习模型，而无需下载或安装任何内容！最好的部分是，您甚至可以将交互式演示嵌入到静态网站中，例如 GitHub 页面。

有两种方法可以嵌入您的 Gradio 演示。您可以在 Hugging Face Space 页面的“嵌入此空间”下拉选项中直接找到这两个选项的快速链接：

![嵌入此空间下拉选项](/assets/guides/embed_this_space.png)

### 使用 Web 组件嵌入

与 IFrames 相比，Web 组件通常为用户提供更好的体验。Web 组件进行延迟加载，这意味着它们不会减慢您网站的加载时间，并且它们会根据 Gradio 应用的大小自动调整其高度。

要使用 Web 组件嵌入：

1.  通过在您的网站中添加以下脚本来导入 gradio JS 库（在 URL 中替换{GRADIO_VERSION}为您使用的 Gradio 库的版本）。

        ```html

    &lt;script type="module"
    src="https://gradio.s3-us-west-2.amazonaws.com/{GRADIO_VERSION}/gradio.js">
    &lt;/script>
    ```

2.  在您想放置应用的位置添加
    `html
&lt;gradio-app src="https://$your_space_host.hf.space">&lt;/gradio-app>
    `
    元素。将 `src=` 属性设置为您的 Space 的嵌入 URL，您可以在“嵌入此空间”按钮中找到。例如：

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

您可以在 <a href="https://www.gradio.app">Gradio 首页 </a> 上查看 Web 组件的示例。

您还可以使用传递给 `<gradio-app>` 标签的属性来自定义 Web 组件的外观和行为：

- `src`：如前所述，`src` 属性链接到您想要嵌入的托管 Gradio 演示的 URL
- `space`：一个可选的缩写，如果您的 Gradio 演示托管在 Hugging Face Space 上。接受 `username/space_name` 而不是完整的 URL。示例：`gradio/Echocardiogram-Segmentation`。如果提供了此属性，则不需要提供 `src`。
- `control_page_title`：一个布尔值，指定是否将 html 标题设置为 Gradio 应用的标题（默认为 `"false"`）
- `initial_height`：加载 Gradio 应用时 Web 组件的初始高度（默认为 `"300px"`）。请注意，最终高度是根据 Gradio 应用的大小设置的。
- `container`：是否显示边框框架和有关 Space 托管位置的信息（默认为 `"true"`）
- `info`：是否仅显示有关 Space 托管位置的信息在嵌入的应用程序下方（默认为 `"true"`）
- `autoscroll`：在预测完成后是否自动滚动到输出（默认为 `"false"`）
- `eager`：在页面加载时是否立即加载 Gradio 应用（默认为 `"false"`）
- `theme_mode`：是否使用 `dark`，`light` 或默认的 `system` 主题模式（默认为 `"system"`）

以下是使用这些属性创建一个懒加载且初始高度为 0px 的 Gradio 应用的示例。

```html
&lt;gradio-app space="gradio/Echocardiogram-Segmentation" eager="true"
initial_height="0px">&lt;/gradio-app>
```

_ 注意：Gradio 的 CSS 永远不会影响嵌入页面，但嵌入页面可以影响嵌入的 Gradio 应用的样式。请确保父页面中的任何 CSS 不是如此通用，以至于它也可能适用于嵌入的 Gradio 应用并导致样式破裂。例如，元素选择器如 `header { ... }` 和 `footer { ... }` 最可能引起问题。_

### 使用 IFrames 嵌入

如果您无法向网站添加 javascript（例如），则可以改为使用 IFrames 进行嵌入，请添加以下元素：

```html
&lt;iframe src="https://$your_space_host.hf.space">&lt;/iframe>
```

同样，您可以在“嵌入此空间”按钮中找到您的 Space 的嵌入 URL 的 `src=` 属性。

注意：如果您使用 IFrames，您可能希望添加一个固定的 `height` 属性，并设置 `style="border:0;"` 以去除边框。此外，如果您的应用程序需要诸如访问摄像头或麦克风之类的权限，您还需要使用 `allow` 属性提供它们。

## API 页面

$demo_hello_world

如果您点击并打开上面的空间，您会在应用的页脚看到一个“通过 API 使用”链接。

![通过 API 使用](/assets/guides/use_via_api.png)

这是一个文档页面，记录了用户可以使用的 REST API 来查询“Interface”函数。`Blocks` 应用程序也可以生成 API 页面，但必须为每个事件监听器显式命名 API，例如：

```python
btn.click(add, [num1, num2], output, api_name="addition")
```

这将记录自动生成的 API 页面的端点 `/api/addition/`。

_注意_：对于启用了[队列功能](https://gradio.app/key-features#queuing)的 Gradio 应用程序，如果用户向您的 API 端点发出 POST 请求，他们可以绕过队列。要禁用此行为，请在 `queue()` 方法中设置 `api_open=False`。

## 鉴权

您可能希望在您的应用程序前面放置一个鉴权页面，以限制谁可以打开您的应用程序。使用 `launch()` 方法中的 `auth=` 关键字参数，您可以提供一个包含用户名和密码的元组，或者一个可接受的用户名 / 密码元组列表；以下是一个为单个名为“admin”的用户提供基于密码的身份验证的示例：

```python
demo.launch(auth=("admin", "pass1234"))
```

对于更复杂的身份验证处理，您甚至可以传递一个以用户名和密码作为参数的函数，并返回 True 以允许身份验证，否则返回 False。这可用于访问第三方身份验证服务等其他功能。

以下是一个接受任何用户名和密码相同的登录的函数示例：

```python
def same_auth(username, password):
    return username == password
demo.launch(auth=same_auth)
```

为了使身份验证正常工作，必须在浏览器中启用第三方 Cookie。
默认情况下，Safari、Chrome 隐私模式不会启用此功能。

## 直接访问网络请求

当用户向您的应用程序进行预测时，您可能需要底层的网络请求，以获取请求标头（例如用于高级身份验证）、记录客户端的 IP 地址或其他原因。Gradio 支持与 FastAPI 类似的方式：只需添加一个类型提示为 `gr.Request` 的函数参数，Gradio 将将网络请求作为该参数传递进来。以下是一个示例：

```python
import gradio as gr

def echo(name, request: gr.Request):
    if request:
        print("Request headers dictionary:", request.headers)
        print("IP address:", request.client.host)
    return name

io = gr.Interface(echo, "textbox", "textbox").launch()
```

注意：如果直接调用函数而不是通过 UI（例如在缓存示例时），则 `request` 将为 `None`。您应该明确处理此情况，以确保您的应用程序不会抛出任何错误。这就是为什么我们有显式检查 `if request`。

## 嵌入到另一个 FastAPI 应用程序中

在某些情况下，您可能已经有一个现有的 FastAPI 应用程序，并且您想要为 Gradio 演示添加一个路径。
您可以使用 `gradio.mount_gradio_app()` 来轻松实现此目的。

以下是一个完整的示例：

$code_custom_path

请注意，此方法还允许您在自定义路径上运行 Gradio 应用程序（例如上面的 `http://localhost:8000/gradio`）。

## 安全性和文件访问

与他人共享 Gradio 应用程序（通过 Spaces、您自己的服务器或临时共享链接进行托管）将主机机器上的某些文件**暴露**给您的 Gradio 应用程序的用户。

特别是，Gradio 应用程序允许用户访问以下三类文件：

- **与 Gradio 脚本所在目录（或子目录）中的文件相同。** 例如，如果您的 Gradio 脚本的路径是 `/home/usr/scripts/project/app.py`，并且您从 `/home/usr/scripts/project/` 启动它，则共享 Gradio 应用程序的用户将能够访问 `/home/usr/scripts/project/` 中的任何文件。这样做是为了您可以在 Gradio 应用程序中轻松引用这些文件（例如应用程序的“示例”）。

- **Gradio 创建的临时文件。** 这些是由 Gradio 作为运行您的预测函数的一部分创建的文件。例如，如果您的预测函数返回一个视频文件，则 Gradio 将该视频保存到临时文件中，然后将临时文件的路径发送到前端。您可以通过设置环境变量 `GRADIO_TEMP_DIR` 为绝对路径（例如 `/home/usr/scripts/project/temp/`）来自定义 Gradio 创建的临时文件的位置。

- **通过 `launch()` 中的 `allowed_paths` 参数允许的文件。** 此参数允许您传递一个包含其他目录或确切文件路径的列表，以允许用户访问它们。（默认情况下，此参数为空列表）。

Gradio**不允许**访问以下内容：

- **点文件**（其名称以 '.' 开头的任何文件）或其名称以 '.' 开头的任何目录中的任何文件。

- **通过 `launch()` 中的 `blocked_paths` 参数允许的文件。** 您可以将其他目录或确切文件路径的列表传递给 `launch()` 中的 `blocked_paths` 参数。此参数优先于 Gradio 默认或 `allowed_paths` 允许的文件。

- **主机机器上的任何其他路径**。用户不应能够访问主机上的其他任意路径。

请确保您正在运行最新版本的 `gradio`，以使这些安全设置生效。

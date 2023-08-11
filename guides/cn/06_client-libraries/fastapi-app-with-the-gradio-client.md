# 使用Gradio Python客户端构建FastAPI应用

Tags: CLIENT, API, WEB APP

在本博客文章中，我们将演示如何使用 `gradio_client` [Python库](getting-started-with-the-python-client/) 来以编程方式创建Gradio应用的请求，通过创建一个示例FastAPI Web应用。我们将构建的 Web 应用名为“Acappellify”，它允许用户上传视频文件作为输入，并返回一个没有伴奏音乐的视频版本。它还会显示生成的视频库。

**先决条件**

在开始之前，请确保您正在运行Python 3.9或更高版本，并已安装以下库：

- `gradio_client`
- `fastapi`
- `uvicorn`

您可以使用`pip`安装这些库：

```bash
$ pip install gradio_client fastapi uvicorn
```

您还需要安装ffmpeg。您可以通过在终端中运行以下命令来检查您是否已安装ffmpeg：

```bash
$ ffmpeg version
```

否则，通过按照这些说明安装ffmpeg [链接](https://www.hostinger.com/tutorials/how-to-install-ffmpeg)。

## 步骤1：编写视频处理函数

让我们从似乎最复杂的部分开始--使用机器学习从视频中去除音乐。

幸运的是，我们有一个现有的Space可以简化这个过程：[https://huggingface.co/spaces/abidlabs/music-separation](https://huggingface.co/spaces/abidlabs/music-separation)。该空间接受一个音频文件，并生成两个独立的音频文件：一个带有伴奏音乐，一个带有原始剪辑中的其他所有声音。非常适合我们的客户端使用！

打开一个新的Python文件，比如`main.py`，并通过从`gradio_client`导入 `Client` 类，并将其连接到该Space：

```py
from gradio_client import Client

client = Client("abidlabs/music-separation")

def acapellify(audio_path):
    result = client.predict(audio_path, api_name="/predict")
    return result[0]
```

所需的代码仅如上所示--请注意，API端点返回一个包含两个音频文件（一个没有音乐，一个只有音乐）的列表，因此我们只返回列表的第一个元素。

---

**注意**：由于这是一个公共Space，可能会有其他用户同时使用该Space，这可能导致速度较慢。您可以使用自己的[Hugging Face token](https://huggingface.co/settings/tokens)复制此Space，创建一个只有您自己访问权限的私有Space，并绕过排队。要做到这一点，只需用下面的代码替换上面的前两行：

```py
from gradio_client import Client

client = Client.duplicate("abidlabs/music-separation", hf_token=YOUR_HF_TOKEN)
```

其他的代码保持不变！

---

现在，当然，我们正在处理视频文件，所以我们首先需要从视频文件中提取音频。为此，我们将使用`ffmpeg`库，它在处理音频和视频文件时做了很多艰巨的工作。使用`ffmpeg`的最常见方法是通过命令行，在Python的`subprocess`模块中调用它：

我们的视频处理工作流包含三个步骤：

1. 首先，我们从视频文件路径开始，并使用`ffmpeg`提取音频。
2. 然后，我们通过上面的`acapellify()`函数传入音频文件。
3. 最后，我们将新音频与原始视频合并，生成最终的Acapellify视频。

以下是Python中的完整代码，您可以将其添加到`main.py`文件中：

```python
import subprocess

def process_video(video_path):
    old_audio = os.path.basename(video_path).split(".")[0] + ".m4a"
    subprocess.run(['ffmpeg', '-y', '-i', video_path, '-vn', '-acodec', 'copy', old_audio])

    new_audio = acapellify(old_audio)

    new_video = f"acap_{video_path}"
    subprocess.call(['ffmpeg', '-y', '-i', video_path, '-i', new_audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', f"static/{new_video}"])
    return new_video
```

如果您想了解所有命令行参数的详细信息，请阅读[ffmpeg文档](https://ffmpeg.org/ffmpeg.html)，因为它们超出了本教程的范围。

## 步骤2: 创建一个FastAPI应用（后端路由）

接下来，我们将创建一个简单的FastAPI应用程序。如果您以前没有使用过FastAPI，请查看[优秀的FastAPI文档](https://fastapi.tiangolo.com/)。否则，下面的基本模板将看起来很熟悉，我们将其添加到`main.py`中：

```python
import os
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

videos = []

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "home.html", {"request": request, "videos": videos})

@app.post("/uploadvideo/")
async def upload_video(video: UploadFile = File(...)):
    new_video = process_video(video.filename)
    videos.append(new_video)
    return RedirectResponse(url='/', status_code=303)
```

在这个示例中，FastAPI应用程序有两个路由：`/` 和 `/uploadvideo/`。

`/` 路由返回一个显示所有上传视频的画廊的HTML模板。

`/uploadvideo/` 路由接受一个带有`UploadFile`对象的 `POST` 请求，表示上传的视频文件。视频文件通过`process_video()`方法进行 "acapellify"，并将输出视频存储在一个列表中，该列表在内存中存储了所有上传的视频。

请注意，这只是一个非常基本的示例，如果这是一个发布应用程序，则需要添加更多逻辑来处理文件存储、用户身份验证和安全性考虑等。

## 步骤3：创建一个FastAPI应用（前端模板）

最后，我们创建Web应用的前端。首先，在与`main.py`相同的目录下创建一个名为`templates`的文件夹。然后，在`templates`文件夹中创建一个名为`home.html`的模板。下面是最终的文件结构：

```csv
├── main.py
├── templates
│   └── home.html
```

将以下内容写入`home.html`文件中：

```html
&lt;!DOCTYPE html> &lt;html> &lt;head> &lt;title> 视频库 &lt;/title> &lt;style>
body { font-family: sans-serif; margin: 0; padding: 0; background-color:
#f5f5f5; } h1 { text-align: center; margin-top: 30px; margin-bottom: 20px; }
.gallery { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;
padding: 20px; } .video { border: 2px solid #ccc; box-shadow: 0px 0px 10px
rgba(0, 0, 0, 0.2); border-radius: 5px; overflow: hidden; width: 300px;
margin-bottom: 20px; } .video video { width: 100%; height: 200px; } .video p {
text-align: center; margin: 10px 0; } form { margin-top: 20px; text-align:
center; } input[type="file"] { display: none; } .upload-btn { display:
inline-block; background-color: #3498db; color: #fff; padding: 10px 20px;
font-size: 16px; border: none; border-radius: 5px; cursor: pointer; }
.upload-btn:hover { background-color: #2980b9; } .file-name { margin-left: 10px;
} &lt;/style> &lt;/head> &lt;body> &lt;h1> 视频库 &lt;/h1> {% if videos %}
&lt;div class="gallery"> {% for video in videos %} &lt;div class="video">
&lt;video controls> &lt;source src="{{ url_for('static', path=video) }}"
type="video/mp4"> 您的浏览器不支持视频标签。 &lt;/video> &lt;p>{{ video
}}&lt;/p> &lt;/div> {% endfor %} &lt;/div> {% else %} &lt;p>
尚未上传任何视频。&lt;/p> {% endif %} &lt;form action="/uploadvideo/"
method="post" enctype="multipart/form-data"> &lt;label for="video-upload"
class="upload-btn"> 选择视频文件 &lt;/label> &lt;input type="file" name="video"
id="video-upload"> &lt;span class="file-name">&lt;/span> &lt;button
type="submit" class="upload-btn"> 上传 &lt;/button> &lt;/form> &lt;script> //
在表单中显示所选文件名 const fileUpload =
document.getElementById("video-upload"); const fileName =
document.querySelector(".file-name"); fileUpload.addEventListener("change", (e)
=> { fileName.textContent = e.target.files[0].name; }); &lt;/script> &lt;/body>
&lt;/html>
```

## 第4步：运行 FastAPI 应用

最后，我们准备好运行由 Gradio Python 客户端提供支持的 FastAPI 应用程序。

打开终端并导航到包含 `main.py` 文件的目录，然后在终端中运行以下命令：

```bash
$ uvicorn main:app
```

您应该会看到如下输出：

```csv
Loaded as API: https://abidlabs-music-separation.hf.space ✔
INFO:     Started server process [1360]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

就是这样！开始上传视频，您将在响应中得到一些“acapellified”视频（处理时间根据您的视频长度可能需要几秒钟到几分钟）。以下是上传两个视频后 UI 的外观：

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/acapellify.png)

如果您想了解如何在项目中使用 Gradio Python 客户端的更多信息，请[阅读专门的指南](/getting-started-with-the-python-client/)。

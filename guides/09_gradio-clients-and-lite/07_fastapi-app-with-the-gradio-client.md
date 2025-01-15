# Building a Web App with the Gradio Python Client

Tags: CLIENT, API, WEB APP

In this blog post, we will demonstrate how to use the `gradio_client` [Python library](getting-started-with-the-python-client/), which enables developers to make requests to a Gradio app programmatically, by creating an end-to-end example web app using FastAPI. The web app we will be building is called "Acapellify," and it will allow users to upload video files as input and return a version of that video without instrumental music. It will also display a gallery of generated videos.

**Prerequisites**

Before we begin, make sure you are running Python 3.9 or later, and have the following libraries installed:

- `gradio_client`
- `fastapi`
- `uvicorn`

You can install these libraries from `pip`:

```bash
$ pip install gradio_client fastapi uvicorn
```

You will also need to have ffmpeg installed. You can check to see if you already have ffmpeg by running in your terminal:

```bash
$ ffmpeg version
```

Otherwise, install ffmpeg [by following these instructions](https://www.hostinger.com/tutorials/how-to-install-ffmpeg).

## Step 1: Write the Video Processing Function

Let's start with what seems like the most complex bit -- using machine learning to remove the music from a video.

Luckily for us, there's an existing Space we can use to make this process easier: [https://huggingface.co/spaces/abidlabs/music-separation](https://huggingface.co/spaces/abidlabs/music-separation). This Space takes an audio file and produces two separate audio files: one with the instrumental music and one with all other sounds in the original clip. Perfect to use with our client!

Open a new Python file, say `main.py`, and start by importing the `Client` class from `gradio_client` and connecting it to this Space:

```py
from gradio_client import Client, handle_file

client = Client("abidlabs/music-separation")

def acapellify(audio_path):
    result = client.predict(handle_file(audio_path), api_name="/predict")
    return result[0]
```

That's all the code that's needed -- notice that the API endpoints returns two audio files (one without the music, and one with just the music) in a list, and so we just return the first element of the list.

---

**Note**: since this is a public Space, there might be other users using this Space as well, which might result in a slow experience. You can duplicate this Space with your own [Hugging Face token](https://huggingface.co/settings/tokens) and create a private Space that only you have will have access to and bypass the queue. To do that, simply replace the first two lines above with:

```py
from gradio_client import Client

client = Client.duplicate("abidlabs/music-separation", hf_token=YOUR_HF_TOKEN)
```

Everything else remains the same!

---

Now, of course, we are working with video files, so we first need to extract the audio from the video files. For this, we will be using the `ffmpeg` library, which does a lot of heavy lifting when it comes to working with audio and video files. The most common way to use `ffmpeg` is through the command line, which we'll call via Python's `subprocess` module:

Our video processing workflow will consist of three steps:

1. First, we start by taking in a video filepath and extracting the audio using `ffmpeg`.
2. Then, we pass in the audio file through the `acapellify()` function above.
3. Finally, we combine the new audio with the original video to produce a final acapellified video.

Here's the complete code in Python, which you can add to your `main.py` file:

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

You can read up on [ffmpeg documentation](https://ffmpeg.org/ffmpeg.html) if you'd like to understand all of the command line parameters, as they are beyond the scope of this tutorial.

## Step 2: Create a FastAPI app (Backend Routes)

Next up, we'll create a simple FastAPI app. If you haven't used FastAPI before, check out [the great FastAPI docs](https://fastapi.tiangolo.com/). Otherwise, this basic template, which we add to `main.py`, will look pretty familiar:

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
    video_path = video.filename
    with open(video_path, "wb+") as fp:
        fp.write(video.file.read())

    new_video = process_video(video.filename)
    videos.append(new_video)
    return RedirectResponse(url='/', status_code=303)
```

In this example, the FastAPI app has two routes: `/` and `/uploadvideo/`.

The `/` route returns an HTML template that displays a gallery of all uploaded videos.

The `/uploadvideo/` route accepts a `POST` request with an `UploadFile` object, which represents the uploaded video file. The video file is "acapellified" via the `process_video()` method, and the output video is stored in a list which stores all of the uploaded videos in memory.

Note that this is a very basic example and if this were a production app, you will need to add more logic to handle file storage, user authentication, and security considerations.

## Step 3: Create a FastAPI app (Frontend Template)

Finally, we create the frontend of our web application. First, we create a folder called `templates` in the same directory as `main.py`. We then create a template, `home.html` inside the `templates` folder. Here is the resulting file structure:

```csv
├── main.py
├── templates
│   └── home.html
```

Write the following as the contents of `home.html`:

```html
&lt;!DOCTYPE html> &lt;html> &lt;head> &lt;title>Video Gallery&lt;/title>
&lt;style> body { font-family: sans-serif; margin: 0; padding: 0;
background-color: #f5f5f5; } h1 { text-align: center; margin-top: 30px;
margin-bottom: 20px; } .gallery { display: flex; flex-wrap: wrap;
justify-content: center; gap: 20px; padding: 20px; } .video { border: 2px solid
#ccc; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); border-radius: 5px; overflow:
hidden; width: 300px; margin-bottom: 20px; } .video video { width: 100%; height:
200px; } .video p { text-align: center; margin: 10px 0; } form { margin-top:
20px; text-align: center; } input[type="file"] { display: none; } .upload-btn {
display: inline-block; background-color: #3498db; color: #fff; padding: 10px
20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; }
.upload-btn:hover { background-color: #2980b9; } .file-name { margin-left: 10px;
} &lt;/style> &lt;/head> &lt;body> &lt;h1>Video Gallery&lt;/h1> {% if videos %}
&lt;div class="gallery"> {% for video in videos %} &lt;div class="video">
&lt;video controls> &lt;source src="{{ url_for('static', path=video) }}"
type="video/mp4"> Your browser does not support the video tag. &lt;/video>
&lt;p>{{ video }}&lt;/p> &lt;/div> {% endfor %} &lt;/div> {% else %} &lt;p>No
videos uploaded yet.&lt;/p> {% endif %} &lt;form action="/uploadvideo/"
method="post" enctype="multipart/form-data"> &lt;label for="video-upload"
class="upload-btn">Choose video file&lt;/label> &lt;input type="file"
name="video" id="video-upload"> &lt;span class="file-name">&lt;/span> &lt;button
type="submit" class="upload-btn">Upload&lt;/button> &lt;/form> &lt;script> //
Display selected file name in the form const fileUpload =
document.getElementById("video-upload"); const fileName =
document.querySelector(".file-name"); fileUpload.addEventListener("change", (e)
=> { fileName.textContent = e.target.files[0].name; }); &lt;/script> &lt;/body>
&lt;/html>
```

## Step 4: Run your FastAPI app

Finally, we are ready to run our FastAPI app, powered by the Gradio Python Client!

Open up a terminal and navigate to the directory containing `main.py`. Then run the following command in the terminal:

```bash
$ uvicorn main:app
```

You should see an output that looks like this:

```csv
Loaded as API: https://abidlabs-music-separation.hf.space ✔
INFO:     Started server process [1360]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

And that's it! Start uploading videos and you'll get some "acapellified" videos in response (might take seconds to minutes to process depending on the length of your videos). Here's how the UI looks after uploading two videos:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/acapellify.png)

If you'd like to learn more about how to use the Gradio Python Client in your projects, [read the dedicated Guide](/guides/getting-started-with-the-python-client/).

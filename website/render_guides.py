import sys, os
import markdown2
from string import Template
import re

GRADIO_DIR = os.pardir
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")

def generate():
    with open(os.path.join(GRADIO_DIR, "readme_template.md")) as readme_file:
        readme = readme_file.read()
    codes = re.findall(r'\$code_([^\s]*)', readme)
    demos = re.findall(r'\$demo_([^\s]*)', readme)
    readme = readme.replace("website/src/static2", "/static2")
    readme = readme.replace("```python\n", "<pre><code class='lang-python'>").replace("```bash\n", "<pre><code class='lang-bash'>").replace("```directory\n", "<pre><code class='lang-bash'>").replace("```csv\n", "<pre><code class='lang-bash'>").replace("```", "</code></pre>")
    template_dict = {}
    for code_src in codes:
        with open(os.path.join(GRADIO_DEMO_DIR, code_src + ".py")) as code_file:
            python_code = code_file.read().replace('if __name__ == "__main__":\n    iface.launch()', "iface.launch()")
            template_dict["code_" + code_src] = "<pre><code class='lang-python'>" + python_code + "</code></pre>"
    for i, demo_src in enumerate(demos):
        template_dict["demo_" + demo_src] = "<div id='interface_" + str(i) + "'></div>"
    readme_template = Template(readme)
    readme = readme_template.substitute(template_dict)
    readme_lines = readme.split("\n")
    getting_started_index = [i for i, line in enumerate(readme_lines) if line.startswith("## Getting Started")][0]
    gs_start_index = [i for i, line in enumerate(readme_lines) if line.startswith("### ") and i > getting_started_index][0]
    gs_end_index = [i for i, line in enumerate(readme_lines) if line.startswith("## ") and i > getting_started_index][0]
    af_start_index = [i for i, line in enumerate(readme_lines) if line.startswith("### ") and i > gs_end_index][0]
    af_end_index = [i for i, line in enumerate(readme_lines) if line.startswith("## ") and i > gs_end_index][0]
    os.makedirs("generated", exist_ok=True)
    with open("src/guides_template.html") as template_file:
        template = template_file.read()
    for start_index, end_index, generated_folder in [
            (gs_start_index, gs_end_index, "getting_started"), 
            (af_start_index, af_end_index, "advanced_features")]:
        output_lines = readme_lines[start_index: end_index]
        output_markdown = "\n".join(output_lines)
        output_html = markdown2.markdown(output_markdown)
        for match in re.findall(r'<h3>(.*)<\/h3>', output_html):
            output_html = output_html.replace(f"<h3>{match}</h3>", f"<h3 id={match.lower().replace(' ', '_')}>{match}</h3>")
        if generated_folder == "advanced_features":
            output_html += """
      <h3>Image Classification in Tensorflow / Keras <a href="https://colab.research.google.com/drive/1NWE_SDgQPI6GIpnhtWeEOHCPejC2FaZc?usp=sharing" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" />
        </a></h3>
      <p>
        We'll start with the Inception Net image classifier, which we'll load
          using Tensorflow! Since this is an image classification model, we
          will use the <code>Image</code> input interface. We'll output a
          dictionary of labels and their corresponding confidence scores
          with the <code>Label</code> output interface. (The original
          Inception Net
          architecture <a href="https://arxiv.org/abs/1409.4842" target="_blank">can be found here</a>)
      </p>

      <pre><code class="lang-python">import gradio as gr
import tensorflow as tf
import numpy as np
import requests

inception_net = tf.keras.applications.InceptionV3() # load the model

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def classify_image(inp):
  inp = inp.reshape((-1, 299, 299, 3))
  inp = tf.keras.applications.inception_v3.preprocess_input(inp)
  prediction = inception_net.predict(inp).flatten()
  return {labels[i]: float(prediction[i]) for i in range(1000)}

image = gr.inputs.Image(shape=(299, 299))
label = gr.outputs.Label(num_top_classes=3)

gr.Interface(fn=classify_image, inputs=image, outputs=label, capture_session=True).launch()</code></pre>
      <p>This code will produce the interface below. The interface gives you a way to test
      Inception Net by dragging and dropping images, and also allows you to use naturally modify the input image using image editing tools that
          appear when you click EDIT. Notice here we provided actual <code>gradio.inputs</code> and <code>gradio.outputs</code> objects to the Interface
          function instead of using string shortcuts. This lets us use built-in
          preprocessing (e.g. image resizing)
          and postprocessing (e.g. choosing the number of labels to display) provided by these
            interfaces. Finally, we use <code>capture_session=True</code> to ensure compatibility with TF 1.x.
          Try it out in your device or run it in a <a href="https://colab.research.google.com/drive/1NWE_SDgQPI6GIpnhtWeEOHCPejC2FaZc?usp=sharing" target="_blank">colab notebook</a>!</p>

        <div class="wscreenshot">
        <img src="/static/home/img/inception-net.png">
        </div>

        <h3>Add Interpretation</h3>
        <p>The above code also shows how you can add interpretation to your
        interface. You can use our out of the box functions for text and image
            interpretation or use your own interpretation functions. To use
            the out of the box functions just specify “default” for the
            interpretation parameter (Note: this only works for text/image
            input and label outputs).</p>
        <pre><code class="lang-python">gr.Interface(classify_image, image, 
            label, capture_session=True, interpretation="default").launch();
        </code></pre>

    <h3>Image Classification in Pytorch

      <a
            href="https://colab.research.google.com/drive/1S6seNoJuU7_-hBX5KbXQV4Fb_bbqdPBk?usp=sharing" target="_blank"><img
            src="https://colab.research.google.com/assets/colab-badge.svg"
      /></a></h3>

        <p>Let's now wrap a very similar model, ResNet, except this time in
            Pytorch. We'll also use the <code>Image</code>
            to <code>Label</code> interface. (The original ResNet architecture
            <a href="https://arxiv.org/abs/1512.03385" target="_blank">can be found here</a>)</p>
<pre><code class="lang-python">import gradio as gr
import torch
from torchvision import transforms
import requests
from PIL import Image

model = torch.hub.load('pytorch/vision:v0.6.0', 'resnet18', pretrained=True).eval()

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def predict(inp):
  inp = Image.fromarray(inp.astype('uint8'), 'RGB')
  inp = transforms.ToTensor()(inp).unsqueeze(0)
  with torch.no_grad():
    prediction = torch.nn.functional.softmax(model(inp)[0], dim=0)
  return {labels[i]: float(prediction[i]) for i in range(1000)}

inputs = gr.inputs.Image()
outputs = gr.outputs.Label(num_top_classes=3)
gr.Interface(fn=predict, inputs=inputs, outputs=outputs).launch()</code></pre>
      <p>This code will produce the interface below.</p>
        <div class="wscreenshot">
        <img src="/static/home/img/resnet.png">
        </div>
      <h3>
        Text Generation with Transformers (GPT-2)
        <a href="https://colab.research.google.com/drive/1o_-QIR8yVphfnbNZGYemyEr111CHHxSv?usp=sharing" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" />
        </a>
      </h3>

      <p>
        Let's wrap a <code>Text</code> to <code>Text</code> interface around GPT-2, a text generation model that works on provided starter text. <a href="https://openai.com/blog/better-language-models/" target="_blank">Learn more about GPT-2</a> and similar language models.
      </p>
      <pre><code class="lang-python">import gradio as gr
import tensorflow as tf
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = TFGPT2LMHeadModel.from_pretrained("gpt2", pad_token_id=tokenizer.eos_token_id)

def generate_text(inp):
    input_ids = tokenizer.encode(inp, return_tensors='tf')
    beam_output = model.generate(input_ids, max_length=100, num_beams=5,
          no_repeat_ngram_size=2, early_stopping=True)
    output = tokenizer.decode(beam_output[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return ".".join(output.split(".")[:-1]) + "."

output_text = gr.outputs.Textbox()
gr.Interface(generate_text,"textbox", output_text).launch()</code></pre>
      <p>
        This code will produce the interface below. That's all that's needed!
      </p>
      <div class="wscreenshot">
        <img src="/static/home/img/gpt-2.png">
      </div>

      <h3>Answering Questions with BERT-QA
        <a href="https://colab.research.google.com/drive/1RuiMJz_7jDXpi59jDgW02NsBnlz1aY1S?usp=sharing"
          target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" /></a></h3>

      <p>What if our model takes more than one input? Let's wrap a 2-input to 1-output interface around BERT-QA,
        a model that can <a href="https://arxiv.org/abs/1909.05017" target="_blank">answer general questions</a>.
        As shown in the code, Gradio can wrap functions with multiple inputs or outputs, simply by taking the list of
        components needed.
        The number of input components should match the number of parameters taken by <code>fn</code>. The number of
        output components should match the number of values returned by <code>fn</code>. Similarly, if a model
        returns multiple outputs, you can pass in a list of output interfaces.</p>
      <pre><code class="lang-python">import gradio as gr
from bert import QA

model = QA('bert-large-uncased-whole-word-masking-finetuned-squad')

def qa_func(context, question):
    return model.predict(context, question)["answer"]

gr.Interface(qa_func,
    [
        gr.inputs.Textbox(lines=7, label="Context"),
        gr.inputs.Textbox(label="Question"),
    ],
    gr.outputs.Textbox(label="Answer")).launch()</code></pre>
      <p> This code will produce the interface below.</p>

        <div class="wscreenshot">
        <img src="/static/home/img/bert-qa.png">
        </div>
      <h3>
        Numerical Interfaces: Titanic Survival Model
        <a href="https://colab.research.google.com/drive/1xOU3sDHs7yZjuBosbQ8Zb2oc4BegfSFX?usp=sharing"
          target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" /></a>
      </h3>

      <p>
        Many models have numeric or categorical inputs, which we support with a variety of interfaces. Let's wrap multiple input to label interface around a <a href="https://www.kaggle.com/c/titanic" target="_blank"> Titanic survival model</a>. We've hidden some of model-related code below, but you can see the full code on colab.
      </p>
      <pre><code class="lang-python">import gradio as gr
import pandas as pd
import numpy as np
import sklearn

def predict_survival(sex, age, fare):
    df = pd.DataFrame.from_dict({'Sex': [sex], 'Age': [age], 'Fare': [fare]})
    df = encode_sex(df)
    df = encode_fares(df)
    df = encode_ages(df)
    pred = clf.predict_proba(df)[0]
    return {'Perishes': pred[0], 'Survives': pred[1]}

sex = gr.inputs.Radio(['female', 'male'], label="Sex")
age = gr.inputs.Slider(minimum=0, maximum=120, default=22, label="Age")
fare = gr.inputs.Slider(minimum=0, maximum=1000, default=100, label="Fare (british pounds)")

gr.Interface(predict_survival, [sex, age, fare], "label", live=True).launch()</code></pre>
      <p>This code will produce the interface below. </p>
      <div class="wscreenshot">
        <img src="/static/home/img/titanic.png">
      </div>

      <h3>
        Multiple Image Classifiers: Comparing Inception to MobileNet
        <a href="https://colab.research.google.com/drive/1yhuSqDhJ5UEVZ-n7WDM-l64JkrshblZl?usp=sharing" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" /></a>
      </h3>
      <p>
        What if we want to compare two models? The code below generates a UI that takes one image input and returns predictions from both
        <a href="https://arxiv.org/abs/1409.4842" target="_blank">Inception</a> and
        <a href="https://arxiv.org/abs/1704.04861" target="_blank">MobileNet</a>.
        We'll also add a title, description, and sample images.</p>
      <pre><code class="lang-python">import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import requests
from urllib.request import urlretrieve

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

# Download sample images
urlretrieve("https://www.sciencemag.org/sites/default/files/styles/article_main_large/public/cc_BE6RJF_16x9.jpg?itok=nP17Fm9H","monkey.jpg")
urlretrieve("https://www.discoverboating.com/sites/default/files/inline-images/buying-a-sailboat-checklist.jpg","sailboat.jpg")
urlretrieve("https://external-preview.redd.it/lG5mI_9Co1obw2TiY0e-oChlXfEQY3tsRaIjpYjERqs.jpg?auto=webp&s=ea81982f44b83efbb803c8cff8953ee547624f70","bicycle.jpg")

mobile_net = tf.keras.applications.MobileNetV2()
inception_net = tf.keras.applications.InceptionV3()

def classify_image_with_mobile_net(im):
	im = Image.fromarray(im.astype('uint8'), 'RGB')
	im = im.resize((224, 224))
	arr = np.array(im).reshape((-1, 224, 224, 3))
	arr = tf.keras.applications.mobilenet.preprocess_input(arr)
	prediction = mobile_net.predict(arr).flatten()
    return {labels[i]: float(prediction[i]) for i in range(1000)}


def classify_image_with_inception_net(im):
    # Resize the image to
	im = Image.fromarray(im.astype('uint8'), 'RGB')
	im = im.resize((299, 299))
	arr = np.array(im).reshape((-1, 299, 299, 3))
	arr = tf.keras.applications.inception_v3.preprocess_input(arr)
	prediction = inception_net.predict(arr).flatten()
    return {labels[i]: float(prediction[i]) for i in range(1000)}

imagein = gr.inputs.Image()
label = gr.outputs.Label(num_top_classes=3)
sample_images = [
                 ["monkey.jpg"],
                 ["sailboat.jpg"],
                 ["bicycle.jpg"]
]
gr.Interface(
    [classify_image_with_mobile_net, classify_image_with_inception_net],
    imagein,
    label,
    title="MobileNet vs. InceptionNet",
    description="Let's compare 2 state-of-the-art machine learning models
          that classify images into one of 1,000 categories: MobileNet (top),
          a lightweight model that has an accuracy of 0.704, vs. InceptionNet
          (bottom), a much heavier model that has an accuracy of 0.779.",
    examples=sample_images).launch();</code></pre>
      <p>This code will produce the interface below. Looks like MobileNet is
        about 3 times faster! </p>
       <div class="big_wscreenshot">
        <img src="/static/home/img/inception-mobile.png">
       </div>"""            
        os.makedirs(os.path.join("generated", generated_folder), exist_ok=True)
        with open(os.path.join("generated", generated_folder, "index.html"), "w") as generated_template:
            output_html = template.replace("{{ template_html }}", output_html)
            generated_template.write(output_html)

if __name__ == "__main__":
    generate()

# Create Your Own Friends with a GAN

related_spaces: https://huggingface.co/spaces/NimaBoscarino/cryptopunks, https://huggingface.co/spaces/nateraw/cryptopunks-generator
tags: GAN, IMAGE, HUB

Contributed by <a href="https://huggingface.co/NimaBoscarino">Nima Boscarino</a> and <a href="https://huggingface.co/nateraw">Nate Raw</a>


## Introduction

It seems that cryptocurrencies, [NFTs](https://www.nytimes.com/interactive/2022/03/18/technology/nft-guide.html), and the web3 movement are all the rage these days! Digital assets are being listed on marketplaces for astounding amounts of money, and just about every celebrity is debuting their own NFT collection. While your crypto assets [may be taxable, such as in Canada](https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/digital-currency/cryptocurrency-guide.html), today we'll explore some fun and tax-free ways to generate your own assortment of procedurally generated [CryptoPunks](https://www.larvalabs.com/cryptopunks).

Generative Adversarial Networks, often known just as *GANs*, are a specific class of deep-learning models that are designed to learn from an input dataset to create (*generate!*) new material that is convincingly similar to elements of the original training set. Famously, the website [thispersondoesnotexist.com](https://thispersondoesnotexist.com/) went viral with lifelike, yet synthetic, images of people generated with a model called StyleGAN2. GANs have gained traction in the machine learning world, and are now being used to generate all sorts of images, text, and even [music](https://salu133445.github.io/musegan/)!

Today we'll briefly look at the high-level intuition behind GANs, and then we'll build a small demo around a pre-trained GAN to see what all the fuss is about. Here's a peek at what we're going to be putting together:

<iframe src="https://hf.space/embed/NimaBoscarino/cryptopunks/+" frameBorder="0" height="855" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). To use the pretrained model, also install `torch` and `torchvision`.

## GANs: a very brief introduction

Originally proposed in [Goodfellow et al. 2014](https://arxiv.org/abs/1406.2661), GANs are made up of neural networks which compete with the intention of outsmarting each other. One network, known as the *generator*, is responsible for generating images. The other network, the *discriminator*, receives an image at a time from the generator along with a **real** image from the training data set. The discriminator then has to guess: which image is the fake?

The generator is constantly training to create images which are trickier for the discriminator to identify, while the discriminator raises the bar for the generator every time it correctly detects a fake. As the networks engage in this competitive (*adversarial!*) relationship, the images that get generated improve to the point where they become indistinguishable to human eyes!

For a more in-depth look at GANs, you can take a look at [this excellent post on Analytics Vidhya](https://www.analyticsvidhya.com/blog/2021/06/a-detailed-explanation-of-gan-with-implementation-using-tensorflow-and-keras/) or this [PyTorch tutorial](https://pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html). For now, though, we'll dive into a demo!

## Step 1 — Create the Generator model

To generate new images with a GAN, you only need the generator model. There are many different architectures that the generator could use, but for this demo we'll use a pretrained GAN generator model with the following architecture:

```python
from torch import nn

class Generator(nn.Module):
    # Refer to the link below for explanations about nc, nz, and ngf
    # https://pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html#inputs
    def __init__(self, nc=4, nz=100, ngf=64):
        super(Generator, self).__init__()
        self.network = nn.Sequential(
            nn.ConvTranspose2d(nz, ngf * 4, 3, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 3, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 0, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh(),
        )

    def forward(self, input):
        output = self.network(input)
        return output
```

We're taking the generator from [this repo by @teddykoker](https://github.com/teddykoker/cryptopunks-gan/blob/main/train.py#L90), where you can also see the original discriminator model structure.

After instantiating the model, we'll load in the weights from the Hugging Face Hub, stored at [nateraw/cryptopunks-gan](https://huggingface.co/nateraw/cryptopunks-gan):

```python
from huggingface_hub import hf_hub_download
import torch

model = Generator()
weights_path = hf_hub_download('nateraw/cryptopunks-gan', 'generator.pth')
model.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu'))) # Use 'cuda' if you have a GPU available
```

## Step 2 — Defining a `predict` function

The `predict` function is the key to making Gradio work! Whatever inputs we choose through the Gradio interface will get passed through our `predict` function, which should operate on the inputs and generate outputs that we can display with Gradio output components. For GANs it's common to pass random noise in to our model as the input, so we'll generate a tensor of random numbers and pass that through the model. We can then use `torchvision`'s `save_image` function to save the output of the model as a `png` file, and return the file name:

```python
from torchvision.utils import save_image

def predict(seed):
    num_punks = 4
    torch.manual_seed(seed)
    z = torch.randn(num_punks, 100, 1, 1)
    punks = model(z)
    save_image(punks, "punks.png", normalize=True)
    return 'punks.png'
```

We're giving our `predict` function a `seed` parameter, so that we can fix the random tensor generation with a seed. We'll then be able to reproduce punks if we want to see them again by passing in the same seed.

*Note!* Our model needs an input tensor of dimensions 100x1x1 to do a single inference, or (BatchSize)x100x1x1 for generating a batch of images. In this demo we'll start by generating 4 punks at a time.

## Step 3 — Creating a Gradio interface

At this point you can even run the code you have with `predict(<SOME_NUMBER>)`, and you'll find your freshly generated punks in your file system at `./punks.png`. To make a truly interactive demo, though, we'll build out a simple interface with Gradio. Our goals here are to:

* Set a slider input so users can choose the "seed" value
* Use an image component for our output to showcase the generated punks
* Use our `predict()` to take the seed and generate the images

With `gr.Interface()`, we can define all of that with a single function call:

```python
import gradio as gr

gr.Interface(
    predict,
    inputs=[
        gr.inputs.Slider(label='Seed', minimum=0, maximum=1000, default=42),
    ],
    outputs="image",
).launch()
```

Launching the inferface should present you with something like this:

<iframe src="https://hf.space/embed/NimaBoscarino/cryptopunks-1/+" frameBorder="0" height="365" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## Step 4 — Even more punks!

Generating 4 punks at a time is a good start, but maybe we'd like to control how many we want to make each time. Adding more inputs to our Gradio interface is as simple as adding another item to the `inputs` list that we pass to `gr.Interface`:

```python
gr.Interface(
    predict,
    inputs=[
        gr.inputs.Slider(label='Seed', minimum=0, maximum=1000, default=42),
        gr.inputs.Slider(label='Number of Punks', minimum=4, maximum=64, step=1, default=10), # Adding another slider!
    ],
    outputs="image",
).launch()
```

The new input will be passed to our `predict()` function, so we have to make some changes to that function to accept a new parameter:

```python
def predict(seed, num_punks):
    torch.manual_seed(seed)
    z = torch.randn(num_punks, 100, 1, 1)
    punks = model(z)
    save_image(punks, "punks.png", normalize=True)
    return 'punks.png'
```

When you relaunch your interface, you should see a second slider that'll let you control the number of punks!

## Step 5 - Polishing it up

Your Gradio app is pretty much good to go, but you can add a few extra things to really make it ready for the spotlight ✨

We can add some examples that users can easily try out by adding this to the `gr.Interface`:

```python
gr.Interface(
    # ...
    # keep everything as it is, and then add
    examples=[[123, 15], [42, 29], [456, 8], [1337, 35]],
).launch(cache_examples=True) # cache_examples is optional
```

The `examples` parameter takes a list of lists, where each item in the sublists is ordered in the same order that we've listed the `inputs`. So in our case, `[seed, num_punks]`. Give it a try!

You can also try adding a `title`, `description`, and `article` to the `gr.Interface`. Each of those parameters accepts a string, so try it out and see what happens 👀 `article` will also accept HTML, as [explored in a previous guide](./adding_rich_descriptions_to_your_demo)!

When you're all done, you may end up with something like this:

<iframe src="https://hf.space/embed/NimaBoscarino/cryptopunks/+" frameBorder="0" height="855" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

For reference, here is our full code:

```python
import torch
from torch import nn
from huggingface_hub import hf_hub_download
from torchvision.utils import save_image
import gradio as gr

class Generator(nn.Module):
    # Refer to the link below for explanations about nc, nz, and ngf
    # https://pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html#inputs
    def __init__(self, nc=4, nz=100, ngf=64):
        super(Generator, self).__init__()
        self.network = nn.Sequential(
            nn.ConvTranspose2d(nz, ngf * 4, 3, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 3, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 0, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh(),
        )

    def forward(self, input):
        output = self.network(input)
        return output

model = Generator()
weights_path = hf_hub_download('nateraw/cryptopunks-gan', 'generator.pth')
model.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu'))) # Use 'cuda' if you have a GPU available

def predict(seed, num_punks):
    torch.manual_seed(seed)
    z = torch.randn(num_punks, 100, 1, 1)
    punks = model(z)
    save_image(punks, "punks.png", normalize=True)
    return 'punks.png'

gr.Interface(
    predict,
    inputs=[
        gr.inputs.Slider(label='Seed', minimum=0, maximum=1000, default=42),
        gr.inputs.Slider(label='Number of Punks', minimum=4, maximum=64, step=1, default=10),
    ],
    outputs="image",
    examples=[[123, 15], [42, 29], [456, 8], [1337, 35]],
).launch(cache_examples=True)
```
----------

Congratulations! You've built out your very own GAN-powered CryptoPunks generator, with a fancy Gradio interface that makes it easy for anyone to use. Now you can [scour the Hub for more GANs](https://huggingface.co/models?other=gan) (or train your own) and continue making even more awesome demos 🤗
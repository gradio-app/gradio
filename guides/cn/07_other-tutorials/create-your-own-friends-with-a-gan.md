# 使用 GAN 创建您自己的朋友

spaces/NimaBoscarino/cryptopunks, https://huggingface.co/spaces/nateraw/cryptopunks-generator
Tags: GAN, IMAGE, HUB

由 <a href="https://huggingface.co/NimaBoscarino">Nima Boscarino</a> 和 <a href="https://huggingface.co/nateraw">Nate Raw</a> 贡献

## 简介

最近，加密货币、NFTs 和 Web3 运动似乎都非常流行！数字资产以惊人的金额在市场上上市，几乎每个名人都推出了自己的 NFT 收藏。虽然您的加密资产可能是应税的，例如在加拿大（https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/digital-currency/cryptocurrency-guide.html），但今天我们将探索一些有趣且无税的方法来生成自己的一系列过程生成的 CryptoPunks（https://www.larvalabs.com/cryptopunks）。

生成对抗网络（GANs），通常称为 GANs，是一类特定的深度学习模型，旨在通过学习输入数据集来创建（生成！）与原始训练集中的元素具有令人信服的相似性的新材料。众所周知，网站[thispersondoesnotexist.com](https://thispersondoesnotexist.com/)通过名为 StyleGAN2 的模型生成了栩栩如生但是合成的人物图像而迅速走红。GANs 在机器学习领域获得了人们的关注，现在被用于生成各种图像、文本甚至音乐！

今天我们将简要介绍 GAN 的高级直觉，然后我们将围绕一个预训练的 GAN 构建一个小型演示，看看这一切都是怎么回事。下面是我们将要组合的东西的一瞥：

<iframe src="https://nimaboscarino-cryptopunks.hf.space" frameBorder="0" height="855" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

### 先决条件

确保已经[安装](/getting_started)了 `gradio` Python 包。要使用预训练模型，请还安装 `torch` 和 `torchvision`。

## GANs：简介

最初在[Goodfellow 等人 2014 年的论文](https://arxiv.org/abs/1406.2661)中提出，GANs 由互相竞争的神经网络组成，旨在相互智能地欺骗对方。一种网络，称为“生成器”，负责生成图像。另一个网络，称为“鉴别器”，从生成器一次接收一张图像，以及来自训练数据集的 **real 真实**图像。然后，鉴别器必须猜测：哪张图像是假的？

生成器不断训练以创建对鉴别器更难以识别的图像，而鉴别器每次正确检测到伪造图像时，都会为生成器设置更高的门槛。随着网络之间的这种竞争（**adversarial 对抗性！**），生成的图像改善到了对人眼来说无法区分的地步！

如果您想更深入地了解 GANs，可以参考[Analytics Vidhya 上的这篇优秀文章](https://www.analyticsvidhya.com/blog/2021/06/a-detailed-explanation-of-gan-with-implementation-using-tensorflow-and-keras/)或这个[PyTorch 教程](https://pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html)。不过，现在我们将深入看一下演示！

## 步骤 1 - 创建生成器模型

要使用 GAN 生成新图像，只需要生成器模型。生成器可以使用许多不同的架构，但是对于这个演示，我们将使用一个预训练的 GAN 生成器模型，其架构如下：

```python
from torch import nn

class Generator(nn.Module):
    # 有关nc，nz和ngf的解释，请参见下面的链接
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

我们正在使用来自[此 repo 的 @teddykoker](https://github.com/teddykoker/cryptopunks-gan/blob/main/train.py#L90)的生成器模型，您还可以在那里看到原始的鉴别器模型结构。

在实例化模型之后，我们将加载来自 Hugging Face Hub 的权重，存储在[nateraw/cryptopunks-gan](https://huggingface.co/nateraw/cryptopunks-gan)中：

```python
from huggingface_hub import hf_hub_download
import torch

model = Generator()
weights_path = hf_hub_download('nateraw/cryptopunks-gan', 'generator.pth')
model.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu'))) # 如果有可用的GPU，请使用'cuda'
```

## 步骤 2 - 定义“predict”函数

`predict` 函数是使 Gradio 工作的关键！我们通过 Gradio 界面选择的任何输入都将通过我们的 `predict` 函数传递，该函数应对输入进行操作并生成我们可以通过 Gradio 输出组件显示的输出。对于 GANs，常见的做法是将随机噪声传入我们的模型作为输入，因此我们将生成一张随机数的张量并将其传递给模型。然后，我们可以使用 `torchvision` 的 `save_image` 函数将模型的输出保存为 `png` 文件，并返回文件名：

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

我们给 `predict` 函数一个 `seed` 参数，这样我们就可以使用一个种子固定随机张量生成。然后，我们可以通过传入相同的种子再次查看生成的 punks。

_注意！_ 我们的模型需要一个 100x1x1 的输入张量进行单次推理，或者 (BatchSize)x100x1x1 来生成一批图像。在这个演示中，我们每次生成 4 个 punk。

## 第三步—创建一个 Gradio 接口

此时，您甚至可以运行您拥有的代码 `predict(<SOME_NUMBER>)`，并在您的文件系统中找到新生成的 punk 在 `./punks.png`。然而，为了制作一个真正的交互演示，我们将用 Gradio 构建一个简单的界面。我们的目标是：

- 设置一个滑块输入，以便用户可以选择“seed”值
- 使用图像组件作为输出，展示生成的 punk
- 使用我们的 `predict()` 函数来接受种子并生成图像

通过使用 `gr.Interface()`，我们可以使用一个函数调用来定义所有这些 :

```python
import gradio as gr

gr.Interface(
    predict,
    inputs=[
        gr.Slider(0, 1000, label='Seed', default=42),
    ],
    outputs="image",
).launch()
```

启动界面后，您应该会看到像这样的东西 :

<iframe src="https://nimaboscarino-cryptopunks-1.hf.space" frameBorder="0" height="365" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## 第四步—更多 punk！

每次生成 4 个 punk 是一个好的开始，但是也许我们想控制每次想生成多少。通过简单地向我们传递给 `gr.Interface` 的 `inputs` 列表添加另一项即可向我们的 Gradio 界面添加更多输入 :

```python
gr.Interface(
    predict,
    inputs=[
        gr.Slider(0, 1000, label='Seed', default=42),
        gr.Slider(4, 64, label='Number of Punks', step=1, default=10), # 添加另一个滑块!
    ],
    outputs="image",
).launch()
```

新的输入将传递给我们的 `predict()` 函数，所以我们必须对该函数进行一些更改，以接受一个新的参数 :

```python
def predict(seed, num_punks):
    torch.manual_seed(seed)
    z = torch.randn(num_punks, 100, 1, 1)
    punks = model(z)
    save_image(punks, "punks.png", normalize=True)
    return 'punks.png'
```

当您重新启动界面时，您应该会看到一个第二个滑块，它可以让您控制 punk 的数量！

## 第五步-完善它

您的 Gradio 应用已经准备好运行了，但是您可以添加一些额外的功能来使其真正准备好发光 ✨

我们可以添加一些用户可以轻松尝试的示例，通过将其添加到 `gr.Interface` 中实现 :

```python
gr.Interface(
    # ...
    # 将所有内容保持不变，然后添加
    examples=[[123, 15], [42, 29], [456, 8], [1337, 35]],
).launch(cache_examples=True) # cache_examples是可选的
```

`examples` 参数接受一个列表的列表，其中子列表中的每个项目的顺序与我们列出的 `inputs` 的顺序相同。所以在我们的例子中，`[seed, num_punks]`。试一试吧！

您还可以尝试在 `gr.Interface` 中添加 `title`、`description` 和 `article`。每个参数都接受一个字符串，所以试试看发生了什么👀 `article` 也接受 HTML，如[前面的指南](./key_features/#descriptive-content)所述！

当您完成所有操作后，您可能会得到类似于这样的结果 :

<iframe src="https://nimaboscarino-cryptopunks.hf.space" frameBorder="0" height="855" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

供参考，这是我们的完整代码 :

```python
import torch
from torch import nn
from huggingface_hub import hf_hub_download
from torchvision.utils import save_image
import gradio as gr

class Generator(nn.Module):
    # 关于nc、nz和ngf的解释，请参见下面的链接
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
model.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu'))) # 如果您有可用的GPU，使用'cuda'

def predict(seed, num_punks):
    torch.manual_seed(seed)
    z = torch.randn(num_punks, 100, 1, 1)
    punks = model(z)
    save_image(punks, "punks.png", normalize=True)
    return 'punks.png'

gr.Interface(
    predict,
    inputs=[
        gr.Slider(0, 1000, label='Seed', default=42),
        gr.Slider(4, 64, label='Number of Punks', step=1, default=10),
    ],
    outputs="image",
    examples=[[123, 15], [42, 29], [456, 8], [1337, 35]],
).launch(cache_examples=True)
```

---

恭喜！你已经成功构建了自己的基于 GAN 的 CryptoPunks 生成器，配备了一个时尚的 Gradio 界面，使任何人都能轻松使用。现在你可以在 Hub 上[寻找更多的 GANs](https://huggingface.co/models?other=gan)（或者自己训练）并继续制作更多令人赞叹的演示项目。🤗

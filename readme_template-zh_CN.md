<div align="center">


  [<img src="I:/desktop/Gradio/readme_files/gradio.svg" alt="gradio" width=300>](https://gradio.app)<br>
  <em>轻松构建 & 分享 令人愉快的机器学习程序</em>

  [![gradio-backend](https://github.com/gradio-app/gradio/actions/workflows/backend.yml/badge.svg)](https://github.com/gradio-app/gradio/actions/workflows/backend.yml)
  [![gradio-ui](https://github.com/gradio-app/gradio/actions/workflows/ui.yml/badge.svg)](https://github.com/gradio-app/gradio/actions/workflows/ui.yml)  
  [<img src="https://codecov.io/gh/gradio-app/gradio/branch/master/graph/badge.svg" alt="codecov">](https://app.codecov.io/gh/gradio-app/gradio)
  [![PyPI](https://img.shields.io/pypi/v/gradio)](https://pypi.org/project/gradio/)
  [![PyPI downloads](https://img.shields.io/pypi/dm/gradio)](https://pypi.org/project/gradio/)
  ![Python version](https://img.shields.io/badge/python-3.7+-important)
  [![Twitter follow](https://img.shields.io/twitter/follow/gradio?style=social&label=follow)](https://twitter.com/gradio)

  [官网](https://gradio.app)
  | [文档](https://gradio.app/docs/)
  | [指南](https://gradio.app/guides/)
  | [开始](https://gradio.app/getting_started/)
  | [样例](demo/)
</div>

# Gradio: 用Python构建机器学习网页APP

Gradio是一个开源的Python库，用于构建演示机器学习或数据科学，以及web应用程序。

使用Gradio，您可以基于您的机器学习模型或数据科学工作流快速创建一个漂亮的用户界面，让用户可以”尝试“拖放他们自己的图像、粘贴文本、录制他们自己的声音，并通过浏览器与您的演示程序进行交互。

![Interface montage](I:/desktop/Gradio/readme_files/header-image.jpg)

Gradio适用于:

- 向客户/合伙人/用户/学生**演示**您的机器学习模型。

- 通过自动共享链接快速**部署**您的模型，并获得模型性能反馈。

- 在开发过程中使用内置的操作和解释工具交互式地**调试**模型。

$getting_started

## 开源栈

Gradio是由许多很棒的开源库构建的，请一并支持它们!

[<img src="I:/desktop/Gradio/readme_files/huggingface_mini.svg" alt="huggingface" height=40>](https://huggingface.co)
[<img src="I:/desktop/Gradio/readme_files/python.svg" alt="python" height=40>](https://www.python.org)
[<img src="I:/desktop/Gradio/readme_files/fastapi.svg" alt="fastapi" height=40>](https://fastapi.tiangolo.com)
[<img src="I:/desktop/Gradio/readme_files/encode.svg" alt="encode" height=40>](https://www.encode.io)
[<img src="I:/desktop/Gradio/readme_files/svelte.svg" alt="svelte" height=40>](https://svelte.dev)
[<img src="I:/desktop/Gradio/readme_files/vite.svg" alt="vite" height=40>](https://vitejs.dev)
[<img src="I:/desktop/Gradio/readme_files/pnpm.svg" alt="pnpm" height=40>](https://pnpm.io)
[<img src="I:/desktop/Gradio/readme_files/tailwind.svg" alt="tailwind" height=40>](https://tailwindcss.com)

## 协议

Gradio is licensed under the Apache License 2.0 found in the [LICENSE](LICENSE) file in the root directory of this repository.

## 引用

另外请参阅论文 *[Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild](https://arxiv.org/abs/1906.02569), ICML HILL 2019*，如果您在工作中使用Gradio请引用它。

```
@article{abid2019gradio,
  title = {Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild},
  author = {Abid, Abubakar and Abdalla, Ali and Abid, Ali and Khan, Dawood and Alfozan, Abdulrahman and Zou, James},
  journal = {arXiv preprint arXiv:1906.02569},
  year = {2019},
}
```

## 额外参阅

* [Gradio Discord Bot](https://github.com/gradio-app/gradio-discord-bot)，一个Discord bot，允许你尝试任何[Hugging Face Space](https://huggingface.co/spaces) ，并以一个Discord bot运行Gradio示例。
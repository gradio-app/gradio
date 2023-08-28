# 如何使用 3D 模型组件

相关空间：https://huggingface.co/spaces/dawood/Model3D, https://huggingface.co/spaces/radames/PIFu-Clothed-Human-Digitization, https://huggingface.co/spaces/radames/dpt-depth-estimation-3d-obj
标签：VISION, IMAGE

## 介绍

机器学习中的 3D 模型越来越受欢迎，并且是一些最有趣的演示实验。使用 `gradio`，您可以轻松构建您的 3D 图像模型的演示，并与任何人分享。Gradio 3D 模型组件接受 3 种文件类型，包括：_.obj_，_.glb_ 和 _.gltf_。

本指南将向您展示如何使用几行代码构建您的 3D 图像模型的演示；像下面这个示例一样。点击、拖拽和缩放来玩转 3D 对象：

<gradio-app space="dawood/Model3D"> </gradio-app>

### 先决条件

确保已经[安装](https://gradio.app/quickstart)了 `gradio` Python 包。

## 查看代码

让我们来看看如何创建上面的最简界面。在这种情况下，预测函数将只返回原始的 3D 模型网格，但您可以更改此函数以在您的机器学习模型上运行推理。我们将在下面看更复杂的示例。

```python
import gradio as gr

def load_mesh(mesh_file_name):
    return mesh_file_name

demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(),
    outputs=gr.Model3D(clear_color=[0.0, 0.0, 0.0, 0.0],  label="3D Model"),
    examples=[
        ["files/Bunny.obj"],
        ["files/Duck.glb"],
        ["files/Fox.gltf"],
        ["files/face.obj"],
    ],
    cache_examples=True,
)

demo.launch()
```

让我们来解析上面的代码：

`load_mesh`：这是我们的“预测”函数，为简单起见，该函数将接收 3D 模型网格并返回它。

创建界面：

- `fn`：当用户点击提交时使用的预测函数。在我们的例子中，它是 `load_mesh` 函数。
- `inputs`：创建一个 model3D 输入组件。输入是一个上传的文件，作为{str}文件路径。
- `outputs`：创建一个 model3D 输出组件。输出组件也期望一个文件作为{str}文件路径。
  - `clear_color`：这是 3D 模型画布的背景颜色。期望 RGBa 值。
  - `label`：出现在组件左上角的标签。
- `examples`：3D 模型文件的列表。3D 模型组件可以接受*.obj*，*.glb*和*.gltf*文件类型。
- `cache_examples`：保存示例的预测输出，以节省推理时间。

## 探索更复杂的 Model3D 演示

下面是一个使用 DPT 模型预测图像深度，然后使用 3D 点云创建 3D 对象的演示。查看[code.py](https://huggingface.co/spaces/radames/dpt-depth-estimation-3d-obj/blob/main/app.py)文件，了解代码和模型预测函数。
<gradio-app space="radames/dpt-depth-estimation-3d-obj"> </gradio-app>

下面是一个使用 PIFu 模型将穿着衣物的人的图像转换为 3D 数字化模型的演示。查看[spaces.py](https://huggingface.co/spaces/radames/PIFu-Clothed-Human-Digitization/blob/main/PIFu/spaces.py)文件，了解代码和模型预测函数。

<gradio-app space="radames/PIFu-Clothed-Human-Digitization"> </gradio-app>

---

搞定！这就是构建 Model3D 模型界面所需的所有代码。以下是一些您可能会发现有用的参考资料：

- Gradio 的[“入门指南”](https://gradio.app/getting_started/)
- 第一个[3D 模型演示](https://huggingface.co/spaces/dawood/Model3D)和[完整代码](https://huggingface.co/spaces/dawood/Model3D/tree/main)（在 Hugging Face Spaces 上）

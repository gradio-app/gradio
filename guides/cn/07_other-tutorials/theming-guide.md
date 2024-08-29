# 主题 Theming

Tags: THEMES

## 介绍

Gradio 具有内置的主题引擎，可让您自定义应用的外观和感觉。您可以选择各种主题，或者创建自己的主题。要这样做，请将 `theme=` kwarg 传递给 `Blocks` 或 `Interface` 构造函数。例如：

```python
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-soft.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

Gradio 带有一组预构建的主题，您可以从 `gr.themes.*` 中加载这些主题。这些主题包括：

- `gr.themes.Base()`
- `gr.themes.Default()`
- `gr.themes.Glass()`
- `gr.themes.Monochrome()`
- `gr.themes.Soft()`

这些主题为数百个 CSS 变量设置了值。您可以使用预构建的主题作为自定义主题的起点，也可以从头开始创建自己的主题。让我们看看每种方法。

## 使用主题构建器

使用主题构建器构建主题最简单。要在本地启动主题构建器，请运行以下代码：

```python
import gradio as gr

gr.themes.builder()
```

$demo_theme_builder

您可以使用上面的 Spaces 上运行的 Theme Builder，但通过 `gr.themes.builder()` 在本地启动时运行速度更快。

在 Theme Builder 中编辑值时，应用程序将实时预览更新。您可以下载生成的主题代码，以便在任何 Gradio 应用程序中使用它。

在本指南的其余部分，我们将介绍如何以编程方式构建主题。

## 通过构造函数扩展主题

尽管每个主题都有数百个 CSS 变量，但大多数这些变量的值都是从 8 个核心变量中获取的，可以通过每个预构建主题的构造函数设置这些变量。通过修改这 8 个参数的值，您可以快速更改应用程序的外观和感觉。

### 核心颜色

前 3 个构造函数参数设置主题的颜色，并且是 `gradio.themes.Color` 对象。在内部，这些 Color 对象包含单个色调的调色板的亮度值，范围从 50，100，200...，800，900，950。其他 CSS 变量是从这 3 种颜色派生的。

3 个颜色构造函数参数是：

- `primary_hue`：这是主题中的主色。在默认主题中，此值设置为 `gradio.themes.colors.orange`。
- `secondary_hue`：这是主题中用于辅助元素的颜色。在默认主题中，此值设置为 `gradio.themes.colors.blue`。
- `neutral_hue`：这是主题中用于文本和其他中性元素的颜色。在默认主题中，此值设置为 `gradio.themes.colors.gray`。

您可以使用字符串快捷方式修改这些值，例如

```python
with gr.Blocks(theme=gr.themes.Default(primary_hue="red", secondary_hue="pink")) as demo:
    ...
```

或者直接使用 `Color` 对象，如下所示：

```python
with gr.Blocks(theme=gr.themes.Default(primary_hue=gr.themes.colors.red, secondary_hue=gr.themes.colors.pink)) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-1.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

预定义的颜色包括：

- `slate`
- `gray`
- `zinc`
- `neutral`
- `stone`
- `red`
- `orange`
- `amber`
- `yellow`
- `lime`
- `green`
- `emerald`
- `teal`
- `cyan`
- `sky`
- `blue`
- `indigo`
- `violet`
- `purple`
- `fuchsia`
- `pink`
- `rose`

您还可以创建自己的自定义 `Color` 对象并传递它们。

### 核心大小 （Core Sizing）

接下来的 3 个构造函数参数设置主题的大小，并且是 `gradio.themes.Size` 对象。在内部，这些 Size 对象包含从 `xxs` 到 `xxl` 的像素大小值。其他 CSS 变量是从这 3 个大小派生的。

- `spacing_size`：此设置了元素内部的填充和元素之间的间距。在默认主题中，此值设置为 `gradio.themes.sizes.spacing_md`。
- `radius_size`：此设置了元素的圆角弧度。在默认主题中，此值设置为 `gradio.themes.sizes.radius_md`。
- `text_size`：此设置了文本的字体大小。在默认主题中，此值设置为 `gradio.themes.sizes.text_md`。

您可以使用字符串快捷方式修改这些值，例如

```python
with gr.Blocks(theme=gr.themes.Default(spacing_size="sm", radius_size="none")) as demo:
    ...
```

或者直接使用 `Size` 对象，如下所示：

```python
with gr.Blocks(theme=gr.themes.Default(spacing_size=gr.themes.sizes.spacing_sm, radius_size=gr.themes.sizes.radius_none)) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-2.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

预定义的大小对象包括：

- `radius_none`
- `radius_sm`
- `radius_md`
- `radius_lg`
- `spacing_sm`
- `spacing_md`
- `spacing_lg`
- `text_sm`
- `text_md`
- `text_lg`

您还可以创建自己的自定义 `Size` 对象并传递它们。

### 核心字体（Core Fonts）

最后的 2 个构造函数参数设置主题的字体。您可以将一系列字体传递给这些参数，以指定回退字体。如果提供了字符串，它将被加载为系统字体。如果提供了 `gradio.themes.GoogleFont`，则将从 Google Fonts 加载该字体。

- `font`：此设置主题的主要字体。在默认主题中，此值设置为 `gradio.themes.GoogleFont("IBM Plex Sans")`。
- `font_mono`：此设置主题的等宽字体。在默认主题中，此值设置为 `gradio.themes.GoogleFont("IBM Plex Mono")`。

您可以修改这些值，例如以下方式：

```python
with gr.Blocks(theme=gr.themes.Default(font=[gr.themes.GoogleFont("Inconsolata"), "Arial", "sans-serif"])) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-3.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

## 通过 `.set()` 扩展主题

主题加载后，您还可以修改 CSS 变量的值。为此，请使用主题对象的 `.set()` 方法来访问 CSS 变量。例如：

```python
theme = gr.themes.Default(primary_hue="blue").set(    loader_color="#FF0000",    slider_color="#FF0000",)
使用`gr.Blocks(theme=theme)`创建演示块    ...
```

在上面的示例中，我们将 `loader_color` 和 `slider_color` 变量设置为`#FF0000`，尽管整体 `primary_color` 使用蓝色调色板。您可以以这种方式设置主题中定义的任何 CSS 变量。
您的 IDE 类型提示应该帮助您导航这些变量。由于有很多 CSS 变量，让我们看一下这些变量的命名和组织方式。

### CSS 变量命名规范

CSS 变量名可能会变得很长，例如 `button_primary_background_fill_hover_dark`！但是它们遵循一种常见的命名约定，使得理解变量功能和查找您要查找的变量变得容易。变量名由下划线分隔，由以下组成：

1. 目标元素，例如 `button`、`slider` 或 `block`。2. 目标元素类型或子元素，例如 `button_primary` 或 `block_label`。3. 属性，例如 `button_primary_background_fill` 或 `block_label_border_width`。4. 任何相关状态，例如 `button_primary_background_fill_hover`。5. 如果在暗模式中值不同，则使用后缀 `_dark`。例如，`input_border_color_focus_dark`。
   当然，许多 CSS 变量名都比这个短，例如 `table_border_color` 或 `input_shadow`。

### CSS 变量组织

虽然有数百个 CSS 变量，但并不需要为每个变量都指定单独的值。它们通过引用一组核心变量和彼此引用来获取值。这样做可以仅修改少量变量以改变整个主题的外观和感觉，同时也可以更精细地控制我们可能想要修改的个别元素。

#### 引用核心变量

要引用其中一个核心构造函数变量，请在变量名前加上星号。要引用核心颜色，请使用`*primary_`、`*secondary_` 或`*neutral_` 前缀，后跟亮度值。例如：

```python
theme = gr.themes.Default(primary_hue="blue").set(
    button_primary_background_fill="*primary_200",
    button_primary_background_fill_hover="*primary_300",
)
```

在上面的示例中，我们将 `button_primary_background_fill` 和 `button_primary_background_fill_hover` 变量分别设置为`*primary_200` 和`*primary_300`。这些变量将分别设置为蓝色主色调调色板的 200 和 300 亮度值。
同样地，要引用核心大小，请使用`*spacing_`、`*radius_` 或`*text_` 前缀，后跟大小值。例如：

```python
theme = gr.themes.Default(radius_size="md").set(
    button_primary_border_radius="*radius_xl",
)
```

在上面的示例中，我们将 `button_primary_border_radius` 变量设置为`*radius_xl`。此变量将设置为中等半径大小范围的 `xl` 设置。

#### 引用其他变量

变量也可以引用彼此。例如，请看下面的示例：

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_hover="#FF0000",
    button_primary_border="#FF0000",
)
```

将这些值设置为相同的颜色有点繁琐。相反，我们可以在 `button_primary_background_fill_hover` 和 `button_primary_border` 变量中使用`*` 前缀引用 `button_primary_background_fill` 变量。

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_hover="*button_primary_background_fill",
    button_primary_border="*button_primary_background_fill",
)
```

现在，如果我们更改 `button_primary_background_fill` 变量，`button_primary_background_fill_hover` 和 `button_primary_border` 变量将自动更新。
如果您打算共享主题，这将非常有用- 它使得修改主题变得容易，而无需更改每个变量。
请注意，暗模式变量自动相互引用。例如：

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_dark="#AAAAAA",
    button_primary_border="*button_primary_background_fill",
    button_primary_border_dark="*button_primary_background_fill_dark",
)
```

`button_primary_border_dark` 将从 `button_primary_background_fill_dark` 获取其值，因为暗模式总是使用变量的暗版本。

## 创建一个完整的主题

假设您想从头开始创建一个主题！我们将逐步进行 - 您还可以参考 gradio 源代码库中预构建主题的源代码，请看这里的示例：[Monochrome theme 的源代码](https://github.com/gradio-app/gradio/blob/main/gradio/themes/monochrome.py)
我们的新主题类将继承自 `gradio.themes.Base`，这是一个设置了许多方便默认值的主题。让我们创建一个名为 Seafoam 的简单演示，以及使用它的简单应用程序。
$code_theme_new_step_1

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-1.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

Base 主题非常简洁，使用 `gr.themes.Blue` 作为其主要颜色-由于此原因，主按钮和加载动画都是蓝色的。让我们改变应用程序的默认核心参数。我们将覆盖构造函数并传递新的默认值给核心构造函数参数。
我们将使用 `gr.themes.Emerald` 作为我们的主要颜色，并将次要和中性色调设置为 `gr.themes.Blue`。我们将使用 `text_lg` 使文本更大。我们将使用 `Quicksand` 作为我们的默认字体，从 Google Fonts 加载。
$code_theme_new_step_2

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-2.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

注意到主按钮和加载动画现在是绿色的了吗？这些 CSS 变量与 `primary_hue` 相关联。
我们来直接修改主题。我们将调用 `set()` 方法来明确覆盖 CSS 变量值。我们可以使用任何 CSS 逻辑，并使用`*` 前缀引用我们的核心构造函数的参数。

$code_theme_new_step_3

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-3.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

看看我们的主题现在多么有趣！仅通过几个变量的更改，我们的主题完全改变了。

您可能会发现探索[其他预建主题的源代码](https://github.com/gradio-app/gradio/blob/main/gradio/themes)会很有帮助，以了解他们如何修改基本主题。您还可以使用浏览器的检查工具，选择 UI 中的元素并查看在样式面板中使用的 CSS 变量。

## 分享主题

在创建主题后，您可以将其上传到 HuggingFace Hub，让其他人查看、使用和构建主题！

### 上传主题

有两种上传主题的方式，通过主题类实例或命令行。我们将使用之前创建的“seafoam”主题来介绍这两种方式。

- 通过类实例

每个主题实例都有一个名为“push_to_hub”的方法，我们可以使用它来将主题上传到 HuggingFace Hub。

```python
seafoam.push_to_hub(repo_name="seafoam",
                    version="0.0.1",
					hf_token="<token>")
```

- 通过命令行

首先将主题保存到磁盘

```python
seafoam.dump(filename="seafoam.json")
```

然后使用“upload_theme”命令：

```bash
upload_theme\
"seafoam.json"\
"seafoam"\
--version "0.0.1"\
--hf_token "<token>"
```

要上传主题，您必须拥有一个 HuggingFace 账户，并通过 `hf_token` 参数传递您的[访问令牌](https://huggingface.co/docs/huggingface_hub/quick-start#login)。
但是，如果您通过[HuggingFace 命令行](https://huggingface.co/docs/huggingface_hub/quick-start#login)登录（与 `gradio` 一起安装），
那么您可以省略 `hf_token` 参数。

`version` 参数允许您为主题指定一个有效的[语义版本](https://www.geeksforgeeks.org/introduction-semantic-versioning/)字符串。
这样，您的用户就可以在他们的应用程序中指定要使用的主题版本。这还允许您发布主题更新而不必担心
以前创建的应用程序的外观如何更改。`version` 参数是可选的。如果省略，下一个修订版本将自动应用。

### 主题预览

通过调用 `push_to_hub` 或 `upload_theme`，主题资源将存储在[HuggingFace 空间](https://huggingface.co/docs/hub/spaces-overview)中。

我们的 seafoam 主题的预览在这里：[seafoam 预览](https://huggingface.co/spaces/gradio/seafoam)。

<div class="wrapper">
<iframe
	src="https://gradio-seafoam.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

### 发现主题

[主题库](https://huggingface.co/spaces/gradio/theme-gallery)显示了所有公开的 gradio 主题。在发布主题之后，
它将在几分钟后自动显示在主题库中。

您可以按照空间上点赞的数量以及按创建时间从最近到最近对主题进行排序，也可以在浅色和深色模式之间切换主题。

<div class="wrapper">
<iframe
	src="https://gradio-theme-gallery.hf.space"
	frameborder="0"
></iframe>
</div>

### 下载

要使用 Hub 中的主题，请在 `ThemeClass` 上使用 `from_hub` 方法，然后将其传递给您的应用程序：

```python
my_theme = gr.Theme.from_hub("gradio/seafoam")

with gr.Blocks(theme=my_theme) as demo:
    ....
```

您也可以直接将主题字符串传递给 `Blocks` 或 `Interface`（`gr.Blocks(theme="gradio/seafoam")`）

您可以通过使用语义版本表达式将您的应用程序固定到上游主题版本。

例如，以下内容将确保我们从“seafoam”仓库中加载的主题位于 `0.0.1` 和 `0.1.0` 版本之间：

```python
with gr.Blocks(theme="gradio/seafoam@>=0.0.1,<0.1.0") as demo:
    ....
```

享受创建自己的主题吧！如果您制作了一个自豪的主题，请将其上传到 Hub 与世界分享！
如果在[Twitter](https://twitter.com/gradio)上标记我们，我们可以给您的主题一个宣传！

<style>
.wrapper {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 25px;
    height: 0;
}
.wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>

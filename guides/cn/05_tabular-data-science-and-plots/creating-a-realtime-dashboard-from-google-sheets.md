# 从 Google Sheets 创建实时仪表盘

Tags: TABULAR, DASHBOARD, PLOTS
[Google Sheets](https://www.google.com/sheets/about/) 是一种以电子表格形式存储表格数据的简便方法。借助 Gradio 和 pandas，可以轻松从公共或私有 Google Sheets 读取数据，然后显示数据或绘制数据。在本博文中，我们将构建一个小型 _real-time_ 仪表盘，该仪表盘在 Google Sheets 中的数据更新时进行更新。
构建仪表盘本身只需要使用 Gradio 的 9 行 Python 代码，我们的最终仪表盘如下所示：
<gradio-app space="gradio/line-plot"></gradio-app>

**先决条件**：本指南使用[Gradio Blocks](../quickstart/#blocks-more-flexibility-and-control)，因此请确保您熟悉 Blocks 类。
具体步骤略有不同，具体取决于您是使用公开访问还是私有 Google Sheet。我们将分别介绍这两种情况，所以让我们开始吧！

## Public Google Sheets

由于[`pandas` 库](https://pandas.pydata.org/)的存在，从公共 Google Sheet 构建仪表盘非常简单：

1. 获取要使用的 Google Sheets 的网址。为此，只需进入 Google Sheets，单击右上角的“共享”按钮，然后单击“获取可共享链接”按钮。这将给您一个类似于以下示例的网址：

```html
https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0
```

2. 现在，修改此网址并使用它从 Google Sheets 读取数据到 Pandas DataFrame 中。 (在下面的代码中，用您的公开 Google Sheet 的网址替换 `URL` 变量)：

```python
import pandas as pd
URL = "https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0"csv_url = URL.replace('/edit#gid=', '/export?format=csv&gid=')
def get_data():
    return pd.read_csv(csv_url)
```

3. 数据查询是一个函数，这意味着可以使用 `gr.DataFrame` 组件实时显示或使用 `gr.LinePlot` 组件实时绘制数据（当然，根据数据的不同，可能需要不同的绘图方法）。只需将函数传递给相应的组件，并根据组件刷新的频率（以秒为单位）设置 `every` 参数。以下是 Gradio 代码：

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# 📈 Real-Time Line Plot")
    with gr.Row():
        with gr.Column():
            gr.DataFrame(get_data, every=gr.Timer(5))
        with gr.Column():
            gr.LinePlot(get_data, every=gr.Timer(5), x="Date", y="Sales", y_title="Sales ($ millions)", overlay_point=True, width=500, height=500)

demo.queue().launch()  # Run the demo with queuing enabled
```

到此为止！您现在拥有一个仪表盘，每 5 秒刷新一次，从 Google Sheets 中获取数据。

## 私有 Google Sheets

对于私有 Google Sheets，流程需要更多的工作量，但并不多！关键区别在于，现在您必须经过身份验证，以授权访问私有 Google Sheets。

### 身份验证

要进行身份验证，需从 Google Cloud 获取凭据。以下是[如何设置 Google Cloud 凭据](https://developers.google.com/workspace/guides/create-credentials)：

1. 首先，登录您的 Google Cloud 帐户并转到 Google Cloud 控制台（https://console.cloud.google.com/）
2. 在 Cloud 控制台中，单击左上角的汉堡菜单，然后从菜单中选择“API 和服务”。如果您没有现有项目，则需要创建一个。
3. 然后，点击“+ 启用的 API 和服务”按钮，允许您为项目启用特定的服务。搜索“Google Sheets API”，点击它，然后单击“启用”按钮。如果看到“管理”按钮，则表示 Google Sheets 已启用，并且您已准备就绪。
4. 在 API 和服务菜单中，点击“凭据”选项卡，然后点击“创建凭据”按钮。
5. 在“创建凭据”对话框中，选择“服务帐号密钥”作为要创建的凭据类型，并为其命名。**记下服务帐号的电子邮件地址**
6. 在选择服务帐号之后，选择“JSON”密钥类型，然后点击“创建”按钮。这将下载包含您凭据的 JSON 密钥文件到您的计算机。文件类似于以下示例：

```json
{
	"type": "service_account",
	"project_id": "your project",
	"private_key_id": "your private key id",
	"private_key": "private key",
	"client_email": "email",
	"client_id": "client id",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://accounts.google.com/o/oauth2/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/email_id"
}
```

### 查询

在获得凭据的 `.json` 文件后，可以按照以下步骤查询您的 Google Sheet：

1. 单击 Google Sheet 右上角的“共享”按钮。使用身份验证子部分第 5 步的服务的电子邮件地址共享 Google Sheets（此步骤很重要！）。然后单击“获取可共享链接”按钮。这将给您一个类似于以下示例的网址：

```html
https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0
```

2. 安装 [`gspread` 库](https://docs.gspread.org/en/v5.7.0/)，通过在终端运行以下命令使 Python 中使用 [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts) 更加简单：`pip install gspread`
3. 编写一个函数来从 Google Sheet 中加载数据，如下所示（用您的私有 Google Sheet 的 URL 替换 `URL` 变量）：

```python
import gspreadimport pandas as pd
# 与 Google 进行身份验证并获取表格URL = 'https://docs.google.com/spreadsheets/d/1_91Vps76SKOdDQ8cFxZQdgjTJiz23375sAT7vPvaj4k/edit#gid=0'
gc = gspread.service_account("path/to/key.json")sh = gc.open_by_url(URL)worksheet = sh.sheet1
def get_data():
    values = worksheet.get_all_values()
    df = pd.DataFrame(values[1:], columns=values[0])
    return df
```

4\. 数据查询是一个函数，这意味着可以使用 `gr.DataFrame` 组件实时显示数据，或使用 `gr.LinePlot` 组件实时绘制数据（当然，根据数据的不同，可能需要使用不同的图表）。要实现这一点，只需将函数传递给相应的组件，并根据需要设置 `every` 参数来确定组件刷新的频率（以秒为单位）。以下是 Gradio 代码：

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# 📈 实时折线图")
    with gr.Row():
        with gr.Column():
            gr.DataFrame(get_data, every=gr.Timer(5))
        with gr.Column():
            gr.LinePlot(get_data, every=gr.Timer(5), x="日期", y="销售额", y_title="销售额（百万美元）", overlay_point=True, width=500, height=500)

demo.queue().launch()  # 启动带有排队功能的演示
```

现在你有一个每 5 秒刷新一次的仪表盘，可以从你的 Google 表格中获取数据。

## 结论

就是这样！只需几行代码，你就可以使用 `gradio` 和其他库从公共或私有的 Google 表格中读取数据，然后在实时仪表盘中显示和绘制数据。

# 从 Supabase 数据创建仪表盘

Tags: TABULAR, DASHBOARD, PLOTS

[Supabase](https://supabase.com/) 是一个基于云的开源后端，提供了 PostgreSQL 数据库、身份验证和其他有用的功能，用于构建 Web 和移动应用程序。在本教程中，您将学习如何从 Supabase 读取数据，并在 Gradio 仪表盘上以**实时**方式绘制数据。

**先决条件 :** 要开始，您需要一个免费的 Supabase 账户，您可以在此处注册：[https://app.supabase.com/](https://app.supabase.com/)

在这个端到端指南中，您将学习如何：

- 在 Supabase 中创建表
- 使用 Supabase Python 客户端向 Supabase 写入数据
- 使用 Gradio 在实时仪表盘中可视化数据

如果您已经在 Supabase 上有数据想要在仪表盘中可视化，您可以跳过前两个部分，直接到[可视化数据](#visualize-the-data-in-a-real-time-gradio-dashboard)！

## 在 Supabase 中创建表

首先，我们需要一些要可视化的数据。根据这个[出色的指南](https://supabase.com/blog/loading-data-supabase-python)，我们将创建一些虚假的商务数据，并将其放入 Supabase 中。

1\. 在 Supabase 中创建一个新项目。一旦您登录，点击 "New Project" 按钮

2\. 给您的项目命名并设置数据库密码。您还可以选择定价计划（对于我们来说，免费计划已足够！）

3\. 在数据库启动时（可能需要多达 2 分钟），您将看到您的 API 密钥。

4\. 在左侧窗格中单击 "Table Editor"（表图标）以创建一个新表。我们将创建一个名为 `Product` 的单表，具有以下模式：

<center>
<table>
<tr><td>product_id</td><td>int8</td></tr>
<tr><td>inventory_count</td><td>int8</td></tr>
<tr><td>price</td><td>float8</td></tr>
<tr><td>product_name</td><td>varchar</td></tr>
</table>
</center>

5\. 点击保存以保存表结构。

我们的表已经准备好了！

## 将数据写入 Supabase

下一步是向 Supabase 数据集中写入数据。我们将使用 Supabase Python 库来完成这个任务。

6\. 通过在终端中运行以下命令来安装 `supabase` 库：

```bash
pip install supabase
```

7\. 获取项目 URL 和 API 密钥。点击左侧窗格上的设置（齿轮图标），然后点击 'API'。URL 列在项目 URL 框中，API 密钥列在项目 API 密钥（带有 `service_role`、`secret` 标签）中

8\. 现在，运行以下 Python 脚本将一些虚假数据写入表中（注意您需要在步骤 7 中放入 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` 的值）：

```python
import supabase

# 初始化Supabase客户端
client = supabase.create_client('SUPABASE_URL', 'SUPABASE_SECRET_KEY')

# 定义要写入的数据
import random

main_list = []
for i in range(10):
    value = {'product_id': i,
             'product_name': f"Item {i}",
             'inventory_count': random.randint(1, 100),
             'price': random.random()*100
            }
    main_list.append(value)

# 将数据写入表中
data = client.table('Product').insert(main_list).execute()
```

返回 Supabase 仪表板并刷新页面，您将看到 10 行数据填充到 `Product` 表中！

## 在实时 Gradio 仪表盘中可视化数据

最后，我们将使用相同的 `supabase` Python 库从 Supabase 数据集中读取数据，并使用 `gradio` 创建一个实时仪表盘。

注意：我们在本节中重复了某些步骤（比如创建 Supabase 客户端），以防您没有完成之前的部分。如第 7 步所述，您将需要数据库的项目 URL 和 API 密钥。

9\. 编写一个函数，从 `Product` 表加载数据并将其作为 pandas DataFrame 返回：

import supabase

```python
import supabase
import pandas as pd

client = supabase.create_client('SUPABASE_URL', 'SUPABASE_SECRET_KEY')

def read_data():
    response = client.table('Product').select("*").execute()
    df = pd.DataFrame(response.data)
    return df
```

10\. 使用两个条形图创建一个小的 Gradio 仪表盘，每分钟绘制所有项目的价格和库存量，并实时更新：

```python
import gradio as gr

with gr.Blocks() as dashboard:
    with gr.Row():
        gr.BarPlot(read_data, x="product_id", y="price", title="价格", every=gr.Timer(60))
        gr.BarPlot(read_data, x="product_id", y="inventory_count", title="库存", every=gr.Timer(60))

dashboard.queue().launch()
```

请注意，通过将函数传递给 `gr.BarPlot()`，我们可以在网络应用加载时查询数据库（然后每 60 秒查询一次，因为有 `every` 参数）。您的最终仪表盘应如下所示：

<gradio-app space="abidlabs/supabase"></gradio-app>

## 结论

就是这样！在本教程中，您学习了如何将数据写入 Supabase 数据集，然后读取该数据并将结果绘制为条形图。如果您更新 Supabase 数据库中的数据，您会注意到 Gradio 仪表盘将在一分钟内更新。

尝试在此示例中添加更多绘图和可视化（或使用不同的数据集），以构建一个更复杂的仪表盘！

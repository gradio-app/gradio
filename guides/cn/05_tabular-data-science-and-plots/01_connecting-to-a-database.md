# 连接到数据库

相关空间：https://huggingface.co/spaces/gradio/chicago-bike-share-dashboard
标签：TABULAR, PLOTS

## 介绍

本指南介绍如何使用 Gradio 连接您的应用程序到数据库。我们将会
连接到在 AWS 上托管的 PostgreSQL 数据库，但 Gradio 对于您连接的数据库类型和托管位置没有任何限制。因此，只要您能编写 Python 代码来连接
您的数据，您就可以使用 Gradio 在 Web 界面中显示它 💪

## 概述

我们将分析来自芝加哥的自行车共享数据。数据托管在 kaggle [这里](https://www.kaggle.com/datasets/evangower/cyclistic-bike-share?select=202203-divvy-tripdata.csv)。
我们的目标是创建一个仪表盘，让我们的业务利益相关者能够回答以下问题：

1. 电动自行车是否比普通自行车更受欢迎？
2. 哪些出发自行车站点最受欢迎？

在本指南结束时，我们将拥有一个如下所示的功能齐全的应用程序：

<gradio-app space="gradio/chicago-bike-share-dashboard"> </gradio-app>

## 步骤 1 - 创建数据库

我们将在 Amazon 的 RDS 服务上托管我们的数据。如果还没有 AWS 账号，请创建一个
并在免费层级上创建一个 PostgreSQL 数据库。

**重要提示**：如果您计划在 HuggingFace Spaces 上托管此演示，请确保数据库在 **8080** 端口上。Spaces
将阻止除端口 80、443 或 8080 之外的所有外部连接，如此[处所示](https://huggingface.co/docs/hub/spaces-overview#networking)。
RDS 不允许您在 80 或 443 端口上创建 postgreSQL 实例。

创建完数据库后，从 Kaggle 下载数据集并将其上传到数据库中。
为了演示的目的，我们只会上传 2022 年 3 月的数据。

## 步骤 2.a - 编写 ETL 代码

我们将查询数据库，按自行车类型（电动、标准或有码）进行分组，并获取总骑行次数。
我们还将查询每个站点的出发骑行次数，并获取前 5 个。

然后，我们将使用 matplotlib 将查询结果可视化。

我们将使用 pandas 的[read_sql](https://pandas.pydata.org/docs/reference/api/pandas.read_sql.html)
方法来连接数据库。这需要安装 `psycopg2` 库。

为了连接到数据库，我们将指定数据库的用户名、密码和主机作为环境变量。
这样可以通过避免将敏感信息以明文形式存储在应用程序文件中，使我们的应用程序更安全。

```python
import os
import pandas as pd
import matplotlib.pyplot as plt

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
PORT = 8080
DB_NAME = "bikeshare"

connection_string = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}?port={PORT}&dbname={DB_NAME}"

def get_count_ride_type():
    df = pd.read_sql(
    """
        SELECT COUNT(ride_id) as n, rideable_type
        FROM rides
        GROUP BY rideable_type
        ORDER BY n DESC
    """,
    con=connection_string
    )
    fig_m, ax = plt.subplots()
    ax.bar(x=df['rideable_type'], height=df['n'])
    ax.set_title("Number of rides by bycycle type")
    ax.set_ylabel("Number of Rides")
    ax.set_xlabel("Bicycle Type")
    return fig_m


def get_most_popular_stations():

    df = pd.read_sql(
        """
    SELECT COUNT(ride_id) as n, MAX(start_station_name) as station
    FROM RIDES
    WHERE start_station_name is NOT NULL
    GROUP BY start_station_id
    ORDER BY n DESC
    LIMIT 5
    """,
    con=connection_string
    )
    fig_m, ax = plt.subplots()
    ax.bar(x=df['station'], height=df['n'])
    ax.set_title("Most popular stations")
    ax.set_ylabel("Number of Rides")
    ax.set_xlabel("Station Name")
    ax.set_xticklabels(
        df['station'], rotation=45, ha="right", rotation_mode="anchor"
    )
    ax.tick_params(axis="x", labelsize=8)
    fig_m.tight_layout()
    return fig_m
```

如果您在本地运行我们的脚本，可以像下面这样将凭据作为环境变量传递：

```bash
DB_USER='username' DB_PASSWORD='password' DB_HOST='host' python app.py
```

## 步骤 2.c - 编写您的 gradio 应用程序

我们将使用两个单独的 `gr.Plot` 组件将我们的 matplotlib 图表并排显示在一起，使用 `gr.Row()`。
因为我们已经在 `demo.load()` 事件触发器中封装了获取数据的函数，
我们的演示将在每次网页加载时从数据库**动态**获取最新数据。🪄

```python
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        bike_type = gr.Plot()
        station = gr.Plot()

    demo.load(get_count_ride_type, inputs=None, outputs=bike_type)
    demo.load(get_most_popular_stations, inputs=None, outputs=station)

demo.launch()
```

## 步骤 3 - 部署

如果您运行上述代码，您的应用程序将在本地运行。
您甚至可以通过将 `share=True` 参数传递给 `launch` 来获得一个临时共享链接。

但是如果您想要一个永久的部署解决方案呢？
让我们将我们的 Gradio 应用程序部署到免费的 HuggingFace Spaces 平台上。

如果您之前没有使用过 Spaces，请按照之前的指南[这里](/using_hugging_face_integrations)进行操作。
您将需要将 `DB_USER`、`DB_PASSWORD` 和 `DB_HOST` 变量添加为 "Repo Secrets"。您可以在 " 设置 " 选项卡中进行此操作。

![secrets](/assets/guides/secrets.png)

## 结论

恭喜你！您知道如何将您的 Gradio 应用程序连接到云端托管的数据库！☁️

我们的仪表板现在正在[Spaces](https://huggingface.co/spaces/gradio/chicago-bike-share-dashboard)上运行。
完整代码在[这里](https://huggingface.co/spaces/gradio/chicago-bike-share-dashboard/blob/main/app.py)

正如您所见，Gradio 使您可以连接到您的数据并以您想要的方式显示！🔥

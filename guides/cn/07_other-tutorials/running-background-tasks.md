# 运行后台任务

Related spaces: https://huggingface.co/spaces/freddyaboulton/gradio-google-forms
Tags: TASKS, SCHEDULED, TABULAR, DATA

## 简介

本指南介绍了如何从 gradio 应用程序中运行后台任务。
后台任务是在您的应用程序的请求-响应生命周期之外执行的操作，可以是一次性的或定期的。
后台任务的示例包括定期将数据与外部数据库同步或通过电子邮件发送模型预测报告。

## 概述

我们将创建一个简单的“Google Forms”风格的应用程序，用于收集 gradio 库的用户反馈。
我们将使用一个本地 sqlite 数据库来存储数据，但我们将定期将数据库的状态与[HuggingFace Dataset](https://huggingface.co/datasets)同步，以便始终备份我们的用户评论。
同步将在每 60 秒运行的后台任务中进行。

在演示结束时，您将拥有一个完全可工作的应用程序，类似于以下应用程序 :

<gradio-app space="freddyaboulton/gradio-google-forms"> </gradio-app>

## 第一步 - 编写数据库逻辑 💾

我们的应用程序将存储评论者的姓名，他们对 gradio 给出的评分（1 到 5 的范围），以及他们想要分享的关于该库的任何评论。让我们编写一些代码，创建一个数据库表来存储这些数据。我们还将编写一些函数，以将评论插入该表中并获取最新的 10 条评论。

我们将使用 `sqlite3` 库来连接我们的 sqlite 数据库，但 gradio 可以与任何库一起使用。

代码如下 :

```python
DB_FILE = "./reviews.db"
db = sqlite3.connect(DB_FILE)

# Create table if it doesn't already exist
try:
    db.execute("SELECT * FROM reviews").fetchall()
    db.close()
except sqlite3.OperationalError:
    db.execute(
        '''
        CREATE TABLE reviews (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                              name TEXT, review INTEGER, comments TEXT)
        ''')
    db.commit()
    db.close()

def get_latest_reviews(db: sqlite3.Connection):
    reviews = db.execute("SELECT * FROM reviews ORDER BY id DESC limit 10").fetchall()
    total_reviews = db.execute("Select COUNT(id) from reviews").fetchone()[0]
    reviews = pd.DataFrame(reviews, columns=["id", "date_created", "name", "review", "comments"])
    return reviews, total_reviews


def add_review(name: str, review: int, comments: str):
    db = sqlite3.connect(DB_FILE)
    cursor = db.cursor()
    cursor.execute("INSERT INTO reviews(name, review, comments) VALUES(?,?,?)", [name, review, comments])
    db.commit()
    reviews, total_reviews = get_latest_reviews(db)
    db.close()
    return reviews, total_reviews
```

让我们还写一个函数，在 gradio 应用程序加载时加载最新的评论 :

```python
def load_data():
    db = sqlite3.connect(DB_FILE)
    reviews, total_reviews = get_latest_reviews(db)
    db.close()
    return reviews, total_reviews
```

## 第二步 - 创建 gradio 应用 ⚡

现在我们已经定义了数据库逻辑，我们可以使用 gradio 创建一个动态的网页来询问用户的反馈意见！

使用以下代码段 :

```python
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            name = gr.Textbox(label="Name", placeholder="What is your name?")
            review = gr.Radio(label="How satisfied are you with using gradio?", choices=[1, 2, 3, 4, 5])
            comments = gr.Textbox(label="Comments", lines=10, placeholder="Do you have any feedback on gradio?")
            submit = gr.Button(value="Submit Feedback")
        with gr.Column():
            data = gr.Dataframe(label="Most recently created 10 rows")
            count = gr.Number(label="Total number of reviews")
    submit.click(add_review, [name, review, comments], [data, count])
    demo.load(load_data, None, [data, count])
```

## 第三步 - 与 HuggingFace 数据集同步 🤗

在第 2 步后我们可以调用 `demo.launch()` 来运行一个完整功能的应用程序。然而，我们的数据将存储在本地机器上。如果 sqlite 文件意外删除，我们将丢失所有评论！让我们将我们的数据备份到 HuggingFace hub 的数据集中。

在继续之前，请在[此处](https://huggingface.co/datasets)创建一个数据集。

现在，在我们脚本的**顶部**，我们将使用[huggingface hub 客户端库](https://huggingface.co/docs/huggingface_hub/index)连接到我们的数据集并获取最新的备份。

```python
TOKEN = os.environ.get('HUB_TOKEN')
repo = huggingface_hub.Repository(
    local_dir="data",
    repo_type="dataset",
    clone_from="<name-of-your-dataset>",
    use_auth_token=TOKEN
)
repo.git_pull()

shutil.copyfile("./data/reviews.db", DB_FILE)
```

请注意，您需要从 HuggingFace 的“设置”选项卡中获取访问令牌，以上代码才能正常工作。在脚本中，通过环境变量安全访问令牌。

![access_token](/assets/guides/access_token.png)

现在，我们将创建一个后台任务，每 60 秒将我们的本地数据库与数据集中的数据同步一次。
我们将使用[AdvancedPythonScheduler](https://apscheduler.readthedocs.io/en/3.x/)来处理调度。
然而，这并不是唯一可用的任务调度库。请随意使用您熟悉的任何库。

备份数据的函数如下 :

```python
from apscheduler.schedulers.background import BackgroundScheduler

def backup_db():
    shutil.copyfile(DB_FILE, "./data/reviews.db")
    db = sqlite3.connect(DB_FILE)
    reviews = db.execute("SELECT * FROM reviews").fetchall()
    pd.DataFrame(reviews).to_csv("./data/reviews.csv", index=False)
    print("updating db")
    repo.push_to_hub(blocking=False, commit_message=f"Updating data at {datetime.datetime.now()}")


scheduler = BackgroundScheduler()
scheduler.add_job(func=backup_db, trigger="interval", seconds=60)
scheduler.start()
```

## 第四步（附加）- 部署到 HuggingFace Spaces

您可以使用 HuggingFace [Spaces](https://huggingface.co/spaces) 平台免费部署这个应用程序 ✨

如果您之前没有使用过 Spaces，请查看[此处](/using_hugging_face_integrations)的先前指南。
您将需要将 `HUB_TOKEN` 环境变量作为指南中的一个秘密使用。

## 结论

恭喜！您知道如何在您的 gradio 应用程序中按计划运行后台任务⏲️。

在 Spaces 上运行的应用程序可在[此处](https://huggingface.co/spaces/freddyaboulton/gradio-google-forms)查看。
完整的代码在[此处](https://huggingface.co/spaces/freddyaboulton/gradio-google-forms/blob/main/app.py)。

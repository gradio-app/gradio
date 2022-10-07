# Running Background Tasks 

Related spaces: https://huggingface.co/spaces/freddyaboulton/gradio-google-forms
Tags: TASKS, SCHEDULED, TABULAR, DATA 

## Introduction

This guide explains how you can run background tasks from your gradio app.
Background tasks are operations that you'd like to perform outside the request-response
lifecycle of your app either once or on a periodic schedule.
Examples of background tasks include periodically synchronizing data to an external database or 
sending a report of model predictions via email.

## Overview 
    
We will be creating a simple "Google-forms-style" application to gather feedback from users of the gradio library.
We will use a local sqlite database to store our data, but we will periodically synchronize the state of the database
with a [HuggingFace Dataset](https://huggingface.co/datasets) so that our user reviews are always backed up.
The synchronization will happen in a background task running every 60 seconds.

At the end of the demo, you'll have a fully working application like this one:

<gradio-app space="freddyaboulton/gradio-google-forms"> </gradio-app>


## Step 1 - Write your database logic 💾
Our application will store the name of the reviewer, their rating of gradio on a scale of 1 to 5, as well as
any comments they want to share about the library. Let's write some code that creates a database table to
store this data. We'll also write some functions to insert a review into that table and fetch the latest 10 reviews.

We're going to use the `sqlite3` library to connect to our sqlite database but gradio will work with any library.

The code will look like this:

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

Let's also write a function to load the latest reviews when the gradio application loads:
```python
def load_data():
    db = sqlite3.connect(DB_FILE)
    reviews, total_reviews = get_latest_reviews(db)
    db.close()
    return reviews, total_reviews
```

## Step 2 - Create a gradio app ⚡
Now that we have our database logic defined, we can use gradio create a dynamic web page to ask our users for feedback! 

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

## Step 3 - Synchronize with HuggingFace Datasets 🤗

We could call `demo.launch()` after step 2 and have a fully functioning application. However,
our data would be stored locally on our machine. If the sqlite file were accidentally deleted, we'd lose all of our reviews!
Let's back up our data to a dataset on the HuggingFace hub.

Create a dataset [here](https://huggingface.co/datasets) before proceeding.

Now at the **top** of our script, we'll use the [huggingface hub client library](https://huggingface.co/docs/huggingface_hub/index)
to connect to our dataset and pull the latest backup.

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

Note that you'll have to get an access token from the "Settings" tab of your HuggingFace for the above code to work.
In the script, the token is securely accessed via an environment variable.

![access_token](/assets/guides/access_token.png)

Now we will create a background task to synch our local database to the dataset hub every 60 seconds.
We will use the [AdvancedPythonScheduler](https://apscheduler.readthedocs.io/en/3.x/) to handle the scheduling.
However, this is not the only task scheduling library available. Feel free to use whatever you are comfortable with.

The function to back up our data will look like this:

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


## Step 4 (Bonus) - Deployment to HuggingFace Spaces
You can use the HuggingFace [Spaces](https://huggingface.co/spaces) platform to deploy this application for free ✨

If you haven't used Spaces before, follow the previous guide [here](/using_hugging_face_integrations).
You will have to use the `HUB_TOKEN` environment variable as a secret in the Guides.

## Conclusion
Congratulations! You know how to run background tasks from your gradio app on a schedule ⏲️.  

Checkout the application running on Spaces [here](https://huggingface.co/spaces/freddyaboulton/gradio-google-forms).
The complete code is [here](https://huggingface.co/spaces/freddyaboulton/gradio-google-forms/blob/main/app.py)
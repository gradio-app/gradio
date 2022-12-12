# Using Gradio with Google BigQuery

Google BigQuery is a cloud-based big data analytics web service for processing very large read-only data sets. It is a serverless, highly scalable, and cost-effective data warehousing solution that enables users to analyze data using SQL-like queries.

One popular dataset that is available on BigQuery is the Global Surface Summary of the Day (gsod) dataset, which contains daily weather measurements from over 9,000 weather stations around the world.

In this tutorial, we will show you how to query a BigQuery dataset in Python and display the data using Gradio.

First, you need to install the BigQuery and Gradio libraries in Python. You can do this by running the following commands:

`pip install google-cloud-bigquery gradio`

The `google-cloud-bigquery` package provides a simple API that allows you to connect to your BigQuery dataset and execute SQL queries.

Here is an example of how to query the gsod dataset in BigQuery using Python:

```py
from google.cloud import bigquery

# create a client for interacting with BigQuery
client = bigquery.Client()

# set the dataset and table to query
dataset_id = "bigquery-public-data"
table_id = "noaa_gsod"

# construct the full table name
table_name = f"{dataset_id}.{table_id}"

# query the table
query = f"SELECT * FROM {table_name} WHERE year = 2021"
query_job = client.query(query)
results = query_job.result()

# print the first 10 rows of the results
for row in results[:10]:
    print(row)
```

Once you have queried the data, you can use the gr.DataFrame component from the Gradio library to display the results in a tabular format. This is a useful way to inspect the data and make sure that it has been queried correctly.

Here is an example of how to use the `gr.DataFrame` component to display the results of a query:

```py
import gradio as gr

# create a DataFrame component
df = gr.DataFrame(results)

# display the DataFrame
df.launch()
```

Finally, you can use the gr.ScatterPlot component to visualize the data in a scatter plot. This allows you to see the relationship between different variables in the dataset and can be useful for exploring the data and gaining insights.

Here is an example of how to use the gr.ScatterPlot component to plot the data:

```py
import gradio as gr

# create a ScatterPlot component
plot = gr.ScatterPlot(results, x="temperature", y="pressure")

# display the scatter plot
plot.launch()
```
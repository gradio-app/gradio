# Creating a Dashboard from Supabase Data

Tags: TABULAR, DASHBOARD, PLOTS 

Supabase is a cloud-based open-source backend that provides a PostgreSQL database, authentication, and other useful features for building web and mobile applications. In this tutorial, we will show you how to read data from Supabase plot it in **real-time** on a Gradio Dashboard.

**Prerequisites:** To start, you will need to have a free Supabase account, which you can sign up for here: https://app.supabase.com/

We'll cover the following steps in this end-to-end Guide:

* Creating tables in Supabase
* Writing data to Supabase using the Supabase Python Client
* Visualize the data in a real-time dashboard using Gradio

If you already have data on Supabase that you'd like to visualize in a dashboard, you can skip sections and first two sections and go directly to [visualizing the data]()!

## Creating a table in Supabase

First of all, we need some data to visualize. Following this [excellent guide](https://supabase.com/blog/loading-data-supabase-python), we'll create some fake commerce data and put it in Supabase. 

1. We'll start by creating a new project in Supabase. Once you're logged in, click the "New Project" button

2. Give your project a name and database password. You can also choose a pricing plan (for our purposes, the Free Tier is sufficient!)

3. You'll be presented with your API keys while the database spins up (can take up to 2 minutes). 

4. Click on "Table Editor" (the table icon) in the left pane to create a new table. We'll create a single table called `Product`, with the following schema:

<center>
<table>
<tr><td>product_id</td><td>int8</td></tr>
<tr><td>inventory_count</td><td>int8</td></tr>
<tr><td>price</td><td>float8</td></tr>
<tr><td>product_name</td><td>varchar</td></tr>
</table>
</center>

5. Click Save to save the table. Our schema is now ready!


## Writing data to Supabase

The next step is to write data to a Supabase dataset. We will use the Supabase Python library to do this. Start by installing `supabase`, typically by running in your terminal:

```bash
pip install supabase
```

```
import supabase

# Initialize the Supabase client
client = supabase.create_client('SUPABASE_URL', 'SUPABASE_ANON_KEY')

# Define the data to write
data = [
    {'country': 'United States', 'population': 331002651},
    {'country': 'India', 'population': 1380004385},
    {'country': 'China', 'population': 1439323776}
]

# Write the data to the dataset
client.table('population').insert(data).execute()
Replace SUPABASE_URL and SUPABASE_ANON_KEY with your Supabase URL and anonymous key. This code defines a list of dictionaries containing the country name and population, and then writes the data to the population dataset.

Reading data from a Supabase dataset
Next, we will read the data from the Supabase dataset using the same Supabase Python library.

python
Copy code
import supabase

# Initialize the Supabase client
client = supabase.create_client('SUPABASE_URL', 'SUPABASE_ANON_KEY')

# Read the data from the dataset
response = client.table('population').select().execute()

# Extract the data from the response
data = response.get('data')

# Print the data
print(data)
This code reads the data from the population dataset, extracts it from the response, and prints it to the console.

Plotting data with Gradio
Finally, we will use the Gradio library to plot the data in a bar chart.

python
Copy code
import gradio as gr
import pandas as pd

# Initialize the Supabase client
client = supabase.create_client('SUPABASE_URL', 'SUPABASE_ANON_KEY')

# Read the data from the dataset
response = client.table('population').select().execute()

# Extract the data from the response
data = response.get('data')

# Convert the data to a Pandas DataFrame
df = pd.DataFrame(data)

# Define the Gradio interface
inputs = gr.inputs.Dropdown(choices=list(df['country']))
outputs = gr.outputs.BarPlot()

# Define the function to plot the data
def plot_population(country):
    population = df.loc[df['country'] == country, 'population'].values[0]
    return {'x': [country], 'y': [population]}

# Launch the Gradio interface
gr.Interface(plot_population, inputs, outputs).launch()
This code reads the data from the population dataset, converts it to a Pandas DataFrame, and defines a Gradio interface with a dropdown to select a country and a bar chart to display the population. The plot_population function extracts the population for the selected country and returns a dictionary with the x and y values for the bar chart. Finally, the Gradio interface is launched, allowing you to select a country and see its population in a bar chart.

In this tutorial, we showed you how to write data to a Supabase dataset, read that
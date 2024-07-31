# Connecting to a Database

The data you wish to visualize may be stored in a database. Let's use SQLAlchemy to quickly extract database content into pandas Dataframe format so we can use it in gradio.

First install `pip install sqlalchemy` and then let's see some examples.

## SQLite

```python
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine('sqlite:///your_database.db')

with gr.Blocks() as demo:
    gr.LinePlot(pd.read_sql_query("SELECT time, price from flight_info;", engine), x="time", y="price")
```

Let's see a a more interactive plot involving filters that modify your SQL query:

```python
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine('sqlite:///your_database.db')

with gr.Blocks() as demo:
    origin = gr.Dropdown(["DFW", "DAL", "HOU"], value="DFW", label="Origin")

    gr.LinePlot(lambda origin: pd.read_sql_query(f"SELECT time, price from flight_info WHERE origin = {origin};", engine), inputs=origin, x="time", y="price")
```

## Postgres, mySQL, and other databases

If you're using a different database format, all you have to do is swap out the engine, e.g.

```python
engine = create_engine('postgresql://username:password@host:port/database_name')
```

```python
engine = create_engine('mysql://username:password@host:port/database_name')
```

```python
engine = create_engine('oracle://username:password@host:port/database_name')
```
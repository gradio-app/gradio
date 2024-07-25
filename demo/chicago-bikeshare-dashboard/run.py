import os
import gradio as gr
import pandas as pd

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
PORT = 8080
DB_NAME = "bikeshare"

connection_string = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}?port={PORT}&dbname={DB_NAME}"
)

def get_count_ride_type():
    df = pd.read_sql(
        """
        SELECT COUNT(ride_id) as n, rideable_type
        FROM rides
        GROUP BY rideable_type
        ORDER BY n DESC
    """,
        con=connection_string,
    )
    return df

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
        con=connection_string,
    )
    return df

with gr.Blocks() as demo:
    gr.Markdown(
        """
    # Chicago Bike Share Dashboard
    
    This demo pulls Chicago bike share data for March 2022 from a postgresql database hosted on AWS.
    This demo uses psycopg2 but any postgresql client library (SQLAlchemy)
    is compatible with gradio.
    
    Connection credentials are handled by environment variables
    defined as secrets in the Space.

    If data were added to the database, the plots in this demo would update
    whenever the webpage is reloaded.
    
    This demo serves as a starting point for your database-connected apps!
    """
    )
    with gr.Row():
        bike_type = gr.BarPlot(
            x="rideable_type",
            y='n',
            title="Number of rides per bicycle type",
            y_title="Number of Rides",
            x_title="Bicycle Type",
            vertical=False,
            tooltip=['rideable_type', "n"],
            height=300,
            width=300,
        )
        station = gr.BarPlot(
            x='station',
            y='n',
            title="Most Popular Stations",
            y_title="Number of Rides",
            x_title="Station Name",
            vertical=False,
            tooltip=['station', 'n'],
            height=300,
            width=300
        )

    demo.load(get_count_ride_type, inputs=None, outputs=bike_type)
    demo.load(get_most_popular_stations, inputs=None, outputs=station)

if __name__ == "__main__":
    demo.launch()

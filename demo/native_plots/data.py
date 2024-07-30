import pandas as pd
from random import randint, random

temp_sensor_data = pd.DataFrame(
    {
        "time": pd.date_range("2021-01-01", end="2021-01-05", periods=200),
        "temperature": [randint(50 + 10 * (i % 2), 65 + 15 * (i % 2)) for i in range(200)],
        "humidity": [randint(50 + 10 * (i % 2), 65 + 15 * (i % 2)) for i in range(200)],
        "location": ["indoor", "outdoor"] * 100,
    }
)

food_rating_data = pd.DataFrame(
    {
        "cuisine": [["Italian", "Mexican", "Chinese"][i % 3] for i in range(100)],
        "rating": [random() * 4 + 0.5 * (i % 3) for i in range(100)],
        "price": [randint(10, 50) + 4 * (i % 3) for i in range(100)],
        "wait": [random() for i in range(100)],
    }
)

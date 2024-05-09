import pandas as pd
import vega_datasets

cars = vega_datasets.data.cars()
stocks = vega_datasets.data.stocks()
barley = vega_datasets.data.barley()
simple = pd.DataFrame(
    {
        "a": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "b": [28, 55, 43, 91, 81, 53, 19, 87, 52],
    }
)

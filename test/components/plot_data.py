from datetime import datetime, timedelta

import pandas as pd
import vega_datasets

barley = vega_datasets.data.barley()
simple = pd.DataFrame(
    {
        "a": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "b": [28, 55, 43, 91, 81, 53, 19, 87, 52],
        "c": [0] * 9,
        "date": [datetime.now() - timedelta(days=i) for i in range(9)],
    }
)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

import gradio as gr


def sales_projections(employee_data):
    sales_data = employee_data.iloc[:, 1:4].astype("int").to_numpy()
    regression_values = np.apply_along_axis(
        lambda row: np.array(np.poly1d(np.polyfit([0, 1, 2], row, 2))), 0, sales_data
    )
    projected_months = np.repeat(
        np.expand_dims(np.arange(3, 12), 0), len(sales_data), axis=0
    )
    projected_values = np.array(
        [
            month * month * regression[0] + month * regression[1] + regression[2]
            for month, regression in zip(projected_months, regression_values)
        ]
    )
    plt.plot(projected_values.T)
    plt.legend(employee_data["Name"])
    return employee_data, plt.gcf(), regression_values


demo = gr.Interface(
    sales_projections,
    gr.Dataframe(
        headers=["Name", "Jan Sales", "Feb Sales", "Mar Sales"],
        value=[["Jon", 12, 14, 18], ["Alice", 14, 17, 2], ["Sana", 8, 9.5, 12]],
    ),
    ["dataframe", "plot", "numpy"],
    description="Enter sales figures for employees to predict sales trajectory over year.",
)
if __name__ == "__main__":
    demo.launch()

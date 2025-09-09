import gradio as gr
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
n_points = len(dates)

data = {
    'date': dates,
    'Technology_Stock_Index': 100 + np.cumsum(np.random.normal(0.1, 2, n_points)),
    'Healthcare_Innovation_Score': 80 + np.cumsum(np.random.normal(0.05, 1.5, n_points)),
    'Energy_Sector_Performance': 120 + np.cumsum(np.random.normal(-0.02, 3, n_points)),
    'Financial_Market_Indicator': 95 + np.cumsum(np.random.normal(0.08, 2.5, n_points)),
    'Consumer_Confidence_Index': 110 + np.cumsum(np.random.normal(0.03, 1.8, n_points)),
    'Manufacturing_Output_Level': 105 + np.cumsum(np.random.normal(0.06, 2.2, n_points)),
    'Real_Estate_Market_Value': 90 + np.cumsum(np.random.normal(0.04, 1.9, n_points)),
    'Transportation_Logistics_Index': 85 + np.cumsum(np.random.normal(0.07, 2.8, n_points)),
    'Agricultural_Commodity_Prices': 115 + np.cumsum(np.random.normal(0.02, 3.2, n_points)),
    'Environmental_Sustainability_Metric': 75 + np.cumsum(np.random.normal(0.09, 1.2, n_points)),
    'Education_Technology_Adoption': 70 + np.cumsum(np.random.normal(0.12, 1.5, n_points)),
    'Retail_Consumer_Spending_Pattern': 100 + np.cumsum(np.random.normal(0.05, 2.1, n_points)),
    'Telecommunications_Network_Capacity': 88 + np.cumsum(np.random.normal(0.08, 1.7, n_points)),
    'Entertainment_Media_Consumption': 92 + np.cumsum(np.random.normal(0.06, 2.3, n_points)),
    'Government_Policy_Effectiveness_Score': 78 + np.cumsum(np.random.normal(0.03, 1.4, n_points))
}

df_wide = pd.DataFrame(data)

df_long = pd.melt(
    df_wide, 
    id_vars=['date'], 
    var_name='indicator', 
    value_name='value'
)

with gr.Blocks() as demo:
    gr.LinePlot(
        df_long,
        x="date",
        y="value",
        color="indicator",
        title="Multi-Dimensional Economic and Social Indicators Dashboard",
        y_title="Comprehensive Performance Metrics and Market Indicators (Normalized Scale 0-200) and this is a very long title that should be truncated.",
        height=500,
        show_fullscreen_button=True,
    )

if __name__ == "__main__":
    demo.launch()

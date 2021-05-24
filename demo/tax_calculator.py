# Demo: (Number, Radio, Dataframe) -> (Textbox)

import gradio as gr

def tax_calculator(income, marital_status, assets):
    tax_brackets = [
        (10, 0),
        (25, 8),
        (60, 12),
        (120, 20),
        (250, 30)
    ]
    total_deductible = sum(assets[assets["Deduct"]]["Cost"])
    taxable_income = income - total_deductible

    total_tax = 0
    for bracket, rate in tax_brackets:
        if taxable_income > bracket:
            total_tax += (taxable_income - bracket) * rate / 100
    
    if marital_status == "Married":
        total_tax *= 0.75
    elif marital_status == "Divorced":
        total_tax *= 0.8
    
    return round(total_tax)

iface = gr.Interface(
    tax_calculator, 
    [
        "number",
        gr.inputs.Radio(["Single", "Married", "Divorced"]),
        gr.inputs.Dataframe(
            headers=["Item", "Cost", "Deduct"], 
            datatype=["str", "number", "bool"],
            label="Assets Purchased this Year"
        )
    ],
    "number",
    interpretation="default",
    examples=[
        [10000, "Married", [["Car", 5000, False], ["Laptop", 800, True]]],
        [80000, "Single", [["Suit", 800, True], ["Watch", 1800, False]]],
    ]
)

if __name__ == "__main__":
    iface.launch()

import gradio as gr

def tax_calculator(income, marital_status, assets):
    tax_brackets = [(10, 0), (25, 8), (60, 12), (120, 20), (250, 30)]
    total_deductible = sum(assets["Cost"])
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

demo = gr.Interface(
    tax_calculator,
    [
        "number",
        gr.Radio(["Single", "Married", "Divorced"]),
        gr.Dataframe(
            headers=["Item", "Cost"],
            datatype=["str", "number"],
            label="Assets Purchased this Year",
        ),
    ],
    "number",
    examples=[
        [10000, "Married", [["Suit", 5000], ["Laptop", 800], ["Car", 1800]]],
        [80000, "Single", [["Suit", 800], ["Watch", 1800], ["Car", 800]]],
    ],
)

demo.launch()

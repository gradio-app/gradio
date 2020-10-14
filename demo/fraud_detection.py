import gradio as gr

def fraud_detection(income, assets):
    income *= 1000
    total_asset_cost = sum(assets["Cost"])
    total_deductible = sum(assets[assets["Deduct"]]["Cost"])
    if total_asset_cost > income / 2:
        fraud_prob = max(total_asset_cost / income, total_deductible / total_asset_cost)
    else: 
        # Benford's law
        expected_digit_distribution = {1: .301, 2: .176, 3: .125}
        numbers = [income] + list(assets["Cost"])
        digit_distribution = {i: 0 for i in range(10)}
        for number in numbers:
            leading_digit = str(int(number))[0]
            digit_distribution[int(leading_digit)] += 1
        fraud_prob = 0
        for digit, expected in expected_digit_distribution.items():
            fraud_prob += abs(digit_distribution[digit] / len(numbers) - expected) / 10

    fraud_prob = min(1, fraud_prob)
    return {"fraud": fraud_prob, "standard": 1 - fraud_prob}

io = gr.Interface(
    fraud_detection, 
    [
        gr.inputs.Slider(1, 500, label="Income (in thousands)"),
        gr.inputs.Dataframe(
            headers=["Item", "Cost", "Deduct"], 
            datatype=["str", "number", "bool"],
            label="Assets Purchased this Year"
        )
    ],
    "label"
)

io.launch()
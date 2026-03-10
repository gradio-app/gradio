import gradio as gr
import numpy as np
import pandas as pd
from PIL import Image, ImageFilter, ImageEnhance
import random
import time

# ─── Fake inference functions ───────────────────────────────────────────────

def predict_disease(age, sex, bp, chol, hr, glucose, bmi, smoking, diabetes, family_history):
    time.sleep(0.1)
    risk = (age * 0.3 + bp * 0.2 + chol * 0.1 + hr * 0.1 + bmi * 0.2) / 100
    risk = min(max(risk + random.uniform(-0.1, 0.1), 0), 1)
    return {
        "High Risk": round(risk, 2),
        "Low Risk": round(1 - risk, 2)
    }

def analyze_image(image, brightness, contrast, blur, filter_type):
    if image is None:
        return None
    img = Image.fromarray(image)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    if blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    if filter_type == "Grayscale":
        img = img.convert("L").convert("RGB")
    elif filter_type == "Sepia":
        arr = np.array(img, dtype=np.float64)
        r = np.clip(arr[:,:,0]*0.393 + arr[:,:,1]*0.769 + arr[:,:,2]*0.189, 0, 255)
        g = np.clip(arr[:,:,0]*0.349 + arr[:,:,1]*0.686 + arr[:,:,2]*0.168, 0, 255)
        b = np.clip(arr[:,:,0]*0.272 + arr[:,:,1]*0.534 + arr[:,:,2]*0.131, 0, 255)
        img = Image.fromarray(np.stack([r,g,b], axis=2).astype(np.uint8))
    return img

def generate_data(rows, cols, noise, seed):
    np.random.seed(int(seed))
    data = np.random.randn(int(rows), int(cols)) * noise
    df = pd.DataFrame(data, columns=[f"Feature_{i}" for i in range(int(cols))])
    return df

def classify_text(text, threshold, model_type):
    time.sleep(0.1)
    words = text.lower().split()
    positive = ["good","great","excellent","amazing","wonderful","best","love"]
    negative = ["bad","terrible","awful","worst","hate","poor","horrible"]
    pos_score = sum(1 for w in words if w in positive) / max(len(words), 1)
    neg_score = sum(1 for w in words if w in negative) / max(len(words), 1)
    return {
        "Positive": round(pos_score + random.uniform(0, 0.3), 2),
        "Negative": round(neg_score + random.uniform(0, 0.3), 2),
        "Neutral": round(random.uniform(0.1, 0.5), 2)
    }

def forecast(periods, trend, seasonality, noise_level):
    x = np.arange(int(periods))
    trend_component = x * trend
    seasonal_component = np.sin(x * 2 * np.pi / seasonality) * 20
    noise_component = np.random.randn(int(periods)) * noise_level
    y = 100 + trend_component + seasonal_component + noise_component
    return pd.DataFrame({"Period": x, "Forecast": y, "Upper": y+10, "Lower": y-10})

def run_simulation(iterations, learning_rate, hidden_size, dropout):
    losses = []
    loss = 1.0
    for i in range(int(iterations)):
        loss = loss * (1 - learning_rate) + random.uniform(0, 0.01)
        losses.append({"Iteration": i, "Loss": round(loss, 4)})
    return pd.DataFrame(losses)

def process_audio_features(frequency, amplitude, duration, wave_type):
    t = np.linspace(0, duration, int(duration * 100))
    if wave_type == "Sine": wave = amplitude * np.sin(2 * np.pi * frequency * t)
    elif wave_type == "Square": wave = amplitude * np.sign(np.sin(2 * np.pi * frequency * t))
    elif wave_type == "Sawtooth": wave = amplitude * (2 * (t * frequency - np.floor(t * frequency + 0.5)))
    else: wave = amplitude * np.random.randn(len(t))
    df = pd.DataFrame({"Time": t[:100], "Amplitude": wave[:100]})
    return df

def cluster_data(n_clusters, n_samples, spread):
    centers = np.random.randn(int(n_clusters), 2) * 5
    data = []
    for i, center in enumerate(centers):
        points = center + np.random.randn(int(n_samples), 2) * spread
        for p in points:
            data.append({"x": p[0], "y": p[1], "cluster": f"Cluster {i}"})
    return pd.DataFrame(data)

# ─── UI ─────────────────────────────────────────────────────────────────────

with gr.Blocks(title="Complex Demo App", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🧠 Complex ML Demo App")
    gr.Markdown("A comprehensive demo with multiple tabs and hundreds of components")

    with gr.Tabs():

        # TAB 1 - Medical
        with gr.Tab("🏥 Medical Diagnosis"):
            gr.Markdown("## Patient Risk Assessment")
            with gr.Row():
                with gr.Column():
                    age = gr.Slider(18, 100, value=45, label="Age")
                    sex = gr.Radio(["Male", "Female"], value="Male", label="Sex")
                    bp = gr.Slider(80, 200, value=120, label="Blood Pressure")
                    chol = gr.Slider(100, 400, value=200, label="Cholesterol")
                    hr = gr.Slider(40, 200, value=75, label="Heart Rate")
                with gr.Column():
                    glucose = gr.Slider(50, 300, value=100, label="Glucose")
                    bmi = gr.Slider(10, 50, value=25, label="BMI")
                    smoking = gr.Checkbox(label="Smoker")
                    diabetes = gr.Checkbox(label="Diabetic")
                    family_history = gr.Checkbox(label="Family History")
            predict_btn = gr.Button("🔍 Analyze Risk", variant="primary")
            risk_output = gr.Label(label="Risk Assessment")
            predict_btn.click(predict_disease,
                inputs=[age, sex, bp, chol, hr, glucose, bmi, smoking, diabetes, family_history],
                outputs=risk_output)

            gr.Markdown("---")
            gr.Markdown("### 📊 Batch Analysis")
            with gr.Row():
                with gr.Column():
                    batch_rows = gr.Slider(10, 500, value=100, label="Sample Size")
                    batch_cols = gr.Slider(2, 20, value=5, label="Features")
                    batch_noise = gr.Slider(0.1, 5.0, value=1.0, label="Noise Level")
                    batch_seed = gr.Number(value=42, label="Random Seed")
                with gr.Column():
                    batch_output = gr.Dataframe(label="Generated Dataset")
            batch_btn = gr.Button("Generate Dataset")
            batch_btn.click(generate_data,
                inputs=[batch_rows, batch_cols, batch_noise, batch_seed],
                outputs=batch_output)

        # TAB 2 - Image Processing
        with gr.Tab("🖼️ Image Processing"):
            gr.Markdown("## Image Enhancement Studio")
            with gr.Row():
                with gr.Column():
                    input_image = gr.Image(label="Input Image")
                    brightness = gr.Slider(0.1, 3.0, value=1.0, label="Brightness")
                    contrast = gr.Slider(0.1, 3.0, value=1.0, label="Contrast")
                    blur = gr.Slider(0, 10, value=0, label="Blur")
                    filter_type = gr.Dropdown(
                        ["None", "Grayscale", "Sepia"],
                        value="None", label="Filter"
                    )
                    process_btn = gr.Button("✨ Process", variant="primary")
                with gr.Column():
                    output_image = gr.Image(label="Output Image")
            process_btn.click(analyze_image,
                inputs=[input_image, brightness, contrast, blur, filter_type],
                outputs=output_image)

            gr.Markdown("---")
            gr.Markdown("### 🎨 Batch Image Settings")
            with gr.Row():
                for i in range(6):
                    with gr.Column():
                        gr.Slider(0.1, 3.0, value=1.0, label=f"Brightness {i+1}")
                        gr.Slider(0.1, 3.0, value=1.0, label=f"Contrast {i+1}")
                        gr.Dropdown(["None","Grayscale","Sepia"], label=f"Filter {i+1}")

        # TAB 3 - NLP
        with gr.Tab("📝 NLP Analysis"):
            gr.Markdown("## Text Analysis Suite")
            with gr.Row():
                with gr.Column():
                    text_input = gr.Textbox(
                        lines=5, label="Input Text",
                        placeholder="Enter text to analyze..."
                    )
                    threshold = gr.Slider(0.1, 0.9, value=0.5, label="Confidence Threshold")
                    model_type = gr.Radio(
                        ["BERT", "RoBERTa", "DistilBERT"],
                        value="BERT", label="Model"
                    )
                    analyze_btn = gr.Button("🔍 Analyze", variant="primary")
                with gr.Column():
                    sentiment_output = gr.Label(label="Sentiment Analysis")
            analyze_btn.click(classify_text,
                inputs=[text_input, threshold, model_type],
                outputs=sentiment_output)

            gr.Markdown("---")
            gr.Markdown("### 📚 Batch Text Processing")
            with gr.Row():
                with gr.Column():
                    for i in range(5):
                        gr.Textbox(lines=2, label=f"Text Sample {i+1}")
                        gr.Slider(0.1, 0.9, value=0.5, label=f"Threshold {i+1}")
                with gr.Column():
                    for i in range(5):
                        gr.Label(label=f"Result {i+1}")
                        gr.Checkbox(label=f"Include {i+1}")

        # TAB 4 - Forecasting
        with gr.Tab("📈 Forecasting"):
            gr.Markdown("## Time Series Forecasting")
            with gr.Row():
                with gr.Column():
                    periods = gr.Slider(10, 200, value=50, label="Forecast Periods")
                    trend = gr.Slider(-2.0, 2.0, value=0.5, label="Trend")
                    seasonality = gr.Slider(2, 50, value=12, label="Seasonality")
                    noise_level = gr.Slider(0, 20, value=5, label="Noise Level")
                    forecast_btn = gr.Button("📊 Forecast", variant="primary")
                with gr.Column():
                    forecast_output = gr.Dataframe(label="Forecast Results")
            forecast_btn.click(forecast,
                inputs=[periods, trend, seasonality, noise_level],
                outputs=forecast_output)

            gr.Markdown("---")
            gr.Markdown("### ⚙️ Advanced Settings")
            with gr.Row():
                with gr.Column():
                    for i in range(4):
                        gr.Slider(0, 100, value=50, label=f"Parameter {i+1}")
                        gr.Checkbox(label=f"Enable Feature {i+1}")
                        gr.Dropdown(["Linear","Exponential","Logarithmic"], label=f"Model {i+1}")
                with gr.Column():
                    for i in range(4):
                        gr.Number(value=0, label=f"Threshold {i+1}")
                        gr.Radio(["Low","Medium","High"], label=f"Priority {i+1}")
                        gr.Textbox(label=f"Notes {i+1}")

        # TAB 5 - Training
        with gr.Tab("🤖 Model Training"):
            gr.Markdown("## Neural Network Simulator")
            with gr.Row():
                with gr.Column():
                    iterations = gr.Slider(10, 500, value=100, label="Iterations")
                    lr = gr.Slider(0.001, 0.1, value=0.01, label="Learning Rate")
                    hidden = gr.Slider(16, 512, value=128, label="Hidden Size")
                    dropout = gr.Slider(0.0, 0.9, value=0.2, label="Dropout")
                    train_btn = gr.Button("🚀 Train", variant="primary")
                with gr.Column():
                    train_output = gr.Dataframe(label="Training Loss")
            train_btn.click(run_simulation,
                inputs=[iterations, lr, hidden, dropout],
                outputs=train_output)

            gr.Markdown("---")
            gr.Markdown("### 🧪 Hyperparameter Grid")
            with gr.Row():
                with gr.Column():
                    gr.Markdown("**Optimizer Settings**")
                    for i in range(5):
                        gr.Slider(0.0001, 1.0, value=0.01, label=f"LR {i+1}")
                        gr.Dropdown(["Adam","SGD","RMSprop","AdaGrad"], label=f"Optimizer {i+1}")
                with gr.Column():
                    gr.Markdown("**Architecture Settings**")
                    for i in range(5):
                        gr.Slider(16, 1024, value=128, label=f"Layer Size {i+1}")
                        gr.Checkbox(label=f"Batch Norm {i+1}")
                with gr.Column():
                    gr.Markdown("**Training Settings**")
                    for i in range(5):
                        gr.Slider(8, 512, value=32, label=f"Batch Size {i+1}")
                        gr.Number(value=10, label=f"Epochs {i+1}")

        # TAB 6 - Signal Processing
        with gr.Tab("🔊 Signal Processing"):
            gr.Markdown("## Audio Feature Analysis")
            with gr.Row():
                with gr.Column():
                    frequency = gr.Slider(1, 1000, value=440, label="Frequency (Hz)")
                    amplitude = gr.Slider(0.1, 2.0, value=1.0, label="Amplitude")
                    duration = gr.Slider(0.1, 5.0, value=1.0, label="Duration (s)")
                    wave_type = gr.Radio(
                        ["Sine","Square","Sawtooth","Noise"],
                        value="Sine", label="Wave Type"
                    )
                    signal_btn = gr.Button("📡 Generate", variant="primary")
                with gr.Column():
                    signal_output = gr.Dataframe(label="Signal Data")
            signal_btn.click(process_audio_features,
                inputs=[frequency, amplitude, duration, wave_type],
                outputs=signal_output)

        # TAB 7 - Clustering
        with gr.Tab("🔵 Clustering"):
            gr.Markdown("## Data Clustering Visualizer")
            with gr.Row():
                with gr.Column():
                    n_clusters = gr.Slider(2, 10, value=3, label="Number of Clusters")
                    n_samples = gr.Slider(10, 200, value=50, label="Samples per Cluster")
                    spread = gr.Slider(0.1, 3.0, value=1.0, label="Cluster Spread")
                    cluster_btn = gr.Button("🔵 Cluster", variant="primary")
                with gr.Column():
                    cluster_output = gr.Dataframe(label="Cluster Data")
            cluster_btn.click(cluster_data,
                inputs=[n_clusters, n_samples, spread],
                outputs=cluster_output)

            gr.Markdown("---")
            gr.Markdown("### ⚙️ Algorithm Settings")
            with gr.Row():
                with gr.Column():
                    for i in range(4):
                        gr.Dropdown(["KMeans","DBSCAN","Hierarchical","GMM"], label=f"Algorithm {i+1}")
                        gr.Slider(2, 20, value=5, label=f"Clusters {i+1}")
                with gr.Column():
                    for i in range(4):
                        gr.Slider(0.01, 1.0, value=0.1, label=f"Epsilon {i+1}")
                        gr.Checkbox(label=f"Normalize {i+1}")

if __name__ == "__main__":
    demo.launch()
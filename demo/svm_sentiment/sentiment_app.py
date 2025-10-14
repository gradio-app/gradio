#!/usr/bin/env python3
"""
Gradio demo (Single / Batch / Explain) for the calibrated LinearSVC sentiment model.
If artifacts are missing, auto-trains on TweetEval (falls back to 20NG if needed).
"""

from __future__ import annotations
import os, json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import gradio as gr

ARTIFACTS_DIR = Path("artifacts")
MODEL_PATH = ARTIFACTS_DIR / "svm_sentiment_calibrated.joblib"
LABELS_PATH = ARTIFACTS_DIR / "labels.json"

def ensure_model():
    if not MODEL_PATH.exists() or not LABELS_PATH.exists():
        print("[INFO] Artifacts missing — training now...")
        os.makedirs(ARTIFACTS_DIR, exist_ok=True)
        # Train on TweetEval; fallback handled inside training script
        import subprocess, sys
        subprocess.check_call([sys.executable, "sentiment_training.py", "--dataset", "tweeteval"])
    model = joblib.load(MODEL_PATH)
    if LABELS_PATH.exists():
        names_raw = json.load(open(LABELS_PATH))
        class_names = [names_raw[int(i)] for i in model.classes_]
    else:
        class_names = [str(i) for i in model.classes_]
    return model, class_names

model, CLASS_NAMES = ensure_model()

def predict_topk(text: str):
    text = (text or "").strip()
    if not text:
        return {"neutral": 1.0} if "neutral" in CLASS_NAMES else {CLASS_NAMES[0]: 1.0}
    proba = model.predict_proba([text])[0]
    order = np.argsort(-proba)
    return {CLASS_NAMES[i]: float(proba[i]) for i in order}

def predict_batch(texts: str):
    lines = [t.strip() for t in (texts or "").split("\n") if t.strip()]
    if not lines:
        return pd.DataFrame(columns=["text", "pred"] + CLASS_NAMES)
    probs = model.predict_proba(lines)
    preds_idx = model.predict(lines).astype(int)
    preds = [CLASS_NAMES[i] for i in preds_idx]
    df = pd.DataFrame(probs, columns=CLASS_NAMES)
    df.insert(0, "text", lines)
    df.insert(1, "pred", preds)
    return df

def explain_single(text: str, top_k: int = 10):
    """
    Token contributions via linear weights: contribution ≈ tfidf_j * w_j (winning class).
    Works because LinearSVC is linear in TF–IDF space.
    """
    t = (text or "").strip()
    if not t:
        neutral = "neutral" if "neutral" in CLASS_NAMES else CLASS_NAMES[0]
        return f"predicted: {neutral}", pd.DataFrame(columns=["token", "contribution"])

    vec = model.named_steps["tfidf"]
    cal = model.named_steps["clf"]

    # Find a fitted LinearSVC clone (CalibratedClassifierCV stores fitted clones inside calibrated_classifiers_)
    base = None
    for cc in getattr(cal, "calibrated_classifiers_", []):
        est = getattr(cc, "estimator", None) or getattr(cc, "base_estimator", None)
        if est is not None and hasattr(est, "coef_"):
            base = est
            break
    if base is None:
        return "explain unavailable", pd.DataFrame(columns=["token", "contribution"])

    feats = np.asarray(vec.get_feature_names_out())
    X = vec.transform([t])
    scores = (X @ base.coef_.T).toarray()[0]
    cls_idx = int(np.argmax(scores))

    contrib = X.multiply(base.coef_[cls_idx]).toarray()[0]
    nz = np.flatnonzero(contrib)
    pairs = [(feats[j], float(contrib[j])) for j in nz]
    pairs = sorted(pairs, key=lambda kv: abs(kv[1]), reverse=True)[:int(top_k)]
    return f"predicted: {CLASS_NAMES[cls_idx]}", pd.DataFrame(pairs, columns=["token", "contribution"])


with gr.Blocks(title="SVM Sentiment — TF-IDF + LinearSVC (calibrated)") as demo:
    gr.Markdown("## SVM Sentiment — TF-IDF + LinearSVC (calibrated)")

    with gr.Tab("Single"):
        t = gr.Textbox(lines=4, label="text", placeholder="Type a sentence…")
        o = gr.Label(num_top_classes=len(CLASS_NAMES), label="output")
        gr.Button("Predict").click(predict_topk, t, o)

    with gr.Tab("Batch"):
        tb = gr.Textbox(lines=8, label="one text per line")
        ob = gr.Dataframe(label="predictions & probabilities")
        gr.Button("Run").click(predict_batch, tb, ob)

    with gr.Tab("Explain"):
        te = gr.Textbox(lines=4, label="text to explain")
        tk = gr.Slider(3, 25, value=10, step=1, label="top-k tokens")
        oh = gr.Textbox(label="predicted class")
        od = gr.Dataframe(label="top token contributions")
        gr.Button("Explain").click(explain_single, [te, tk], [oh, od])

if __name__ == "__main__":
    demo.launch(share=False, debug=False)

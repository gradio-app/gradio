#!/usr/bin/env python3
"""
Train a calibrated LinearSVC (TF–IDF) 3-class sentiment model and save artifacts.

Defaults to TweetEval (real sentiment: 0=negative,1=neutral,2=positive).
Fallback dataset: 20 Newsgroups (topic proxy) if you call with --dataset 20ng.

Artifacts:
  artifacts/
    svm_sentiment_calibrated.joblib
    labels.json         # human-friendly names in model.classes_ order
"""

import argparse, json, os
from pathlib import Path
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, f1_score, confusion_matrix

ARTIFACTS_DIR = Path("artifacts")
MODEL_PATH = ARTIFACTS_DIR / "svm_sentiment_calibrated.joblib"
LABELS_PATH = ARTIFACTS_DIR / "labels.json"


def build_pipeline(C=1.0, calib_method="isotonic", calib_cv=5) -> Pipeline:
    vec = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        ngram_range=(1, 3),
        sublinear_tf=True,
        min_df=2,
        max_df=0.99,
        stop_words="english",
    )
    base = LinearSVC(dual="auto", class_weight="balanced", C=C, random_state=42)
    clf = CalibratedClassifierCV(base, method=calib_method, cv=calib_cv)
    return Pipeline([("tfidf", vec), ("clf", clf)])


def load_tweeteval():
    from datasets import load_dataset  # requires `pip install datasets`
    ds = load_dataset("tweet_eval", "sentiment")
    # label ids: 0=negative, 1=neutral, 2=positive
    X_train, y_train = ds["train"]["text"], ds["train"]["label"]
    X_val,   y_val   = ds["validation"]["text"], ds["validation"]["label"]
    X_test,  y_test  = ds["test"]["text"], ds["test"]["label"]
    label_names = ["negative", "neutral", "positive"]
    return X_train, y_train, X_val, y_val, X_test, y_test, label_names


def load_20ng(seed=42):
    """Topic proxy; NOT true sentiment — use only if TweetEval unavailable."""
    from sklearn.datasets import fetch_20newsgroups
    cats = ["rec.autos", "talk.politics.misc", "sci.med"]
    tr = fetch_20newsgroups(subset='train', categories=cats, remove=('headers','footers','quotes'))
    te = fetch_20newsgroups(subset='test',  categories=cats, remove=('headers','footers','quotes'))
    X_train_all, y_train_all = tr.data, tr.target
    X_test, y_test = te.data, te.target
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_all, y_train_all, test_size=0.2, random_state=seed, stratify=y_train_all
    )
    # map ids consistently to human labels
    # 20NG assigns ids alphabetically: rec.autos(0), sci.med(1), talk.politics.misc(2)
    label_names = ["positive", "neutral", "negative"]
    return X_train, y_train, X_val, y_val, X_test, y_test, label_names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", choices=["tweeteval", "20ng"], default="tweeteval")
    ap.add_argument("--C", type=float, default=1.0)
    ap.add_argument("--calib", choices=["isotonic", "sigmoid"], default="isotonic")
    ap.add_argument("--cv", type=int, default=5)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    if args.dataset == "tweeteval":
        try:
            X_train, y_train, X_val, y_val, X_test, y_test, label_names = load_tweeteval()
        except Exception as e:
            print(f"[WARN] Failed to load TweetEval ({e}). Falling back to 20NG.")
            X_train, y_train, X_val, y_val, X_test, y_test, label_names = load_20ng(seed=args.seed)
    else:
        X_train, y_train, X_val, y_val, X_test, y_test, label_names = load_20ng(seed=args.seed)

    print(f"Train/Val/Test sizes: {len(X_train)}/{len(X_val)}/{len(X_test)}")

    pipe = build_pipeline(C=args.C, calib_method=args.calib, calib_cv=args.cv)
    pipe.fit(X_train, y_train)

    # Validation
    ypv = pipe.predict(X_val)
    print("\nValidation")
    print(classification_report(y_val, ypv, target_names=label_names, digits=3))
    print("Macro-F1 (val):", f1_score(y_val, ypv, average="macro"))

    # Test
    ypt = pipe.predict(X_test)
    print("\nTest")
    print(classification_report(y_test, ypt, target_names=label_names, digits=3))
    print("Macro-F1 (test):", f1_score(y_test, ypt, average="macro"))

    print("\nConfusion Matrix (val):\n", confusion_matrix(y_val, ypv))
    print("\nConfusion Matrix (test):\n", confusion_matrix(y_test, ypt))

    # Save artifacts
    joblib.dump(pipe, MODEL_PATH)
    # save names in *model.classes_* order to avoid label/index mismatch
    ordered_names = [label_names[int(i)] for i in pipe.classes_]
    with open(LABELS_PATH, "w") as f:
        json.dump(ordered_names, f)
    print(f"\nSaved model -> {MODEL_PATH}")
    print(f"Saved labels -> {LABELS_PATH}")


if __name__ == "__main__":
    main()

import os, json
from pathlib import Path
import numpy as np
import joblib
from subprocess import check_call
import sys

DEMO_DIR = Path(__file__).resolve().parents[1]
ART = DEMO_DIR / "artifacts"
MODEL_PATH = ART / "svm_sentiment_calibrated.joblib"
LABELS_PATH = ART / "labels.json"

def test_training_script_runs():
    ART.mkdir(exist_ok=True, parents=True)
    # Use 20NG to avoid network in CI; pass --dataset tweeteval locally if you want
    check_call([sys.executable, str(DEMO_DIR / "sentiment_training.py"), "--dataset", "20ng"])
    assert MODEL_PATH.exists()
    assert LABELS_PATH.exists()
    


def test_model_load_and_predict_proba():
    model = joblib.load(MODEL_PATH)
    names = json.load(open(LABELS_PATH))
    # ensure label alignment matches model.classes_
    class_names = [names[int(i)] for i in model.classes_]
    assert len(class_names) == 3

    pp = model.predict_proba(["This is great!", "This is terrible.", "It arrived on Tuesday."])
    assert pp.shape == (3, 3)
    assert np.allclose(pp.sum(axis=1), 1.0, atol=1e-6)

def test_linear_coef_available_via_calibration():
    model = joblib.load(MODEL_PATH)
    cal = model.named_steps["clf"]
    # There should be at least one calibrated_classifier with an underlying LinearSVC having coef_
    assert hasattr(cal, "calibrated_classifiers_") and len(cal.calibrated_classifiers_) > 0
    assert any(
        getattr(getattr(cc, "estimator", None) or getattr(cc, "base_estimator", None), "coef_", None) is not None
        for cc in cal.calibrated_classifiers_
    )


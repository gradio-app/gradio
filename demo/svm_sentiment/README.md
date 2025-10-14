# SVM Sentiment — TF-IDF + LinearSVC (Calibrated)

This example trains a 3-class sentiment model (negative/neutral/positive) using TF-IDF features and a calibrated LinearSVC, then serves a Gradio app with:
- **Single** input prediction (with confidences)
- **Batch** prediction (one text per line)
- **Explain** tab (token contributions via linear weights)

## Train
```bash
python sentiment_training.py
# or explicitly choose data
python sentiment_training.py --dataset tweeteval
python sentiment_training.py --dataset 20ng

## Dataset Citation
**TweetEval:** Barbieri et al., Findings of EMNLP 2020 — https://huggingface.co/datasets/cardiffnlp/tweet_eval  
**20 Newsgroups:** Lang, ICML 1995.


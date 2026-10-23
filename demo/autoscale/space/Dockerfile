FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng libsndfile1 git curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir uv
COPY wheels /wheels
RUN uv pip install --system --no-cache /wheels/*.whl nvidia-ml-py psutil torch transformers accelerate kokoro soundfile
RUN uv pip install --system --no-cache https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
RUN useradd -m -u 1000 user
USER user
WORKDIR /home/user/app
ENV HOME=/home/user PORT=7860 GRADIO_SERVER_NAME=0.0.0.0 GRADIO_ANALYTICS_ENABLED=False GRADIO_PROCESS_REPLICAS=auto
COPY --chown=user app.py ./
CMD ["python", "app.py"]

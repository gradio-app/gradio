# One Space per benchmark arm. deploy.py fills in the gradio wheel and the
# arm's environment. Node 24.22.1 is installed in every image, so SSR runs
# wherever the arm asks for it (Gradio-SDK Spaces still ship Node 20.20.2,
# where #14016 falls back to client-side rendering).
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl xz-utils git ca-certificates \
    && curl -fsSL https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz \
       | tar -xJ -C /usr/local --strip-components=1 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV PATH=/home/user/.local/bin:$PATH
WORKDIR /home/user/app

COPY --chown=user constraints.txt .
RUN pip install --no-cache-dir --user -c constraints.txt \
    "gradio-client @ git+https://github.com/gradio-app/gradio@{sha}#subdirectory=client/python" \
    "gradio @ https://huggingface.co/buckets/gradio/pypi-previews/resolve/{sha}/gradio-{version}-py3-none-any.whl"

COPY --chown=user apps apps
ENV BENCH_HOST=0.0.0.0 BENCH_PORT=7860 GRADIO_ANALYTICS_ENABLED=False PYTHONUNBUFFERED=1 {env}
EXPOSE 7860
# APP is a Space variable, so switching apps needs a restart, not a rebuild.
CMD ["sh", "-c", "BENCH_T0=$(date +%s.%N) exec python apps/run.py ${{APP:-simple_gradio}}"]

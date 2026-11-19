FROM python:3.11-slim

WORKDIR /app

COPY *.whl ./
RUN pip install --no-cache-dir *.whl

COPY app.py .

CMD ["python", "app.py"]
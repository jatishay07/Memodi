FROM python:3.11-slim-bookworm

ARG PIPER_VERSION=2023.11.14-2

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && curl -fsSL -o /tmp/piper.tar.gz \
    "https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/piper_linux_x86_64.tar.gz" \
  && tar -xzf /tmp/piper.tar.gz -C /usr/local/bin --strip-components=1 \
  && rm /tmp/piper.tar.gz \
  && apt-get purge -y curl \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /voices \
  && curl -fsSL -o /voices/en_US-lessac-medium.onnx \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx" \
  && curl -fsSL -o /voices/en_US-lessac-medium.onnx.json \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .

ENV PIPER_MODEL=/voices/en_US-lessac-medium.onnx
EXPOSE 59125

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "59125"]

#!/bin/bash
# One-time setup per session: voice engine, model files, video project.
set -e
cd "$(dirname "$0")"
pip install --break-system-packages -q kokoro-onnx soundfile numpy scipy
R=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s kokoro.onnx ] || curl -sSL -o kokoro.onnx $R/kokoro-v1.0.onnx
[ -s voices.bin ] || curl -sSL -o voices.bin $R/voices-v1.0.bin
cd ../video && npm install --no-audit --no-fund --silent
echo "setup ok"

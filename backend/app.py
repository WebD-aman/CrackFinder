"""
app.py - CrackFinder Flask Backend
===================================
API endpoint: POST /predict
Accepts: multipart/form-data with field "image"
Returns: JSON { prediction, confidence }
"""

import os
import pathlib
from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.preprocess import preprocess, ALLOWED_EXTENSIONS
from utils.predict import predict, load_model, get_model_input_size

# ── App setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow all origins in development; restrict to your Vercel/Netlify domain in prod
CORS(app, resources={r"/*": {"origins": "*"}})

# Max upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# Ensure uploads folder exists
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── Pre-load model at startup so first request is fast ───────────────────────
try:
    load_model()
except FileNotFoundError as e:
    print(f"[WARNING] {e}")
    print("[WARNING] The /predict endpoint will return an error until a model is placed in backend/model/")


# ── Helper ───────────────────────────────────────────────────────────────────
def _allowed_file(filename: str) -> bool:
    return pathlib.Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "CrackFinder API is running", "version": "1.0.0"})


@app.route("/predict", methods=["POST"])
def predict_endpoint():
    """
    POST /predict
    Form field: image  (file)
    Returns: { prediction: str, confidence: float }
    """

    # ── 1. Validate request ───────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image field in request. Send file as 'image'."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not _allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 415

    # ── 2. Read bytes ─────────────────────────────────────────────────────────
    try:
        file_bytes = file.read()
        if len(file_bytes) == 0:
            return jsonify({"error": "Uploaded file is empty."}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to read file: {str(exc)}"}), 500

    # ── 3. Preprocess ─────────────────────────────────────────────────────────
    try:
        model = load_model()
        processed = preprocess(file_bytes, target_size=get_model_input_size(model))
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:
        return jsonify({"error": f"Preprocessing failed: {str(exc)}"}), 500

    # ── 4. Predict ────────────────────────────────────────────────────────────
    try:
        result = predict(processed, model=model)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {str(exc)}"}), 500

    # ── 5. Return result ──────────────────────────────────────────────────────
    return jsonify(result), 200


# ── Entry point (for local dev) ───────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

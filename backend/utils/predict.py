"""
predict.py - Prediction pipeline for CrackFinder
Extracted from pavement-crack-inspection-cnn-vit.ipynb

CNN output:
  - Single sigmoid neuron -> value in [0, 1]
  - >= 0.5  => Positive (Crack Detected)
  - <  0.5  => Negative (No Crack)

ViT output:
  - Two logits -> softmax -> argmax
  - 0 => Negative, 1 => Positive
"""

import numpy as np
import tensorflow as tf
import os

# ── Labels (match dataset folders: Negative=0, Positive=1) ──────────────────
LABELS = {0: "No Crack", 1: "Crack Detected"}

# ── Singleton model holder ───────────────────────────────────────────────────
_model = None


def load_model(model_path: str = None) -> tf.keras.Model:
    """
    Load the Keras model once and cache it.
    Tries crack_model.keras first, then crack_model.h5.
    """
    global _model
    if _model is not None:
        return _model

    # Determine path
    if model_path is None:
        base = os.path.join(os.path.dirname(__file__), "..", "model")
        for name in ("crack_model.keras", "crack_model.h5"):
            candidate = os.path.join(base, name)
            if os.path.exists(candidate):
                model_path = candidate
                break

    if model_path is None or not os.path.exists(model_path):
        raise FileNotFoundError(
            "No model file found. Train and save your model as "
            "backend/model/crack_model.keras  (or .h5)."
        )

    print(f"[CrackFinder] Loading model from: {model_path}")
    _model = tf.keras.models.load_model(model_path)
    print("[CrackFinder] Model loaded successfully.")
    return _model


def get_model_input_size(model: tf.keras.Model = None) -> tuple[int, int] | None:
    """Return the model's expected (height, width), if it is fixed."""
    model = model or load_model()
    input_shape = model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    height, width = input_shape[1], input_shape[2]
    if height is None or width is None:
        return None
    return int(height), int(width)


def _resize_batch_for_model(batch: np.ndarray, model: tf.keras.Model) -> np.ndarray:
    """Resize an image batch if its spatial shape differs from the model."""
    target_size = get_model_input_size(model)
    if target_size is None:
        return batch

    height, width = target_size
    if batch.shape[1:3] == (height, width):
        return batch

    resized = tf.image.resize(batch, (height, width), method="bilinear")
    return resized.numpy().astype(np.float32)


def predict(preprocessed_image: np.ndarray, model: tf.keras.Model = None) -> dict:
    """
    Run inference on a preprocessed image batch.

    Returns:
        {
            "prediction": "Crack Detected" | "No Crack",
            "confidence": float  # percentage 0-100
        }
    """
    model = model or load_model()
    preprocessed_image = _resize_batch_for_model(preprocessed_image, model)
    raw_output = model.predict(preprocessed_image, verbose=0)

    # ── Determine model type from output shape ───────────────────────────────
    if raw_output.shape[-1] == 1:
        # ── CNN path: single sigmoid output ──────────────────────────────────
        prob_positive = float(raw_output[0][0])          # prob of crack
        class_idx = 1 if prob_positive >= 0.5 else 0
        confidence = prob_positive if class_idx == 1 else (1.0 - prob_positive)
    else:
        # ── ViT path: two logits, apply softmax ──────────────────────────────
        probs = tf.nn.softmax(raw_output[0]).numpy()     # shape (2,)
        class_idx = int(np.argmax(probs))
        confidence = float(probs[class_idx])

    return {
        "prediction": LABELS[class_idx],
        "confidence": round(confidence * 100, 2),
    }

"""
preprocess.py - Image preprocessing pipeline for CrackFinder.

Images can be uploaded at any size. They are resized to the loaded
model's expected input size before inference.
"""

import cv2
import numpy as np


DEFAULT_IMAGE_SIZE = 240
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def load_image_from_bytes(file_bytes: bytes) -> np.ndarray:
    """Convert raw file bytes to an RGB numpy array."""
    img_array = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Make sure it is a valid image file.")
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def resize_image(img: np.ndarray, size: int | tuple[int, int] = DEFAULT_IMAGE_SIZE) -> np.ndarray:
    """Resize image to the model input size."""
    if isinstance(size, int):
        width, height = size, size
    else:
        height, width = size
    return cv2.resize(img, (width, height), interpolation=cv2.INTER_LINEAR)


def normalize_image(img: np.ndarray) -> np.ndarray:
    """
    Convert to float32 while keeping raw [0, 255] pixel values.
    The saved model handles MobileNetV2/EfficientNet preprocessing itself.
    """
    return img.astype(np.float32)


def preprocess(file_bytes: bytes, target_size: tuple[int, int] | None = None) -> np.ndarray:
    """
    Full preprocessing pipeline:
      bytes -> decode -> resize -> float32 -> add batch dimension
    """
    img = load_image_from_bytes(file_bytes)
    img = resize_image(img, target_size or DEFAULT_IMAGE_SIZE)
    img = normalize_image(img)
    return np.expand_dims(img, axis=0)

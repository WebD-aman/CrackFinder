"""
train_and_save.py - Train CrackFinder with transfer learning.

Expected dataset structure:
  dataset/
    Negative/   images with no crack
    Positive/   images with crack

Examples:
  python train_and_save.py --data_dir dataset
  python train_and_save.py --data_dir dataset --backbone efficientnetb0
"""

import argparse
import os
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator


IMAGE_SIZE = 240
BATCH_SIZE = 32
EPOCHS = 5
FINE_TUNE_EPOCHS = 0
RANDOM_SEED = 42
CLASS_NAMES = ("Negative", "Positive")

np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)


def validate_dataset(data_dir: str) -> None:
    root = Path(data_dir)
    if not root.exists():
        raise FileNotFoundError(f"Dataset folder not found: {root}")

    missing = [name for name in CLASS_NAMES if not (root / name).is_dir()]
    if missing:
        expected = ", ".join(str(root / name) for name in CLASS_NAMES)
        raise FileNotFoundError(
            f"Dataset must contain Negative and Positive folders. Expected: {expected}"
        )

    counts = {}
    for name in CLASS_NAMES:
        counts[name] = sum(1 for item in (root / name).iterdir() if item.is_file())

    print(f"[CrackFinder] Image counts: {counts}")
    if min(counts.values()) == 0:
        raise ValueError("Both Negative and Positive folders must contain images.")


def build_generators(data_dir: str, batch_size: int):
    datagen = ImageDataGenerator(
        validation_split=0.2,
        rotation_range=15,
        width_shift_range=0.08,
        height_shift_range=0.08,
        zoom_range=0.12,
        horizontal_flip=True,
        brightness_range=(0.8, 1.2),
        fill_mode="nearest",
    )

    train_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(IMAGE_SIZE, IMAGE_SIZE),
        batch_size=batch_size,
        classes=list(CLASS_NAMES),
        class_mode="binary",
        subset="training",
        seed=RANDOM_SEED,
        shuffle=True,
    )

    val_gen = datagen.flow_from_directory(
        data_dir,
        target_size=(IMAGE_SIZE, IMAGE_SIZE),
        batch_size=batch_size,
        classes=list(CLASS_NAMES),
        class_mode="binary",
        subset="validation",
        seed=RANDOM_SEED,
        shuffle=False,
    )

    return train_gen, val_gen


def get_backbone(backbone_name: str):
    name = backbone_name.lower()
    if name == "mobilenetv2":
        app = tf.keras.applications.MobileNetV2
        preprocessing_layer = layers.Rescaling(1.0 / 127.5, offset=-1.0, name="mobilenetv2_preprocess")
    elif name == "efficientnetb0":
        app = tf.keras.applications.EfficientNetB0
        preprocessing_layer = layers.Activation("linear", name="efficientnetb0_preprocess")
    else:
        raise ValueError("backbone must be 'mobilenetv2' or 'efficientnetb0'")

    base_model = app(
        include_top=False,
        weights="imagenet",
        input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
    )
    return base_model, preprocessing_layer


def build_model(backbone_name: str, dropout: float) -> tf.keras.Model:
    base_model, preprocessing_layer = get_backbone(backbone_name)
    base_model.trainable = False

    inputs = layers.Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3), name="image")
    x = preprocessing_layer(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
    x = layers.Dropout(dropout, name="dropout")(x)
    outputs = layers.Dense(1, activation="sigmoid", name="crack_probability")(x)

    return tf.keras.Model(inputs, outputs, name=f"crackfinder_{backbone_name.lower()}")


def compute_class_weights(train_gen):
    classes = train_gen.classes
    total = len(classes)
    counts = np.bincount(classes, minlength=len(CLASS_NAMES))
    return {
        int(class_idx): float(total / (len(CLASS_NAMES) * count))
        for class_idx, count in enumerate(counts)
        if count > 0
    }


def fine_tune_model(model: tf.keras.Model, learning_rate: float, trainable_layers: int) -> None:
    base_model = next(
        layer for layer in model.layers if isinstance(layer, tf.keras.Model)
    )
    base_model.trainable = True

    for layer in base_model.layers[:-trainable_layers]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )


def main(
    data_dir: str,
    output_path: str,
    backbone: str,
    batch_size: int,
    epochs: int,
    fine_tune_epochs: int,
    fine_tune_layers: int,
):
    print(f"\n[CrackFinder] Training from: {data_dir}")
    validate_dataset(data_dir)

    train_gen, val_gen = build_generators(data_dir, batch_size)
    class_weights = compute_class_weights(train_gen)
    print(f"[CrackFinder] Class indices: {train_gen.class_indices}")
    print(f"[CrackFinder] Class weights: {class_weights}")

    model = build_model(backbone, dropout=0.3)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=2,
            min_lr=1e-6,
        ),
    ]

    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=callbacks,
    )

    if fine_tune_epochs > 0:
        print(f"\n[CrackFinder] Fine-tuning last {fine_tune_layers} backbone layers")
        fine_tune_model(model, learning_rate=1e-5, trainable_layers=fine_tune_layers)
        model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=fine_tune_epochs,
            class_weight=class_weights,
            callbacks=callbacks,
        )

    loss, acc = model.evaluate(val_gen, verbose=1)
    print(f"\n[CrackFinder] Validation accuracy: {acc * 100:.2f}%")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.save(output_path)
    print(f"[CrackFinder] Model saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train and save CrackFinder model")
    parser.add_argument("--data_dir", required=True, help="Path to dataset with Negative/Positive folders")
    parser.add_argument("--output", default="backend/model/crack_model.keras", help="Where to save the model")
    parser.add_argument("--backbone", default="mobilenetv2", choices=["mobilenetv2", "efficientnetb0"])
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE)
    parser.add_argument("--epochs", type=int, default=EPOCHS)
    parser.add_argument("--fine_tune_epochs", type=int, default=FINE_TUNE_EPOCHS)
    parser.add_argument("--fine_tune_layers", type=int, default=30)
    args = parser.parse_args()

    main(
        data_dir=args.data_dir,
        output_path=args.output,
        backbone=args.backbone,
        batch_size=args.batch_size,
        epochs=args.epochs,
        fine_tune_epochs=args.fine_tune_epochs,
        fine_tune_layers=args.fine_tune_layers,
    )

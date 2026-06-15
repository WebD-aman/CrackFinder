# CrackFinder

A simple pavement crack detection web app built with **React**, **Flask**, **TensorFlow/Keras**, and **OpenCV**.

Upload a road or concrete surface image and CrackFinder predicts whether a crack is present. The backend preprocesses the image, runs it through a trained Keras model, and returns the prediction with a confidence score.

## Features

* Upload JPG, JPEG, PNG, BMP, and WEBP images
* Crack detection using a trained TensorFlow/Keras model
* Transfer learning support with MobileNetV2 or EfficientNetB0
* Confidence score for each prediction
* Image preprocessing with OpenCV
* React chat-style detection interface
* Prediction history in the frontend
* Flask REST API with CORS enabled

## Project Structure

```text
CrackFinder/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- model/
|   |   `-- crack_model.keras
|   `-- utils/
|       |-- predict.py
|       `-- preprocess.py
|-- dataset/
|   |-- Negative/
|   `-- Positive/
|-- frontend/
|   |-- src/
|   |-- package.json
|   `-- vite.config.js
|-- train_and_save.py
`-- README.md
```

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

If the backend is hosted somewhere else, create `frontend/.env` and set the API URL:

```env
VITE_API_URL=http://localhost:5000
```

## Training the Model

Place your training images in this structure:

```text
dataset/
|-- Negative/
`-- Positive/
```

Then train and save the model:

```bash
python train_and_save.py --data_dir dataset --backbone mobilenetv2
```

You can also use EfficientNetB0:

```bash
python train_and_save.py --data_dir dataset --backbone efficientnetb0
```

The trained model is saved automatically in:

```text
backend/model/crack_model.keras
```

After training, restart the Flask server.

## API Endpoints

### Health Check

```http
GET /
```

Returns the API status.

### Predict Crack

```http
POST /predict
```

Upload an image using `multipart/form-data` with the field name `image`.

Example response:

```json
{
  "prediction": "Crack Detected",
  "confidence": 98.42
}
```

Possible predictions:

```text
Crack Detected
No Crack
```

## How It Works

1. Upload an image from the frontend.
2. The Flask backend validates the file type.
3. OpenCV decodes and resizes the image.
4. The image is converted into a batch for model inference.
5. The Keras model predicts whether the image is Positive or Negative.
6. The backend returns the prediction and confidence score.
7. The frontend displays the result and stores it in prediction history.

## Tech Stack

* Frontend: React, Vite, Tailwind CSS
* Backend: Flask, Flask-CORS
* Image Processing: OpenCV, Pillow, NumPy
* Deep Learning: TensorFlow / Keras
* Model: Transfer learning with MobileNetV2 or EfficientNetB0

## Notes

* The backend expects a trained model at `backend/model/crack_model.keras` or `backend/model/crack_model.h5`.
* The `/predict` endpoint returns an error if no trained model is available.
* Maximum upload size is 10 MB.
* Uploading an image does not permanently store it; prediction is made from the uploaded file bytes.
* The dataset folders must be named exactly `Negative` and `Positive`.

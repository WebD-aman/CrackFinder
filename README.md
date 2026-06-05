## Getting Started

Clone the repository and install the required dependencies.

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Training

Place your dataset in the following structure:

```text
dataset/
  Negative/
  Positive/
```

Then train the model:

```bash
python train_and_save.py --data_dir dataset --backbone mobilenetv2
```

The trained model will be saved automatically in:

```text
backend/model/crack_model.keras
```

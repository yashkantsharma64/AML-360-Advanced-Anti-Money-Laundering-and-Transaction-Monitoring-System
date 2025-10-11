
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(
    title="ML Fraud Transaction Detection System",
    description="Detects suspicious financial transactions using a trained ML model",
    version="1.0.0"
)

MODEL_PATH = "fraud_detection_pipeline.pkl"
model = joblib.load(MODEL_PATH)


class TransactionInput(BaseModel):
    beneficiary_country: str
    transaction_amount: float
    currency_code: str
    payment_type: str
    amount_usd: float
    Rule1_score: float
    Rule2_score: float
    Rule3_score: float
    Rule4_score: float
    Rule5_score: float
    total_score: float

@app.get("/")
def home():
    return {"message": "Welcome to the ML Fraud Transaction Detection API!"}


@app.post("/predict")
def predict_transaction(data: TransactionInput):

    try:
        # Prepare input data for model
        input_features = np.array([[
            hash(data.payment_type) % 1000,
            data.amount_usd,
            data.Rule1_score,
            data.Rule2_score,
            data.Rule3_score,
            data.Rule4_score,
            data.Rule5_score,
            data.total_score
        ]])

        # Make prediction
        prediction = model.predict(input_features)[0]
        label = "Suspicious" if prediction == 1 else "Not Suspicious"

        # Return result
        return {
            "status": "success",
            "prediction": int(prediction),
            "label": label
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# ===== Run Command =====
# uvicorn app:app --reload

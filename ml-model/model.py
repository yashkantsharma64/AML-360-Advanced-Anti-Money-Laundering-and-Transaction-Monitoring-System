import joblib
import pandas as pd

def predict_transaction(transaction_dict):
    """
    Pass a single transaction as dictionary for prediction.
    Example input:
    {
      'transaction_amount': 12000,
      'amount_usd': 12000,
      'currency_code': 'USD',
      'beneficiary_country': 'IR',
      'originator_country': 'US',
      'payment_type': 'transfer',
      'payment_instruction': 'gift for family',
      'beneficiary_country_score': 10,
      'suspicious_keyword_score': 3,
      'amount_gt_1m_score': 0,
      'structuring_score': 0,
      'rounded_amount_score': 0,
      'aggregate_score': 13
    }
    """
    model = joblib.load("fraud_detection_pipeline.pkl")
    tx_df = pd.DataFrame([transaction_dict])
    pred = model.predict(tx_df)[0]
    prob = model.predict_proba(tx_df)[0, 1]
    label = "Suspicious" if pred == 1 else "Normal"
    print(f"\nPrediction: {label} (Probability = {prob:.2f})")
    return label, prob
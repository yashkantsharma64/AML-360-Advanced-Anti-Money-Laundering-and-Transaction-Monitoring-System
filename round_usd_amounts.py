import pandas as pd

# Read the CSV file
df = pd.read_csv('dataset/usd_amount_dataset.csv')

# Round amount_usd column to 2 decimal places
df['amount_usd'] = df['amount_usd'].round(2)

# Save back to the same file
df.to_csv('dataset/usd_amount_dataset1.csv', index=False)

print(f"SUCCESS: Rounded amount_usd column to 2 decimal places")
print(f"Total rows processed: {len(df):,}")
print(f"Sample rounded values:")
print(df[['transaction_amount', 'amount_usd']].head(10))

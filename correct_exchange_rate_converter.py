import pandas as pd
import requests
import time
from datetime import datetime
from typing import Dict, Optional

class CorrectExchangeRateConverter:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://v6.exchangerate-api.com/v6"
        self.rate_cache = {}
        self.request_count = 0
        self.max_requests = 29800  # Your exact limit
        
    def get_exchange_rate_for_date(self, date: str) -> Optional[Dict[str, float]]:
        """Get all exchange rates for a specific date"""
        # Check cache first
        if date in self.rate_cache:
            return self.rate_cache[date]
        
        # Check API limit
        if self.request_count >= self.max_requests:
            print(f"STOPPING: API limit reached ({self.max_requests} requests)")
            return None
        
        try:
            # Parse date - handle DD-MM-YYYY format
            try:
                date_obj = datetime.strptime(date, "%d-%m-%Y")
            except ValueError:
                try:
                    date_obj = datetime.strptime(date, "%Y-%m-%d")
                except ValueError:
                    print(f"ERROR: Unable to parse date format: {date}")
                    return None
            
            year = date_obj.year
            month = date_obj.month
            day = date_obj.day
            
            # Make API request
            url = f"{self.base_url}/{self.api_key}/history/USD/{year}/{month:02d}/{day:02d}"
            
            print(f"Fetching rates for {date}...")
            response = requests.get(url, timeout=10)
            self.request_count += 1
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("result") == "success":
                    rates = data.get("conversion_rates", {})
                    rates['USD'] = 1.0  # Add USD rate
                    
                    # Store in cache
                    self.rate_cache[date] = rates
                    
                    print(f"SUCCESS: Got {len(rates)} rates for {date} (Request #{self.request_count})")
                    return rates
                else:
                    print(f"ERROR: API error for {date}: {data.get('error-type', 'Unknown')}")
                    return None
            else:
                print(f"ERROR: HTTP error {response.status_code} for {date}")
                return None
                
        except Exception as e:
            print(f"ERROR: Exception for {date}: {str(e)}")
            return None
    
    def process_transactions(self, input_file: str, output_file: str, start_row: int = 0, max_rows: int = 29800):
        """Process transactions with real exchange rates"""
        end_row = start_row + max_rows
        print(f"Processing rows {start_row+1} to {end_row} from {input_file}")
        print(f"API limit: {self.max_requests} requests")
        
        # Read rows starting from start_row
        df = pd.read_csv(input_file, skiprows=range(1, start_row+1), nrows=max_rows)
        print(f"Loaded {len(df)} transactions")
        
        # Get unique dates
        unique_dates = df['transaction_date'].unique()
        print(f"Unique dates: {len(unique_dates)}")
        
        # Fetch rates for all unique dates
        print("\nFetching exchange rates...")
        for date in unique_dates:
            rates = self.get_exchange_rate_for_date(date)
            if rates is None:
                print(f"STOPPING: Could not get rates for {date}")
                break
        
        # Check if we have rates for all dates
        missing_dates = [date for date in unique_dates if date not in self.rate_cache]
        if missing_dates:
            print(f"ERROR: Missing rates for dates: {missing_dates}")
            print("Cannot proceed without real exchange rates")
            return False
        
        # Add USD rates and convert amounts
        print("\nConverting amounts to USD...")
        df['usd_rate'] = df.apply(
            lambda row: self.rate_cache.get(row['transaction_date'], {}).get(row['currency_code'], None),
            axis=1
        )
        
        # Check for missing rates
        missing_rates = df[df['usd_rate'].isna()]
        if not missing_rates.empty:
            print(f"ERROR: Missing rates for {len(missing_rates)} transactions")
            print("Currencies with missing rates:")
            print(missing_rates['currency_code'].value_counts())
            return False
        
        # Calculate USD amounts
        df['amount_usd'] = df['transaction_amount'] * df['usd_rate']
        
        # Save result (append if file exists)
        if start_row == 0:
            # First batch - create new file
            df.to_csv(output_file, index=False)
            print(f"\nSUCCESS: Created new file with {len(df)} transactions")
        else:
            # Subsequent batches - append to existing file
            df.to_csv(output_file, mode='a', header=False, index=False)
            print(f"\nSUCCESS: Appended {len(df)} transactions to existing file")
        
        print(f"API requests used: {self.request_count}/{self.max_requests}")
        
        # Show summary
        print("\nSUMMARY:")
        print(f"Total transactions: {len(df):,}")
        print(f"Unique currencies: {df['currency_code'].nunique()}")
        print(f"Currency distribution:")
        print(df['currency_code'].value_counts())
        
        print(f"\nSample conversions:")
        sample = df[['transaction_date', 'currency_code', 'transaction_amount', 'usd_rate', 'amount_usd']].head(10)
        print(sample.to_string(index=False))
        
        return True

def main():
    # Initialize converter
    api_key = "4299650994279511afe6ed48"
    converter = CorrectExchangeRateConverter(api_key)
    
    # File paths
    input_file = "C:/Purav/Team-11-Innoversite/dataset/original_dataset.csv"
    output_file = "C:/Purav/Team-11-Innoversite/dataset/transactions_with_usd_rates_final.csv"
    
    # Process final batch (rows 89,401 to 100,000) - only 10,600 rows
    start_row = 89400  # Start from row 89,401 (0-indexed)
    max_rows = 10600   # Only 10,600 rows remaining
    success = converter.process_transactions(input_file, output_file, start_row, max_rows)
    
    if success:
        print("\nCONVERSION COMPLETED SUCCESSFULLY!")
        print(f"Total rows processed: {29800 + 29800 + 29800 + 10600}")  # All batches complete
    else:
        print("\nCONVERSION FAILED - Check errors above")

if __name__ == "__main__":
    main()

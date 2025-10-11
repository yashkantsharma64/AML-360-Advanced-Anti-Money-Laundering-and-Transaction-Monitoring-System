from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import tempfile
import json
from typing import List, Dict, Any
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import re

app = FastAPI(title="AML Simple Chatbot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for chatbot system
transaction_data = []
llm = None

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "aml_monitoring")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []

def initialize_chatbot_system():
    """Initialize the simple chatbot system"""
    global llm
    
    try:
        # For now, we'll use a simple rule-based approach
        # In a real implementation, you'd integrate with Ollama here
        print("Simple chatbot system initialized successfully")
        
    except Exception as e:
        print(f"Error initializing chatbot system: {e}")
        raise e

async def export_mongodb_to_csv():
    """Export MongoDB transactions to CSV file"""
    try:
        collection = db.transactions
        transactions = await collection.find({}).to_list(length=None)
        
        if not transactions:
            return None
            
        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            transaction['_id'] = str(transaction['_id'])
        
        # Create DataFrame
        df = pd.DataFrame(transactions)
        
        # Save to CSV
        csv_path = "chatbot/mongodb_transactions.csv"
        df.to_csv(csv_path, index=False)
        
        return csv_path
        
    except Exception as e:
        print(f"Error exporting MongoDB to CSV: {e}")
        return None

def load_csv_data(csv_path: str):
    """Load CSV file into memory"""
    global transaction_data
    
    try:
        # Load CSV data
        df = pd.read_csv(csv_path)
        transaction_data = df.to_dict('records')
        
        print(f"Loaded {len(transaction_data)} transactions from {csv_path}")
        return True
        
    except Exception as e:
        print(f"Error loading CSV data: {e}")
        return False

def analyze_triggered_rules(transaction):
    """Analyze which rules were triggered for a transaction"""
    rules_triggered = []
    
    # Rule 1: High-risk country
    high_risk_countries = ['AF', 'IR', 'KP', 'SY', 'VE', 'CU', 'MM', 'BY', 'RU', 'CN']
    if transaction.get('beneficiary_country') in high_risk_countries:
        rules_triggered.append({
            'rule': 'High-risk country',
            'score': 3,
            'details': f"Beneficiary country {transaction.get('beneficiary_country')} is on the high-risk list"
        })
    
    # Rule 2: High-value transaction
    amount_usd = transaction.get('amount_usd', 0)
    if amount_usd > 100000:  # $100k threshold
        rules_triggered.append({
            'rule': 'High-value transaction',
            'score': 2,
            'details': f"Transaction amount ${amount_usd:,.2f} exceeds $100,000 threshold"
        })
    
    # Rule 3: Suspicious keywords
    suspicious_keywords = ['cash', 'urgent', 'confidential', 'offshore', 'tax', 'avoid', 'secret', 'private']
    payment_instruction = str(transaction.get('payment_instruction', '')).lower()
    for keyword in suspicious_keywords:
        if keyword in payment_instruction:
            rules_triggered.append({
                'rule': 'Suspicious keyword',
                'score': 1,
                'details': f"Payment instruction contains suspicious keyword: '{keyword}'"
            })
            break
    
    # Rule 4: Structuring pattern (simplified check)
    if amount_usd >= 8000 and amount_usd <= 9999:
        rules_triggered.append({
            'rule': 'Potential structuring',
            'score': 2,
            'details': f"Transaction amount ${amount_usd:,.2f} falls in structuring range ($8,000-$9,999)"
        })
    
    # Rule 5: Round number amounts
    if amount_usd > 0 and amount_usd % 1000 == 0:
        rules_triggered.append({
            'rule': 'Round number amount',
            'score': 1,
            'details': f"Transaction amount ${amount_usd:,.2f} is a round number (multiple of $1,000)"
        })
    
    return rules_triggered

def simple_query_processor(query: str):
    """Simple rule-based query processor"""
    global transaction_data
    
    if not transaction_data:
        return "No transaction data available. Please upload a CSV file or refresh data from MongoDB."
    
    query_lower = query.lower()
    
    # Count queries
    if "count" in query_lower or "how many" in query_lower:
        if "suspicious" in query_lower:
            suspicious_count = sum(1 for t in transaction_data if t.get('isSuspicious', False))
            return f"Found {suspicious_count} suspicious transactions out of {len(transaction_data)} total transactions."
        elif "normal" in query_lower:
            normal_count = sum(1 for t in transaction_data if not t.get('isSuspicious', False))
            return f"Found {normal_count} normal transactions out of {len(transaction_data)} total transactions."
        else:
            return f"Total transactions: {len(transaction_data)}"
    
    # Country queries
    if "country" in query_lower:
        if "originator" in query_lower:
            countries = {}
            for t in transaction_data:
                country = t.get('originator_country', 'Unknown')
                countries[country] = countries.get(country, 0) + 1
            result = "Originator countries:\n"
            for country, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]:
                result += f"- {country}: {count} transactions\n"
            return result
        elif "beneficiary" in query_lower:
            countries = {}
            for t in transaction_data:
                country = t.get('beneficiary_country', 'Unknown')
                countries[country] = countries.get(country, 0) + 1
            result = "Beneficiary countries:\n"
            for country, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]:
                result += f"- {country}: {count} transactions\n"
            return result
    
    # Amount queries
    if "amount" in query_lower or "value" in query_lower:
        if "high" in query_lower or "large" in query_lower:
            high_value = [t for t in transaction_data if t.get('amount_usd', 0) > 10000]
            return f"Found {len(high_value)} high-value transactions (>$10,000). Average amount: ${sum(t.get('amount_usd', 0) for t in high_value) / len(high_value):,.2f}" if high_value else "No high-value transactions found."
        else:
            total_amount = sum(t.get('amount_usd', 0) for t in transaction_data)
            avg_amount = total_amount / len(transaction_data) if transaction_data else 0
            return f"Total transaction value: ${total_amount:,.2f}. Average transaction: ${avg_amount:,.2f}"
    
    # Risk score queries
    if "risk" in query_lower or "score" in query_lower:
        if "high" in query_lower:
            high_risk = [t for t in transaction_data if t.get('risk_score', 0) >= 7]
            return f"Found {len(high_risk)} high-risk transactions (score >= 7)."
        elif "average" in query_lower or "avg" in query_lower:
            avg_risk = sum(t.get('risk_score', 0) for t in transaction_data) / len(transaction_data) if transaction_data else 0
            return f"Average risk score: {avg_risk:.2f}"
        else:
            risk_scores = [t.get('risk_score', 0) for t in transaction_data]
            return f"Risk score distribution: Min: {min(risk_scores)}, Max: {max(risk_scores)}, Average: {sum(risk_scores)/len(risk_scores):.2f}"
    
    # Transaction ID queries with detailed rule analysis
    if "transaction_id" in query_lower or "id" in query_lower or "flagged" in query_lower or "fraud" in query_lower or "rule" in query_lower:
        # Extract potential transaction ID from query
        id_match = re.search(r'[a-f0-9\-]{20,}', query)
        if id_match:
            transaction_id = id_match.group()
            for t in transaction_data:
                if str(t.get('transaction_id', '')).lower() == transaction_id.lower():
                    # Analyze triggered rules
                    triggered_rules = analyze_triggered_rules(t)
                    
                    result = f"Transaction Analysis for ID: {transaction_id}\n"
                    result += f"Amount: ${t.get('amount_usd', 0):,.2f}\n"
                    result += f"Risk Score: {t.get('risk_score', 0)}\n"
                    result += f"Suspicious: {t.get('isSuspicious', False)}\n"
                    result += f"Beneficiary Country: {t.get('beneficiary_country', 'N/A')}\n"
                    result += f"Payment Instruction: {t.get('payment_instruction', 'N/A')[:100]}...\n\n"
                    
                    if triggered_rules:
                        result += "Rules Triggered:\n"
                        total_score = 0
                        for rule in triggered_rules:
                            result += f"• {rule['rule']} (+{rule['score']} points): {rule['details']}\n"
                            total_score += rule['score']
                        result += f"\nTotal Rule Score: {total_score}\n"
                        result += f"Transaction flagged as suspicious: {'Yes' if t.get('isSuspicious', False) else 'No'}"
                    else:
                        result += "No specific rules triggered. Transaction may be flagged due to:\n"
                        result += "• Overall risk assessment\n"
                        result += "• Pattern analysis\n"
                        result += "• Manual review"
                    
                    return result
            return f"Transaction ID {transaction_id} not found."
    
    # Date queries
    if "date" in query_lower or "recent" in query_lower:
        if "recent" in query_lower:
            # Sort by date and return recent transactions
            sorted_data = sorted(transaction_data, key=lambda x: x.get('transaction_date', ''), reverse=True)
            recent = sorted_data[:5]
            result = "Recent transactions:\n"
            for t in recent:
                result += f"- {t.get('transaction_date', 'N/A')}: ${t.get('amount_usd', 0):,.2f} ({'Suspicious' if t.get('isSuspicious', False) else 'Normal'})\n"
            return result
    
    # Default response
    return f"I can help you analyze {len(transaction_data)} transactions. Try asking about:\n- Count of suspicious/normal transactions\n- Transactions by country\n- High-value transactions\n- Risk scores\n- Recent transactions\n- Specific transaction IDs\n- Why a transaction was flagged (include transaction ID)"

@app.on_event("startup")
async def startup_event():
    """Initialize chatbot system on startup"""
    initialize_chatbot_system()
    
    # Try to load CSV file from chatbot folder first
    csv_file_path = "aml_monitoring.transactions.csv"
    if os.path.exists(csv_file_path):
        print(f"Loading CSV file: {csv_file_path}")
        success = load_csv_data(csv_file_path)
        if success:
            print(f"Successfully loaded {len(transaction_data)} transactions from {csv_file_path}")
        else:
            print(f"Failed to load CSV file: {csv_file_path}")
    else:
        print(f"CSV file not found: {csv_file_path}")
        # Fallback: Export MongoDB data to CSV and load into memory
        csv_path = await export_mongodb_to_csv()
        if csv_path:
            load_csv_data(csv_path)


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the simple chatbot system"""
    try:
        # Get response from simple query processor
        answer = simple_query_processor(request.message)
        
        return ChatResponse(
            answer=answer,
            sources=[]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reload-data")
async def reload_data():
    """Reload CSV data from file"""
    try:
        global transaction_data
        
        # Try to load CSV file from chatbot folder
        csv_file_path = "aml_monitoring.transactions.csv"
        if os.path.exists(csv_file_path):
            success = load_csv_data(csv_file_path)
            if success:
                return {
                    "success": True,
                    "message": f"Data reloaded successfully with {len(transaction_data)} transactions",
                    "transaction_count": len(transaction_data)
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to load CSV file: {csv_file_path}"
                }
        else:
            return {
                "success": False,
                "error": f"CSV file not found: {csv_file_path}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chatbot_initialized": True,
        "transaction_count": len(transaction_data),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

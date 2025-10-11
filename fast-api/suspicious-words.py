from fastapi import FastAPI
from typing import List

# Initialize the FastAPI application with metadata
app = FastAPI(
    title="AML Suspicious Keywords API",
    description="Provides a comprehensive list of keywords for Anti-Money Laundering (AML) transaction monitoring.",
    version="1.0.0"
)

# Your comprehensive list of suspicious keywords
suspicious_keywords_data = [
    # Obfuscation & Vague Purpose
    "gift", "donation", "loan", "cash", "payment", "personal expense", "consulting fee",
    "marketing services", "professional services", "commission", "reimbursement", "miscellaneous",
    "service charge", "for processing", "fees", "proceeds", "family support", "living expenses",
    "for safekeeping", "capital investment", "unspecified invoice",
    
    # Urgency, Secrecy, & Unusual Instructions
    "urgent", "rush payment", "confidential", "special handling", "discreet", "do not disclose",
    "sensitive", "private arrangement", "handle personally", "third-party payment",
    "pay on behalf of", "pass-through", "as per verbal instructions", "quick transfer",
    
    # High-Risk Structures & Jurisdictions
    "offshore", "shell company", "shell corp", "bearer bond", "bearer shares", "trust",
    "foundation", "nominee", "IBC", "SPV",
    
    # Structuring & Evasion
    "structuring", "smurfing", "below threshold", "under 10k", "cash deposit",
    "multiple deposits", "split payment", "cash intensive", "cash-out",
    
    # Digital Assets & IVTS
    "crypto", "cryptocurrency", "BTC", "ETH", "USDT", "XMR", "Monero", "digital wallet",
    "mixer", "tumbler", "Hawala", "Hundi", "underground banking",
    
    # High-Risk Goods & TBML
    "art", "gems", "diamonds", "luxury goods", "gold", "bullion", "antiques",
    "real estate deposit", "yacht", "aircraft", "over-invoicing", "under-invoicing",
    "double invoicing", "invoice 999",
    
    # Sanctions Evasion & Dual-Use Goods
    "transshipment", "intermediary", "routed via", "bill of lading", "dual-use goods",
    "freight forwarding", "customs duty", "vessel name change", "port of call",
    
    # Cybercrime, Scams & Fraud
    "ransomware", "CEO fraud", "BEC", "pig butchering", "romance scam", "unfreezing fee",
    "account recovery", "dark web", "darknet", "malware", "phishing",
    
    # PEP & Bribery
    "facilitation payment", "government contract", "public official", "political donation",
    "slush fund", "backhander", "introduction fee",
    
    # NPO Risk
    "humanitarian aid", "religious donation", "charitable contribution", "fundraising", "relief fund"
]

@app.get("/api/suspicious-keywords", response_model=List[str], tags=["AML Data"])
def get_suspicious_keywords():
    """
    Retrieve the comprehensive list of suspicious keywords.
    """
    return suspicious_keywords_data
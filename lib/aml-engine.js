// Exchange Rate API integration
export class ExchangeRateAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://v6.exchangerate-api.com/v6";
    this.rateCache = {};
  }

  async getExchangeRateForDate(date, currency) {
    // Check cache first
    const cacheKey = `${date}_${currency}`;
    if (this.rateCache[cacheKey]) {
      return this.rateCache[cacheKey];
    }

    try {
      // Parse date - handle DD-MM-YYYY format
      let dateObj;
      try {
        dateObj = new Date(date.split('-').reverse().join('-'));
      } catch {
        dateObj = new Date(date);
      }

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      const url = `${this.baseUrl}/${this.apiKey}/history/USD/${year}/${month}/${day}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.result === "success") {
        const rate = data.conversion_rates[currency] || 1.0;
        this.rateCache[cacheKey] = rate;
        return rate;
      }
    } catch (error) {
      console.error('Exchange rate API error:', error);
    }

    return 1.0; // Default fallback
  }

  async convertToUSD(amount, currency, date) {
    if (currency === 'USD') return amount;
    
    const rate = await this.getExchangeRateForDate(date, currency);
    return amount * rate;
  }
}

// Risk scoring rules
export class RiskScoringEngine {
  constructor() {
    this.suspiciousKeywords = [
      "gift", "donation", "loan", "cash", "payment", "personal expense", "consulting fee",
      "marketing services", "professional services", "commission", "reimbursement", "miscellaneous",
      "service charge", "for processing", "fees", "proceeds", "family support", "living expenses",
      "for safekeeping", "capital investment", "unspecified invoice",
      "urgent", "rush payment", "confidential", "special handling", "discreet", "do not disclose",
      "sensitive", "private arrangement", "handle personally", "third-party payment",
      "pay on behalf of", "pass-through", "as per verbal instructions", "quick transfer",
      "offshore", "shell company", "shell corp", "bearer bond", "bearer shares", "trust",
      "foundation", "nominee", "IBC", "SPV",
      "structuring", "smurfing", "below threshold", "under 10k", "cash deposit",
      "multiple deposits", "split payment", "cash intensive", "cash-out",
      "crypto", "cryptocurrency", "BTC", "ETH", "USDT", "XMR", "Monero", "digital wallet",
      "mixer", "tumbler", "Hawala", "Hundi", "underground banking",
      "art", "gems", "diamonds", "luxury goods", "gold", "bullion", "antiques",
      "real estate deposit", "yacht", "aircraft", "over-invoicing", "under-invoicing",
      "double invoicing", "invoice 999",
      "transshipment", "intermediary", "routed via", "bill of lading", "dual-use goods",
      "freight forwarding", "customs duty", "vessel name change", "port of call",
      "ransomware", "CEO fraud", "BEC", "pig butchering", "romance scam", "unfreezing fee",
      "account recovery", "dark web", "darknet", "malware", "phishing",
      "facilitation payment", "government contract", "public official", "political donation",
      "slush fund", "backhander", "introduction fee",
      "humanitarian aid", "religious donation", "charitable contribution", "fundraising", "relief fund"
    ];

    this.highRiskCountries = {
      "Level_1": ["DE", "US", "FR", "GB", "CA", "AU", "AT", "AZ", "BE", "BW", "BN", "BG", "CA", "CL", "CN", "CR", "HR", "CY", "CZ", "DK", "EE", "FI", "GE", "HU", "IS", "IE", "IL", "JP", "KZ", "KW", "LV", "LT", "LU", "MY", "MT", "NL", "NZ", "NO", "OM", "PL", "PT", "QA", "SA", "SG", "SK", "SI", "SE", "CH", "TH", "TT", "AE", "UY", "VN"],
      "Level_2": ["AE", "BR", "IN", "ZA", "MX", "DZ", "AG", "AR", "AM", "BD", "BB", "BY", "BZ", "BT", "BA", "KH", "CO", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "ET", "FJ", "GA", "GR", "GD", "GT", "GY", "HN", "ID", "IQ", "IT", "JM", "JO", "KG", "KI", "LA", "LB", "LS", "LR", "MG", "MW", "MV", "ML", "MH", "MR", "MU", "FM", "MD", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NI", "PA", "PG", "PY", "PE", "PH", "RO", "WS", "SN", "RS", "SC", "SB", "LK", "KN", "LC", "VC", "SR", "TJ", "TL", "TO", "TR", "TM", "TV", "UZ", "VU", "ZW"],
      "Level_3": ["IR", "KP", "SY", "RU", "CU", "AO", "BJ", "BO", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "DJ", "EG", "SV", "GQ", "ER", "ET", "GH", "GN", "GW", "HT", "AF", "IR", "IQ", "JO", "KE", "LA", "LB", "LS", "LR", "LY", "MG", "MW", "MV", "ML", "MR", "MZ", "MM", "NE", "NG", "KP", "PK", "PG", "RW", "ST", "SN", "SL", "SO", "SS", "LK", "SD", "SR", "SY", "TZ", "TG", "TN", "UG", "UA", "VE", "ZM", "ZW"]
    };
  }

  calculateRiskScore(transaction) {
    let totalScore = 0;
    const triggeredRules = [];

    // Rule 1: Beneficiary country in high-risk list
    const beneficiaryCountry = transaction.beneficiary_country;
    for (const [level, countries] of Object.entries(this.highRiskCountries)) {
      if (countries.includes(beneficiaryCountry)) {
        const score = level === "Level_1" ? 2 : level === "Level_2" ? 4 : 10;
        totalScore += score;
        triggeredRules.push({
          rule: "High-risk country",
          score: score,
          details: `${beneficiaryCountry} is in ${level}`
        });
        break;
      }
    }

    // Rule 2: Suspicious keyword found in payment_instruction
    const paymentInstruction = transaction.payment_instruction?.toLowerCase() || '';
    for (const keyword of this.suspiciousKeywords) {
      if (paymentInstruction.includes(keyword.toLowerCase())) {
        totalScore += 3;
        triggeredRules.push({
          rule: "Suspicious keyword",
          score: 3,
          details: `Found keyword: "${keyword}"`
        });
        break; // Only count first match
      }
    }

    // Rule 3: Amount > $1 million (in USD equivalent)
    if (transaction.amount_usd > 1000000) {
      totalScore += 3;
      triggeredRules.push({
        rule: "High amount",
        score: 3,
        details: `Amount $${transaction.amount_usd.toLocaleString()} > $1M`
      });
    }

    // Rule 4: Structuring (simplified - check for amounts in 8k-10k range)
    if (transaction.amount_usd >= 8000 && transaction.amount_usd <= 9999) {
      totalScore += 5;
      triggeredRules.push({
        rule: "Potential structuring",
        score: 5,
        details: `Amount $${transaction.amount_usd.toLocaleString()} in structuring range`
      });
    }

    // Rule 5: Rounded Amounts
    const amount = transaction.amount_usd;
    const roundedAmounts = [1000000, 750000, 500000, 250000, 100000, 50000, 25000, 10000, 5000, 1000];
    if (roundedAmounts.includes(amount)) {
      totalScore += 2;
      triggeredRules.push({
        rule: "Rounded amount",
        score: 2,
        details: `Amount $${amount.toLocaleString()} is a rounded figure`
      });
    }

    return {
      totalScore,
      triggeredRules,
      isSuspicious: totalScore >= 3
    };
  }
}

// Database simulation (replace with actual database)
export class TransactionDatabase {
  constructor() {
    this.transactions = [];
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aml_transactions');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    }
  }

  saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aml_transactions', JSON.stringify(this.transactions));
    }
  }

  addTransaction(transaction) {
    const id = Date.now().toString();
    const newTransaction = {
      id,
      ...transaction,
      created_at: new Date().toISOString()
    };
    this.transactions.unshift(newTransaction);
    this.saveToLocalStorage();
    return newTransaction;
  }

  getAllTransactions() {
    return this.transactions;
  }

  getTransactionById(id) {
    return this.transactions.find(t => t.id === id);
  }

  getSuspiciousTransactions() {
    return this.transactions.filter(t => t.isSuspicious);
  }

  getTransactionStats() {
    const total = this.transactions.length;
    const suspicious = this.transactions.filter(t => t.isSuspicious).length;
    const normal = total - suspicious;
    
    return {
      total,
      suspicious,
      normal,
      suspiciousRate: total > 0 ? (suspicious / total * 100).toFixed(2) : 0
    };
  }
}

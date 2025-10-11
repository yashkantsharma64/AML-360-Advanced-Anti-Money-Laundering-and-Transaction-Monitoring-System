// Client-side service for MongoDB operations
export class MongoDBService {
  constructor() {
    this.baseUrl = '/api';
  }

  async saveTransaction(transaction) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to save transaction');
      }
      return result.transaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async getTransactions(options = {}) {
    try {
      const { limit = 100, skip = 0, suspicious = false } = options;
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
        suspicious: suspicious.toString()
      });

      const response = await fetch(`${this.baseUrl}/transactions/list?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
      return result;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transaction');
      }
      return result;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }
      return result.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

// Enhanced AML Engine with MongoDB integration
export class ExchangeRateAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://v6.exchangerate-api.com/v6";
    this.rateCache = {};
  }

  async getExchangeRateForDate(date, currency) {
    const cacheKey = `${date}_${currency}`;
    if (this.rateCache[cacheKey]) {
      return this.rateCache[cacheKey];
    }

    try {
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
        const rate = parseFloat(data.conversion_rates[currency]) || 1.0;
        this.rateCache[cacheKey] = rate;
        return rate;
      }
    } catch (error) {
      console.error('Exchange rate API error:', error);
    }

    return 1.0;
  }

  async convertToUSD(amount, currency, date) {
    if (currency === 'USD') return parseFloat(amount);
    
    const rate = await this.getExchangeRateForDate(date, currency);
    const result = parseFloat(amount) * parseFloat(rate);
    
    console.log('Currency conversion debug:', {
      amount: amount,
      currency: currency,
      date: date,
      rate: rate,
      result: result
    });
    
    return result;
  }
}

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

  async calculateRiskScore(transaction) {
    let totalScore = 0;
    const triggeredRules = [];
    const ruleScores = {
      high_risk_country: 0,
      suspicious_keywords: 0,
      high_amount: 0,
      structuring: 0,
      rounded_amounts: 0
    };

    console.log('Risk scoring for transaction:', transaction);

    // Rule 1: Beneficiary country in high-risk list
    const beneficiaryCountry = transaction.beneficiary_country;
    console.log('Checking beneficiary country:', beneficiaryCountry);
    
    for (const [level, countries] of Object.entries(this.highRiskCountries)) {
      if (countries.includes(beneficiaryCountry)) {
        const score = level === "Level_1" ? 2 : level === "Level_2" ? 4 : 10;
        totalScore += score;
        ruleScores.high_risk_country = score;
        triggeredRules.push({
          rule: "High-risk country",
          score: score,
          details: `${beneficiaryCountry} is in ${level}`,
          rule_id: 1
        });
        console.log(`Found high-risk country: ${beneficiaryCountry} in ${level}, score: ${score}`);
        break;
      }
    }

    // Rule 2: Suspicious keyword found in payment_instruction
    const paymentInstruction = transaction.payment_instruction?.toLowerCase() || '';
    for (const keyword of this.suspiciousKeywords) {
      if (paymentInstruction.includes(keyword.toLowerCase())) {
        totalScore += 3;
        ruleScores.suspicious_keywords = 3;
        triggeredRules.push({
          rule: "Suspicious keyword",
          score: 3,
          details: `Found keyword: "${keyword}"`,
          rule_id: 2
        });
        break;
      }
    }

    // Rule 3: Amount > $1 million (in USD equivalent)
    console.log('Checking high amount rule. Amount USD:', transaction.amount_usd);
    if (transaction.amount_usd > 1000000) {
      totalScore += 3;
      ruleScores.high_amount = 3;
      triggeredRules.push({
        rule: "High amount",
        score: 3,
        details: `Amount $${transaction.amount_usd.toLocaleString()} > $1M`,
        rule_id: 3
      });
      console.log(`High amount detected: $${transaction.amount_usd.toLocaleString()} > $1M, score: 3`);
    }

    // Rule 4: Structuring - Check past 3 days for same account
    const structuringResult = await this.checkStructuringPattern(transaction);
    if (structuringResult.detected) {
      totalScore += 5;
      ruleScores.structuring = 5;
      triggeredRules.push({
        rule: "Structuring pattern",
        score: 5,
        details: `3-day sum: $${structuringResult.threeDaySum.toLocaleString()} (${structuringResult.count} transactions)`,
        rule_id: 4
      });
    }

    // Rule 5: Rounded Amounts
    const amount = transaction.amount_usd;
    const roundedAmounts = [1000000, 750000, 500000, 250000, 100000, 50000, 25000, 10000, 5000, 1000];
    if (roundedAmounts.includes(amount)) {
      totalScore += 2;
      ruleScores.rounded_amounts = 2;
      triggeredRules.push({
        rule: "Rounded amount",
        score: 2,
        details: `Amount $${amount.toLocaleString()} is a rounded figure`,
        rule_id: 5
      });
    }

    const result = {
      totalScore,
      triggeredRules,
      ruleScores,
      isSuspicious: totalScore >= 3,
      structuring_detected: structuringResult.detected,
      three_day_sum: structuringResult.threeDaySum,
      structuring_amount_range: structuringResult.amountRange
    };
    
    console.log('Final risk score result:', result);
    return result;
  }

  async checkStructuringPattern(transaction) {
    try {
      // Rule #4: Structuring (3-day sum of 8,000–9,999 range > $1M)
      // Use server-side API for proper database query
      
      const response = await fetch('/api/check-structuring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: transaction.account_id,
          transaction_date: transaction.transaction_date,
          amount_usd: transaction.amount_usd
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Structuring check result:', result);
        return {
          detected: result.detected,
          threeDaySum: result.threeDaySum,
          count: result.count,
          amountRange: result.amountRange
        };
      } else {
        console.error('Structuring check failed:', result.error);
        return {
          detected: false,
          threeDaySum: 0,
          count: 0,
          amountRange: "8000-9999"
        };
      }
    } catch (error) {
      console.error('Error checking structuring pattern:', error);
      return {
        detected: false,
        threeDaySum: 0,
        count: 0,
        amountRange: "8000-9999"
      };
    }
  }
}

// MongoDB-backed Transaction Database
export class TransactionDatabase {
  constructor() {
    this.mongoService = new MongoDBService();
  }

  async addTransaction(transaction) {
    return await this.mongoService.saveTransaction(transaction);
  }

  async getAllTransactions(limit = 100, skip = 0) {
    const result = await this.mongoService.getTransactions({ limit, skip });
    return result.transactions;
  }

  async getTransactionById(id) {
    const result = await this.mongoService.getTransactionById(id);
    return result.transaction;
  }

  async getSuspiciousTransactions(limit = 50) {
    const result = await this.mongoService.getTransactions({ limit, suspicious: true });
    return result.transactions;
  }

  async getTransactionStats() {
    return await this.mongoService.getStats();
  }
}

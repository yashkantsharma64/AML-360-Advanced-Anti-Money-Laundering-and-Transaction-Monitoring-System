import { getTransactionsCollection } from './mongodb.js';
import { formatTransactionForDB } from './transaction-schema.js';

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

// Enhanced Risk scoring rules with MongoDB integration
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

    // Rule 1: Beneficiary country in high-risk list
    const beneficiaryCountry = transaction.beneficiary_country;
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
        break; // Only count first match
      }
    }

    // Rule 3: Amount > $1 million (in USD equivalent)
    if (transaction.amount_usd > 1000000) {
      totalScore += 3;
      ruleScores.high_amount = 3;
      triggeredRules.push({
        rule: "High amount",
        score: 3,
        details: `Amount $${transaction.amount_usd.toLocaleString()} > $1M`,
        rule_id: 3
      });
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

    return {
      totalScore,
      triggeredRules,
      ruleScores,
      isSuspicious: totalScore >= 3,
      structuring_detected: structuringResult.detected,
      three_day_sum: structuringResult.threeDaySum,
      structuring_amount_range: structuringResult.amountRange
    };
  }

  async checkStructuringPattern(transaction) {
    try {
      const collection = await getTransactionsCollection();
      const transactionDate = new Date(transaction.transaction_date);
      const threeDaysAgo = new Date(transactionDate);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Query for transactions in the past 3 days from the same account
      const pastTransactions = await collection.find({
        account_id: transaction.account_id,
        transaction_date: {
          $gte: threeDaysAgo,
          $lt: transactionDate
        },
        amount_usd: {
          $gte: 8000,
          $lte: 9999
        }
      }).toArray();

      const threeDaySum = pastTransactions.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
      const detected = threeDaySum > 1000000; // $1M threshold

      return {
        detected,
        threeDaySum,
        count: pastTransactions.length,
        amountRange: "8000-9999"
      };
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
  async addTransaction(transaction) {
    try {
      const collection = await getTransactionsCollection();
      const formattedTransaction = formatTransactionForDB(transaction);
      
      const result = await collection.insertOne(formattedTransaction);
      return { ...formattedTransaction, _id: result.insertedId };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async getAllTransactions(limit = 100, skip = 0) {
    try {
      const collection = await getTransactionsCollection();
      return await collection.find({})
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getTransactionById(id) {
    try {
      const collection = await getTransactionsCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  }

  async getSuspiciousTransactions(limit = 50) {
    try {
      const collection = await getTransactionsCollection();
      return await collection.find({ isSuspicious: true })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching suspicious transactions:', error);
      return [];
    }
  }

  async getTransactionStats() {
    try {
      const collection = await getTransactionsCollection();
      const total = await collection.countDocuments();
      const suspicious = await collection.countDocuments({ isSuspicious: true });
      const normal = total - suspicious;
      
      return {
        total,
        suspicious,
        normal,
        suspiciousRate: total > 0 ? (suspicious / total * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return { total: 0, suspicious: 0, normal: 0, suspiciousRate: 0 };
    }
  }

  async getTransactionsByAccount(accountId, limit = 100) {
    try {
      const collection = await getTransactionsCollection();
      return await collection.find({ account_id: accountId })
        .sort({ transaction_date: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching transactions by account:', error);
      return [];
    }
  }

  async getStructuringAnalysis(accountId, days = 30) {
    try {
      const collection = await getTransactionsCollection();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const transactions = await collection.find({
        account_id: accountId,
        transaction_date: { $gte: startDate },
        amount_usd: { $gte: 8000, $lte: 9999 }
      }).sort({ transaction_date: 1 }).toArray();

      // Group by date and calculate daily sums
      const dailySums = {};
      transactions.forEach(t => {
        const date = t.transaction_date.toISOString().split('T')[0];
        dailySums[date] = (dailySums[date] || 0) + t.amount_usd;
      });

      return {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount_usd, 0),
        dailySums,
        suspiciousDays: Object.entries(dailySums).filter(([_, sum]) => sum > 1000000)
      };
    } catch (error) {
      console.error('Error fetching structuring analysis:', error);
      return { totalTransactions: 0, totalAmount: 0, dailySums: {}, suspiciousDays: [] };
    }
  }
}

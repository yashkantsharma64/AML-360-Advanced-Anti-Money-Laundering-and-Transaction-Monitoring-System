# AML RAG Chatbot System

An intelligent chatbot system that uses Retrieval-Augmented Generation (RAG) to answer questions about AML transaction data.

## Features

- **RAG-Powered Chat**: Ask questions about transaction data using natural language
- **CSV Upload**: Upload CSV files with transaction data for analysis
- **MongoDB Integration**: Automatically exports MongoDB transaction data to CSV
- **Real-time Data Refresh**: Update the chatbot with latest MongoDB data
- **Source Attribution**: See which data sources were used for each answer

## Prerequisites

### 1. Ollama Installation
```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull the required model
ollama pull llama3.1:8b
```

### 2. Python Dependencies
```bash
# Install Python requirements
pip install -r requirements_chatbot.txt
```

### 3. MongoDB (Optional)
The chatbot can work with uploaded CSV files or connect to MongoDB for automatic data export.

## Quick Start

### Option 1: Using the Startup Script
```bash
# Navigate to chatbot directory
cd chatbot

# Run the startup script
python start_chatbot.py
```

### Option 2: Manual Start
```bash
# Navigate to chatbot directory
cd chatbot

# Install requirements
pip install -r requirements_chatbot.txt

# Start the API server
python api.py
```

The chatbot API will be available at:
- **API**: http://localhost:8001
- **Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Usage

### 1. Start the Chatbot
1. Open the AML monitoring system homepage
2. Click the "AI Assistant" button in the header
3. The chatbot modal will open

### 2. Upload CSV Data
1. Click "📁 Upload CSV" in the chatbot
2. Select a CSV file with transaction data
3. The chatbot will process and index the data

### 3. Ask Questions
Try these example queries:
- "Show me all suspicious transactions"
- "What's the risk score for transaction ID XYZ?"
- "How many transactions are from India?"
- "Find transactions with amount greater than $10,000"
- "What's the average risk score?"

### 4. Refresh Data
- Click "🔄 Refresh Data" to update with latest MongoDB data
- The system automatically exports MongoDB transactions to CSV

## API Endpoints

### Chat
```http
POST /chat
Content-Type: application/json

{
  "message": "Show me suspicious transactions"
}
```

### Upload CSV
```http
POST /upload-csv
Content-Type: multipart/form-data

file: [CSV file]
```

### Refresh Data
```http
POST /refresh-data
```

### Health Check
```http
GET /health
```

## CSV Format

The chatbot works with CSV files containing transaction data. Expected columns include:
- `transaction_id`
- `amount_usd`
- `originator_name`
- `beneficiary_name`
- `originator_country`
- `beneficiary_country`
- `risk_score`
- `isSuspicious`
- `transaction_date`

## Configuration

### Environment Variables
```bash
# MongoDB connection (optional)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aml_monitoring

# Ollama model (default: llama3.1:8b)
OLLAMA_MODEL=llama3.1:8b
```

### Model Configuration
The system uses:
- **LLM**: Ollama with llama3.1:8b model
- **Embeddings**: sentence-transformers/all-mpnet-base-v2
- **Vector Store**: FAISS (in-memory)

## Troubleshooting

### Ollama Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull the model if missing
ollama pull llama3.1:8b

# List available models
ollama list
```

### Python Dependencies
```bash
# Update pip
pip install --upgrade pip

# Install requirements
pip install -r requirements_chatbot.txt

# Check installation
python -c "import langchain; print('LangChain installed')"
```

### MongoDB Connection
```bash
# Check MongoDB connection
mongosh "mongodb://localhost:27017"

# Verify database and collection
use aml_monitoring
db.transactions.countDocuments()
```

## Development

### Adding New Features
1. Modify `chatbot/api.py` for backend changes
2. Update `components/Chatbot.js` for frontend changes
3. Test with different CSV formats and query types

### Customizing the LLM
```python
# In api.py, change the model
llm = OllamaLLM(model="your-preferred-model")
```

### Adding New Data Sources
1. Modify the `export_mongodb_to_csv()` function
2. Add new data processing logic
3. Update the RAG system prompt

## Security Notes

- The chatbot API runs on localhost by default
- No authentication is implemented (suitable for local development)
- CSV files are processed in memory and not permanently stored
- MongoDB credentials should be properly secured in production

## Performance

- **Memory Usage**: ~2-4GB (depends on data size and model)
- **Response Time**: 2-10 seconds (depends on query complexity)
- **Concurrent Users**: Limited by Ollama model capacity
- **Data Size**: Supports datasets up to ~100MB CSV files

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify Ollama and MongoDB are running
3. Check the API logs for error messages
4. Ensure CSV format matches expected schema

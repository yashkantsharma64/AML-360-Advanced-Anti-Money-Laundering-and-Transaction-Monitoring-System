from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import tempfile
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_openai import OpenAIEmbeddings
import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_ollama import OllamaLLM
import json
from typing import List, Dict, Any
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

app = FastAPI(title="AML RAG Chatbot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for RAG system
vector_store = None
rag_chain = None
llm = None
embeddings = None

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

def initialize_rag_system():
    """Initialize the RAG system with embeddings and LLM"""
    global llm, embeddings, vector_store, rag_chain
    
    try:
        # Initialize LLM (Ollama)
        llm = OllamaLLM(model="llama3.1:8b")
        
        # Initialize embeddings (using a simple approach)
        embeddings = OpenAIEmbeddings(openai_api_key="dummy-key")  # We'll use a simple fallback
        
        # Create empty vector store
        dim = len(embeddings.embed_query(" "))
        index = faiss.IndexFlatL2(dim)
        
        vector_store = FAISS(
            embedding_function=embeddings,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={}
        )
        
        # Create RAG chain
        system_prompt = (
            "You are an AML (Anti-Money Laundering) assistant for question-answering tasks using RAG from transaction data. "
            "Use the following pieces of retrieved context to answer the question. "
            "This data contains transaction information including transaction_id, amounts, countries, risk scores, and suspicious flags. "
            "You can help with queries like: "
            "- Finding specific transactions by ID "
            "- Analyzing suspicious transactions "
            "- Counting transactions by criteria "
            "- Risk score analysis "
            "- Country-wise transaction analysis "
            "If you don't know the answer, say that you don't know. Use three sentences maximum and keep the answer concise."
            "\n\n"
            "{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(vector_store.as_retriever(), question_answer_chain)
        
        print("RAG system initialized successfully")
        
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
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

def load_csv_to_rag(csv_path: str):
    """Load CSV file into RAG system"""
    global vector_store, rag_chain
    
    try:
        # Load CSV documents
        loader = CSVLoader(file_path=csv_path)
        docs = loader.load_and_split()
        
        # Add documents to vector store
        vector_store.add_documents(documents=docs)
        
        # Update RAG chain with new retriever
        rag_chain = create_retrieval_chain(vector_store.as_retriever(), rag_chain.combine_documents_chain)
        
        print(f"Loaded {len(docs)} documents from {csv_path}")
        return True
        
    except Exception as e:
        print(f"Error loading CSV to RAG: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize RAG system on startup"""
    initialize_rag_system()
    
    # Export MongoDB data to CSV and load into RAG
    csv_path = await export_mongodb_to_csv()
    if csv_path:
        load_csv_to_rag(csv_path)

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV file and add to RAG system"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Load CSV into RAG system
        success = load_csv_to_rag(tmp_file_path)
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        if success:
            return {"message": f"CSV file '{file.filename}' uploaded and processed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to process CSV file")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the RAG system"""
    try:
        if not rag_chain:
            raise HTTPException(status_code=500, detail="RAG system not initialized")
        
        # Get response from RAG chain
        result = rag_chain.invoke({"input": request.message})
        
        # Extract sources from retrieved documents
        sources = []
        if 'context' in result:
            for doc in result['context']:
                sources.append({
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                })
        
        return ChatResponse(
            answer=result['answer'],
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refresh-data")
async def refresh_data():
    """Refresh RAG system with latest MongoDB data"""
    try:
        # Export latest MongoDB data
        csv_path = await export_mongodb_to_csv()
        
        if csv_path:
            # Clear existing vector store
            global vector_store
            dim = len(embeddings.embed_query(" "))
            index = faiss.IndexFlatL2(dim)
            
            vector_store = FAISS(
                embedding_function=embeddings,
                index=index,
                docstore=InMemoryDocstore(),
                index_to_docstore_id={}
            )
            
            # Load new data
            success = load_csv_to_rag(csv_path)
            
            if success:
                return {"message": "Data refreshed successfully with latest MongoDB transactions"}
            else:
                raise HTTPException(status_code=500, detail="Failed to refresh data")
        else:
            raise HTTPException(status_code=500, detail="No data found in MongoDB")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "rag_initialized": rag_chain is not None,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

#!/usr/bin/env python3
"""
Startup script for the AML RAG Chatbot API
"""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path

def check_ollama():
    """Check if Ollama is running and has the required model"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [model["name"] for model in models]
            
            if "llama3.1:8b" in model_names:
                print("✅ Ollama is running with llama3.1:8b model")
                return True
            else:
                print("❌ Ollama is running but llama3.1:8b model not found")
                print("Available models:", model_names)
                print("Please run: ollama pull llama3.1:8b")
                return False
        else:
            print("❌ Ollama is not responding")
            return False
    except requests.exceptions.RequestException:
        print("❌ Ollama is not running")
        print("Please start Ollama and pull the model:")
        print("1. Start Ollama: ollama serve")
        print("2. Pull model: ollama pull llama3.1:8b")
        return False

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements_chatbot.txt"
        ], check=True, cwd=Path(__file__).parent)
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def start_api():
    """Start the FastAPI server"""
    print("🚀 Starting AML RAG Chatbot API...")
    try:
        # Start the API server
        subprocess.run([
            sys.executable, "api.py"
        ], cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n🛑 Chatbot API stopped")
    except Exception as e:
        print(f"❌ Error starting API: {e}")

def main():
    """Main startup function"""
    print("🤖 AML RAG Chatbot Startup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("api.py").exists():
        print("❌ Please run this script from the chatbot directory")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Check Ollama
    if not check_ollama():
        print("\n⚠️  Ollama setup required before starting the chatbot")
        sys.exit(1)
    
    # Start the API
    print("\n🎯 Starting chatbot API on http://localhost:8001")
    print("📖 API documentation: http://localhost:8001/docs")
    print("🔄 Press Ctrl+C to stop")
    print("=" * 40)
    
    start_api()

if __name__ == "__main__":
    main()

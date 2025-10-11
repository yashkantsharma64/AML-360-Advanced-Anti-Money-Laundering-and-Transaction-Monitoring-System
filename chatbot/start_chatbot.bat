@echo off
echo 🤖 AML RAG Chatbot Startup
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "api.py" (
    echo ❌ Please run this script from the chatbot directory
    pause
    exit /b 1
)

echo 📦 Installing Python requirements...
python -m pip install -r requirements_chatbot.txt
if errorlevel 1 (
    echo ❌ Failed to install requirements
    pause
    exit /b 1
)

echo ✅ Requirements installed successfully

echo.
echo 🚀 Starting AML RAG Chatbot API...
echo 📖 API will be available at: http://localhost:8001
echo 📚 API documentation: http://localhost:8001/docs
echo 🔄 Press Ctrl+C to stop
echo ========================================

python api.py

pause

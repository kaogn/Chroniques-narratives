#!/usr/bin/env python3
"""
Human Memories API - Simplified Entry Point for Railway
"""

import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Simple FastAPI app for Railway deployment
app = FastAPI(
    title="Human Memories API",
    version="1.0.0",
    description="API for the Human Memories narrative game"
)

# CORS middleware - simplified for initial deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will configure properly with frontend domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🧠 Human Memories API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "service": "human-memories-api", 
        "environment": os.getenv("ENVIRONMENT", "production"),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint"""
    return {
        "message": "✅ API is working correctly",
        "data": {
            "game": "Human Memories",
            "description": "Narrative game about collective memory",
            "status": "development",
            "endpoints": ["/", "/health", "/api/test"]
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/game/status")
async def game_status():
    """Game status endpoint"""
    return {
        "game_engine": "ready",
        "database": "not_connected_yet", 
        "features": [
            "8 historical epochs",
            "Technology selection system", 
            "Narrative generation",
            "Chronicle creation"
        ],
        "next_steps": ["Connect database", "Add game logic", "Create frontend"]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
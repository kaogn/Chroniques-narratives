#!/usr/bin/env python3
"""
Human Memories API - Simplified Entry Point for Railway
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Simple FastAPI app for Railway deployment
app = FastAPI(
    title="Human Memories API",
    version="1.0.0",
    description="API for the Human Memories narrative game"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Human Memories API is running!",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "timestamp": "2025-09-10"
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint"""
    return {
        "message": "API is working correctly",
        "data": {
            "game": "Human Memories",
            "status": "development"
        }
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
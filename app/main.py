from __future__ import annotations

# 1. Add these two lines at the VERY top
from dotenv import load_dotenv
load_dotenv() 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

# This import triggers the Gemini client setup in compare.py, 
# so load_dotenv() must happen before this line.
from app.compare import compare_latest_snapshots 

from .database import Base, engine
from .routes.jobs import router as jobs_router
from .routes.insights import router as insights_router
from .routes.snapshots import router as snapshots_router
from .routes.signals import router as signals_router

# ✅ Create app FIRST
app = FastAPI(title="FastAPI + SQLite CRUD")

# ✅ Enable CORS (for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Compare endpoint (your core feature)
class AnalyzeRequest(BaseModel):
    product_info: str
    competitor_url: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@app.post("/api/analyze")
def analyze_endpoint(request: AnalyzeRequest):
    from app.compare import analyze_competitor
    return analyze_competitor(request.product_info, request.competitor_url)

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    from app.compare import chat_with_markanalyst
    return chat_with_markanalyst([{"role": m.role, "content": m.content} for m in request.messages])

# ✅ NEW: Insights endpoint (needed for frontend dashboard)
@app.get("/api/insights")
def get_insights():
    # Note: You might want to pass a dynamic URL here later!
    result = compare_latest_snapshots("https://example.com")

    if "error" in result:
        return []

    return [
        {
            "company": "Example",
            "change_type": "Messaging",
            "summary": result["insight"],
            # Similarity is 0-100, so we divide by 100 to get a 0-1 confidence scale
            "confidence": round(1 - (result["similarity"] / 100), 2),
            "source_url": result["url"],
            "recommended_action": "Review recent changes and adjust positioning"
        }
    ]

# ✅ Mount static files directory
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def serve_react_app():
    return FileResponse("frontend/index.html")

@app.get("/styles.css")
def serve_styles():
    return FileResponse("frontend/styles.css")

@app.get("/app.jsx")
def serve_jsx():
    return FileResponse("frontend/app.jsx")

# ✅ Startup event (creates DB tables)
@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

# ✅ Include existing routers
app.include_router(snapshots_router)
app.include_router(insights_router)
app.include_router(signals_router)
app.include_router(jobs_router)
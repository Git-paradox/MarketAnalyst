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

from .database import Base, engine, SessionLocal
from .models import User, UserAnalysis
from .routes.jobs import router as jobs_router
import hashlib
import json
from datetime import datetime
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

class SignupRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
def signup(request: SignupRequest):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == request.email).first()
        if user:
            return {"error": "Email already registered"}
        pwd_hash = hashlib.sha256(request.password.encode()).hexdigest()
        new_user = User(email=request.email, password_hash=pwd_hash)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "email": new_user.email}

@app.post("/api/auth/login")
def login(request: SignupRequest):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == request.email).first()
        if not user or user.password_hash != hashlib.sha256(request.password.encode()).hexdigest():
            return {"error": "Invalid credentials"}
        return {"id": user.id, "email": user.email}

class AnalyzeRequest(BaseModel):
    product_info: str
    competitor_url: str
    user_id: int = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@app.post("/api/analyze")
def analyze_endpoint(request: AnalyzeRequest):
    from app.compare import analyze_competitor
    result = analyze_competitor(request.product_info, request.competitor_url)
    
    if "error" not in result and request.user_id:
        with SessionLocal() as db:
            analysis = UserAnalysis(
                user_id=request.user_id,
                product_info=request.product_info,
                competitor_url=request.competitor_url,
                result_json=json.dumps(result),
                timestamp=datetime.utcnow()
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            result["analysis_id"] = analysis.id
            
    return result

@app.get("/api/history/{user_id}")
def get_user_history(user_id: int):
    with SessionLocal() as db:
        analyses = db.query(UserAnalysis).filter(UserAnalysis.user_id == user_id).order_by(UserAnalysis.timestamp.desc()).all()
        return [
            {
                "id": a.id,
                "product_info": a.product_info,
                "competitor_url": a.competitor_url,
                "timestamp": a.timestamp.isoformat(),
                "result": json.loads(a.result_json)
            } for a in analyses
        ]

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    from app.compare import chat_with_snaptracker
    return chat_with_snaptracker([{"role": m.role, "content": m.content} for m in request.messages])

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
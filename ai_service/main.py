from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from services.resume_engine import generate_resume
from services.cover_letter_engine import generate_cover_letter
from services.matching_engine import generate_embedding, calculate_match_score

load_dotenv()

app = FastAPI(title="Job Hub AI - FastAPI Layer")

# Pydantic Models for Request Bodies
class JobSeekerProfile(BaseModel):
    first_name: str
    last_name: str
    bio: str
    skills: List[str]

class JobDescription(BaseModel):
    title: str
    description: str
    company_name: str

class CoverLetterRequest(BaseModel):
    profile: JobSeekerProfile
    job: JobDescription

class MatchScoreRequest(BaseModel):
    profile_text: str
    job_description_text: str

class EmbeddingRequest(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "FastAPI AI Layer"}

@app.post("/ai/resume/generate")
def api_generate_resume(profile: JobSeekerProfile):
    try:
        resume_content = generate_resume(profile.dict())
        return {"resume": resume_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/cover-letter/generate")
def api_generate_cover_letter(req: CoverLetterRequest):
    try:
        cover_letter = generate_cover_letter(req.profile.dict(), req.job.dict())
        return {"cover_letter": cover_letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/match/score")
def api_match_score(req: MatchScoreRequest):
    try:
        score = calculate_match_score(req.profile_text, req.job_description_text)
        return {"match_score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/embeddings/generate")
def api_generate_embedding(req: EmbeddingRequest):
    try:
        embedding = generate_embedding(req.text)
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

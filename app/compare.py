from app.database import SessionLocal
from app.models import Snapshot
from app.diff_utils import diff_strings

import os
import time
import json
import requests
import re
from groq import Groq

# Initialize Groq client
api_key = os.environ.get("GROQ_API_KEY")
print(f"DEBUG: API Key loaded starts with: {str(api_key)[:8]}...")
client = Groq(api_key=api_key)

def scrape_text(url: str) -> str:
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        html = response.text
        html = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:3000]
    except Exception as e:
        print(f"Scrape error for {url}: {e}")
        return ""

def analyze_competitor(product_info: str, competitor_url: str):
    competitor_text = scrape_text(competitor_url)
    if not competitor_text:
        competitor_text = "Failed to scrape the competitor's website completely. Use context based on the URL and general knowledge."
    
    prompt = f"""
You are SnapTracker, an expert SaaS competitive intelligence analyzer.
A user has provided info about their product:
{product_info[:1500]}

They want to compare their product against a competitor's website: {competitor_url}
Here is the text scraped from the competitor's website:
{competitor_text}

TASK:
1. Compare the two products highlighting strengths and weaknesses.
2. Identify and explicitly state the absolutely best places online to scrape review data from (e.g. G2, Capterra, Reddit r/SaaS, TrustRadius) for THIS specific comparison. Put these sources in the 'sources_decided' array.
3. Search your vast training knowledge base, simulating data from those exact customer sources to perform the comparison.
4. Provide actionable intelligence on how the user's product can win against them.
5. Provide specific ideas on areas where the user should improve their product to stay competitive.

Return ONLY valid JSON in this format:
{{
  "similarity": 45,
  "sources_decided": ["G2 Reviews for Competitor X", "Reddit SaaS forums"],
  "insight": "Deep AI insight on positioning and G2/Capterra sentiment...",
  "change_type": "opportunity" or "threat" or "strength" or "weakness",
  "impact": "low" or "medium" or "high",
  "confidence": 85,
  "improvements": [
    "Add automated workflow feature to match competitor",
    "Improve onboarding based on competitor's weak G2 ratings"
  ],
  "changes": [
    {{"from": "Competitor's approach to feature X", "to": "Your product's better approach"}},
    {{"from": "Competitor's common G2 complaint", "to": "Your opportunity to solve it"}}
  ]
}}
"""

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
            )
            raw_text = response.choices[0].message.content.strip()
            
            # Handle potential markdown formatting in response
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1)
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                    
            data = json.loads(raw_text.strip())
            return data
        except Exception as e:
            if attempt == 2:
                return {"error": f"Failed to analyze data: {str(e)}"}
            time.sleep(2)

def chat_with_snaptracker(messages: list[dict]):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": "You are SnapTracker, an expert SaaS competitive intelligence analyzer. Answer the user's questions concerning the competitive analysis that was just performed. Be concise and deeply insightful. DO NOT use markdown like ```json, just return raw text for chat."}] + messages[-15:],
            max_tokens=600,
        )
        return {"response": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": f"Failed to get AI response: {str(e)}"}

def generate_insight(old_text: str, new_text: str):
    """
    Calls Groq LLM and returns structured insight (dict)
    """
    for attempt in range(3):
        try:
            prompt = f"""
Analyze the change between two website versions.

Return ONLY valid JSON in this format:
{{
  "change_type": "pricing | feature | messaging | other",
  "impact": "low | medium | high",
  "summary": "one sentence summary",
  "confidence": 0 to 1
}}

OLD:
{old_text[:800]}

NEW:
{new_text[:800]}
"""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=120,
            )

            response_text = response.choices[0].message.content.strip()

            # ✅ Parse JSON safely
            try:
                data = json.loads(response_text)
            except Exception:
                data = {
                    "change_type": "other",
                    "impact": "medium",
                    "summary": response_text,
                    "confidence": 0.7
                }

            return data

        except Exception as e:
            if "429" in str(e) or "rate_limit" in str(e).lower():
                wait_time = attempt * 2 + 2
                print(f"Rate limit hit. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
                continue

            print("Groq error:", e)
            break

    # ✅ Final fallback
    return {
        "change_type": "other",
        "impact": "medium",
        "summary": "Website content updated with notable changes",
        "confidence": 0.6
    }


def compare_latest_snapshots(url: str):
    """
    Fetches latest 2 snapshots, compares, and returns structured output
    """
    with SessionLocal() as db:
        snaps = (
            db.query(Snapshot)
            .filter(Snapshot.url == url)
            .order_by(Snapshot.timestamp.desc())
            .limit(2)
            .all()
        )

        if len(snaps) < 2:
            return {"error": "Not enough snapshots for this URL"}

        latest, previous = snaps[0], snaps[1]

        # Diff + similarity
        result = diff_strings(previous.text, latest.text)

        # AI insight (now structured)
        insight_data = generate_insight(previous.text, latest.text)

        return {
            "url": url,
            "similarity": round(result["similarity_score"] * 100, 2),
            "changes": result["changed_sentences"],

            # 🔥 Structured fields for frontend visuals
            "insight": insight_data["summary"],
            "change_type": insight_data["change_type"],
            "impact": insight_data["impact"],
            "confidence": round(insight_data["confidence"] * 100, 2),
        }
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

def ask_llm(messages, max_tokens=2500):
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=max_tokens,
            )
            raw_text = response.choices[0].message.content.strip()
            
            # Robust JSON extraction
            start_obj = raw_text.find('{')
            start_arr = raw_text.find('[')
            
            is_obj = start_obj != -1 and (start_arr == -1 or start_obj < start_arr)
            is_arr = start_arr != -1 and (start_obj == -1 or start_arr < start_obj)
            
            if is_obj:
                end_obj = raw_text.rfind('}') + 1
                raw_text = raw_text[start_obj:end_obj]
            elif is_arr:
                end_arr = raw_text.rfind(']') + 1
                raw_text = raw_text[start_arr:end_arr]
            
            return raw_text.strip()
        except Exception as e:
            if attempt == 2:
                raise e
            time.sleep(2)

def analyze_competitors(product_info: str, brand_names: str, previous_scraped_text: str = None, sales_trend: str = None):
    # Step 1: Autonomous URL Discovery
    discovery_msg = [
        {"role": "system", "content": "You are an expert at identifying official SaaS company websites."},
        {"role": "user", "content": f"Return a JSON array of exactly 1 official homepage URL for each of these companies/products: {brand_names}. Only return the JSON array, like [\"https://website.com\"]."}
    ]
    try:
        urls_json = ask_llm(discovery_msg, 200)
        urls_to_scrape = json.loads(urls_json)
        if not isinstance(urls_to_scrape, list):
            urls_to_scrape = [brand_names] # Fallback
    except:
        urls_to_scrape = [] # If all else fails
        
    # Step 2: Parallel/Sequential Scraping
    combined_competitor_text = ""
    for url in urls_to_scrape:
        text = scrape_text(url)
        if text:
            combined_competitor_text += f"\n--- DATA FROM {url} ---\n{text}"
            
    if not combined_competitor_text.strip():
        combined_competitor_text = "Failed to scrape any live competitor data. Rely entirely on your LLM internal training data regarding these specific brands."

    # Step 3: Historical Diffing
    diff_metrics = None
    shift_prompt = "No historical tracking data is available for these brands yet. Proceed with standard analysis."
    
    if previous_scraped_text:
        old_words = set(previous_scraped_text.split())
        new_words = set(combined_competitor_text.split())
        added = len(new_words - old_words)
        removed = len(old_words - new_words)
        total_old = max(len(old_words), 1)
        volat = round(((added + removed) / total_old) * 100, 1)
        diff_metrics = {"words_added": added, "words_removed": removed, "volatility": volat}
        
        shift_prompt = f"""
CRITICAL TRACKING ALERT: You have historical data for these competitors!
OLD MARKET DATA (Last Tracked):
{previous_scraped_text[:2000]}

NEW MARKET DATA (Current):
{combined_competitor_text[:2000]}

Analyze the explicit differences between their old version and new version. Specifically extract what marketing, pricing, or product pivots they just made. Document this strictly in the 'historical_shifts' JSON array.
"""

    sales_prompt = ""
    if sales_trend and sales_trend.strip():
        sales_prompt = f"3. CRITICAL SALES CONTEXT: The user provided a recent change in their sales vector: '{sales_trend}'. You MUST analyze this sales trend against the competitor's historical changes/features. Why are their sales moving that way? Extract exact JSON reasoning into 'sales_reasoning'. NEVER use generic names like 'Competitor X' or 'Competitor Y'; ALWAYS use their EXACT brand names.\n"

    # Step 4: Multi-Matrix Synthesis
    prompt = f"""
You are SnapTracker, an expert SaaS competitive intelligence analyzer.
A user provides info about their product:
{product_info[:1500]}

They want to compare their product against MULTIPLE competitors simultaneously: {brand_names}
Here is the raw data scraped autonomously from their websites right now:
{combined_competitor_text[:5000]}

TASK:
1. Provide a massive Multi-Competitor Matrix evaluating your product against EACH of these competitors individually.
2. {shift_prompt}
{sales_prompt}
4. Generate a highly detailed `changes` array containing AT LEAST 5 deep strategic comparisons mapping exactly how the user's product can crush the generic competitor approach.
5. Generate an `improvements` array containing AT LEAST 7 robust strategic actions the user should take immediately.
CRITICAL RULE: NEVER refer to any company as "Competitor X", "Competitor Y", "Competitor 1", etc. ALWAYS formulate your responses using the explicit brand names found in the data. Be highly professional and ruthless in your analysis.

Return ONLY valid JSON in this exact format:
{{
  "aggregate_insight": "A brilliant summary of the entire market comparing the user's product to all competitors...",
  "sources_decided": {json.dumps(urls_to_scrape) if urls_to_scrape else '["Relying on AI Training Data"]'},
  "historical_shifts": ["Competitor X changed pricing...", "Competitor Y launched a new feature..."],
  "sales_reasoning": "We believe your sales dropped because [Actual Brand Name] launched a cheaper tier capturing the mid-market...",
  "change_type": "opportunity",
  "impact": "low",
  "confidence": 85,
  "improvements": ["Deeply strategic action plan involving building an integrations marketplace...", "Second heavy strategic optimization..."],
  "changes": [
    {{"from": "[Actual Brand Name] relies on outdated manual integration requiring 10 clicks.", "to": "Your product uses an automated, invisible API sync that saves 5 hours a week."}}
  ],
  "matrix": [
    {{
      "name": "Competitor 1", 
      "strength": "Strong feature set", 
      "weakness": "High price", 
      "similarity": 45,
      "revenue": "$50M est.",
      "user_base": "100k users",
      "review_summary": "Users praise the ease of use on G2, but find the support slow on Capterra."
    }}
  ]
}}
"""

    try:
        result_json = ask_llm([{"role": "user", "content": prompt}], max_tokens=2500)
        data = json.loads(result_json)
        # Ensure fallback keys & rounding
        if "matrix" not in data: data["matrix"] = []
        if "similarity" not in data: 
            data["similarity"] = round(sum([m.get("similarity", 50) for m in data["matrix"]]) / max(len(data["matrix"]), 1)) if data["matrix"] else 50
        else:
            data["similarity"] = round(float(data["similarity"]))
            
        if "confidence" in data:
            data["confidence"] = round(float(data["confidence"]))
            
        if "insight" not in data: data["insight"] = data.get("aggregate_insight", "")
        
        data["scraped_text"] = combined_competitor_text
        data["diff_metrics"] = diff_metrics
        return data
    except Exception as e:
        return {"error": f"Failed to perform multi-matrix analysis: {str(e)}"}

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

            # Parse JSON safely
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
                print(f"Rate limit hit. Retrying in {{wait_time}} seconds...")
                time.sleep(wait_time)
                continue

            print("Groq error:", e)
            break

    # Final fallback
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

            # Structured fields for frontend visuals
            "insight": insight_data["summary"],
            "change_type": insight_data["change_type"],
            "impact": insight_data["impact"],
            "confidence": round(insight_data["confidence"] * 100, 2),
        }
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os, json, time
from datetime import datetime, timedelta

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
PRIMARY_MODEL = "gemini-3.1-flash-lite"
FALLBACK_MODEL = "gemini-2.5-flash"

def generate_with_retry(prompt, max_retries=3):
    models = [PRIMARY_MODEL] * max_retries + [FALLBACK_MODEL]
    last_err = None
    for i, m in enumerate(models):
        try:
            resp = genai.GenerativeModel(m).generate_content(prompt)
            return resp.text
        except Exception as e:
            last_err = e
            if i < max_retries:
                time.sleep(1.5)
    raise Exception(f"All models failed: {last_err}")

def clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()

class DiscoverRequest(BaseModel):
    origin: str
    interests: list[str] = []
    budget_usd: int = 2000
    trip_duration_days: int = 7
    timeframe_months: int = 2
    travel_style: str = "balanced"

@router.post("/discover")
async def discover_destinations(req: DiscoverRequest):
    # Calculate target months
    now = datetime.now()
    target_date = now + timedelta(days=req.timeframe_months * 30)
    target_month = target_date.strftime("%B %Y")

    interests_str = ', '.join(req.interests) if req.interests else 'culture, food, nature'
    origin_city = req.origin.split(',')[0].strip()

    prompt = f"""You are an expert travel deal finder. Find the best value destinations for this traveler.

Traveler profile:
- Origin city: {origin_city}
- Interests: {interests_str}
- Budget per person: ${req.budget_usd} USD (total including flights + hotel + food + activities)
- Trip length: {req.trip_duration_days} days
- Planning to travel around: {target_month}
- Travel style: {req.travel_style}

Find 6 best-value destinations considering:
1. Current flight deals from {origin_city} to each destination
2. Seasonal weather and events in {target_month}
3. Total trip cost fitting within ${req.budget_usd} budget
4. Match to interests: {interests_str}

Return ONLY a valid raw JSON object, no markdown, no explanation:

{{
  "timeframe": "Around {target_month}",
  "search_month": "{target_month}",
  "deals_summary": "Brief summary of what was found",
  "best_month_to_travel": "Month name",
  "money_saving_tip": "Practical tip for saving money from {origin_city}",
  "destinations": [
    {{
      "rank": 1,
      "city": "Bangkok",
      "country": "Thailand",
      "emoji_flag": "🇹🇭",
      "unsplash_keyword": "bangkok thailand",
      "why_now": "Why visit in {target_month} specifically",
      "seasonal_highlight": "e.g. Dry season, festivals, low crowds",
      "deal_score": 88,
      "deal_badge": "Hot deal",
      "estimated_flight_usd": 320,
      "flight_note": "Direct flights available on Air Asia from {origin_city}",
      "cheapest_booking_platform": "Skyscanner",
      "skyscanner_link": "https://www.skyscanner.com",
      "estimated_hotel_per_night_usd": 35,
      "hotel_note": "Budget guesthouses in Sukhumvit area",
      "estimated_total_usd": 980,
      "total_vs_budget": "Under budget by 51%",
      "best_for": ["Budget travelers", "Food lovers", "Culture"],
      "not_ideal_for": ["Beach lovers", "Party seekers"],
      "weather": "28C avg, sunny, low rainfall",
      "crowd_level": "Moderate",
      "visa_for_origin": "Visa on arrival for Indians",
      "top_3_things": [
        "Grand Palace and Wat Pho temple complex",
        "Street food tour in Chinatown (Yaowarat)",
        "Day trip to Ayutthaya ancient temples"
      ],
      "local_tip": "Buy a Rabbit Card for BTS Skytrain — works on all lines and saves 15%",
      "hidden_gem": "Talat Noi neighbourhood — old Portuguese quarter, no tourists",
      "festivals_in_window": ["Songkran water festival (if April)"],
      "similar_to": "If you love this, also check Chiang Mai or Hanoi"
    }}
  ]
}}

Make all 6 destinations real, diverse, and accurately priced for flights from {origin_city}.
Vary the destinations — mix of nearby, regional, and long-haul options.
Return ONLY the JSON object."""

    try:
        raw = generate_with_retry(prompt)
        data = json.loads(clean_json(raw))
        return data
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
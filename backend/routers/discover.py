from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os, json, time

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
PRIMARY_MODEL = "gemini-3.1-flash-lite"
FALLBACK_MODEL = "gemini-2.5-flash"

def generate_with_retry(prompt, max_retries=3):
    models_to_try = [PRIMARY_MODEL] * max_retries + [FALLBACK_MODEL]
    last_error = None
    for i, m in enumerate(models_to_try):
        try:
            return genai.GenerativeModel(m).generate_content(prompt).text
        except Exception as e:
            last_error = e
            if i < max_retries: time.sleep(1.5)
    raise Exception(f"All models failed: {last_error}")

def clean_json(raw):
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1][4:] if parts[1].startswith("json") else parts[1]
    return raw.strip()

class DiscoverRequest(BaseModel):
    origin: str
    interests: list[str] = []
    budget_usd: int = 2000
    trip_duration_days: int = 7
    timeframe_months: int = 2   # look ahead 1, 2, or 4 months
    travel_style: str = "balanced"

@router.post("/discover")
async def discover_destinations(req: DiscoverRequest):
    prompt = f"""You are an expert travel deal finder and destination recommender.

Traveler profile:
- Origin: {req.origin}
- Interests: {', '.join(req.interests) if req.interests else 'culture, food, nature'}
- Budget: ${req.budget_usd} per person
- Trip length: {req.trip_duration_days} days
- Looking for trips in the next {req.timeframe_months} month(s)
- Style: {req.travel_style}

Find the BEST value destinations for this traveler right now. Consider:
1. Seasonal suitability (weather, festivals, events in next {req.timeframe_months} months)
2. Flight deals from {req.origin} — focus on low-cost routes
3. Budget fit — accommodation + food + activities within ${req.budget_usd}
4. Match to interests: {', '.join(req.interests) if req.interests else 'general travel'}

Return ONLY raw JSON (no markdown):
{{
  "timeframe": "Next {req.timeframe_months} month(s)",
  "search_month": "Month you are recommending for",
  "destinations": [
    {{
      "rank": 1,
      "city": "City name",
      "country": "Country name",
      "emoji_flag": "🇯🇵",
      "hero_image_search": "city landmark travel photo",
      "unsplash_keyword": "tokyo japan city",
      "why_now": "Why this is perfect to visit in the next {req.timeframe_months} months",
      "seasonal_highlight": "Cherry blossom season / Dry season / Low crowds",
      "deal_score": 92,
      "deal_badge": "Hot deal",
      "estimated_flight_usd": 380,
      "flight_note": "Direct flights from {req.origin} available on Air India",
      "cheapest_booking_platform": "Google Flights or Skyscanner",
      "skyscanner_link": "https://www.skyscanner.com/transport/flights/{req.origin.split(',')[0].lower().replace(' ','')}/",
      "estimated_hotel_per_night_usd": 45,
      "hotel_note": "Budget guesthouses in Shinjuku area",
      "estimated_total_usd": 1200,
      "total_vs_budget": "42% under budget",
      "best_for": ["Solo travel", "Couples", "Food lovers"],
      "not_ideal_for": ["Party seekers", "Beach lovers"],
      "weather": "22°C avg, mostly sunny, low rain",
      "crowd_level": "Moderate",
      "visa_for_origin": "Free e-visa on arrival",
      "top_3_things": [
        "Walk through Senso-ji Temple at dawn",
        "Eat your way through Tsukiji outer market",
        "Teamlab Planets digital art experience"
      ],
      "local_tip": "Buy a 7-day Suica card at the airport — works on all metro, trains, and convenience stores",
      "hidden_gem": "Yanaka neighbourhood — old Tokyo vibes, no tourists",
      "festivals_in_window": ["Autumn leaves season (koyo) — mid Nov"],
      "similar_to": "If you love this, also check Bangkok or Seoul"
    }}
  ],
  "deals_summary": "3 destinations under $1,500 found for your dates",
  "best_month_to_travel": "October",
  "money_saving_tip": "Booking 6-8 weeks ahead saves 25-35% on flights from {req.origin}"
}}

Generate 6 destination recommendations. Rank by value (deal score). 
Make flight costs realistic from {req.origin}.
Return ONLY raw JSON."""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {e}")
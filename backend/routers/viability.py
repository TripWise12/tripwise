from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import time

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

PRIMARY_MODEL = "gemini-3.1-flash-lite"
FALLBACK_MODEL = "gemini-2.5-flash"

def get_model(name):
    return genai.GenerativeModel(name)

def generate_with_retry(prompt, max_retries=3):
    models_to_try = [PRIMARY_MODEL] * max_retries + [FALLBACK_MODEL]
    last_error = None
    for i, model_name in enumerate(models_to_try):
        try:
            model = get_model(model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            last_error = e
            print(f"[TripWise] Attempt {i+1} failed with {model_name}: {e}")
            if i < max_retries:
                time.sleep(1.5)
    raise Exception(f"All models failed. Last error: {last_error}")

def clean_json(raw):
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()

class ViabilityRequest(BaseModel):
    destination: str
    origin: str
    start_date: str
    end_date: str
    interests: list[str] = []

@router.post("/viability")
async def get_viability(req: ViabilityRequest):
    prompt = f"""You are a world-class travel intelligence system. Generate a comprehensive trip viability report.

Trip Details:
- From: {req.origin}
- To: {req.destination}
- Dates: {req.start_date} to {req.end_date}
- Interests: {', '.join(req.interests) if req.interests else 'general travel'}

Note: The traveler is from {req.origin} — tailor visa requirements, flight routes, and cultural advice accordingly. Do NOT assume Indian traveler if origin is not India.

Return ONLY raw JSON (no markdown, no code fences):

{{
  "overall_verdict": "Great time to visit",
  "overall_reason": "2 sentence reason specific to {req.destination} for travelers from {req.origin}",
  "best_time_verdict": "Good time",
  "best_time_reason": "Detailed explanation",
  "ideal_months": ["March", "October"],
  "weather_summary": "Expected conditions during travel dates",
  "temperature_min": 18,
  "temperature_max": 30,
  "temperature_unit": "C",
  "humidity": "Moderate (60-70%)",
  "rainfall": "Low",
  "weather_warnings": ["Any seasonal warnings"],
  "daily_weather_forecast": [
    {{"date": "{req.start_date}", "condition": "Sunny", "temp_min": 20, "temp_max": 28, "rain_chance": 10, "humidity": 65, "wind": "Light breeze", "icon": "sunny"}},
    {{"date": "next day", "condition": "Partly cloudy", "temp_min": 19, "temp_max": 26, "rain_chance": 20, "humidity": 70, "wind": "Moderate", "icon": "cloudy"}}
  ],
  "crowd_level": "Medium",
  "crowd_reason": "Why crowds are at this level",
  "price_vs_average": "Normal",
  "price_note": "Context on pricing",
  "cheaper_alternative_months": ["February"],
  "cheaper_savings_percent": 20,
  "festivals_and_events": [
    {{"name": "Festival or holiday name", "date": "Date or date range", "type": "festival/national_holiday/sporting/cultural", "description": "Brief description and impact on travel", "tip": "Traveler tip — book early or avoid certain areas"}}
  ],
  "visa_type": "On Arrival",
  "visa_cost_local_currency": 0,
  "visa_cost_usd": 0,
  "visa_processing_days": 0,
  "visa_docs": ["Passport (6 months validity)", "Return ticket"],
  "visa_link": "https://official-visa-link.gov",
  "visa_apply_link": "https://apply-visa-link.gov",
  "passport_validity_months": 6,
  "insurance_mandatory": false,
  "insurance_recommended": true,
  "insurance_note": "Recommended for medical coverage",
  "insurance_cost_range_usd": "30-80 for 7 days",
  "currency": "Currency name (CODE)",
  "exchange_rate_from_origin": "1 [origin currency] = X [destination currency]",
  "best_money_method": "Best way to carry and use money",
  "atm_availability": "ATM availability description",
  "sim_recommendation": "Best SIM or eSIM option with cost",
  "esim_available": true,
  "esim_providers": ["Provider 1", "Provider 2"],
  "power_socket": "Socket type and voltage",
  "adapter_needed": true,
  "tipping_culture": "Tipping norms",
  "driving_side": "Left or Right",
  "language_difficulty": "Easy/Medium/High with context",
  "safety_level": "Safe",
  "safety_notes": "Safety context",
  "areas_to_avoid": [
    {{"area": "Area name", "reason": "Why to avoid", "severity": "avoid/caution"}}
  ],
  "travel_advisory": "Current advisory status",
  "travel_advisory_link": "https://official-advisory-link.gov",
  "language_phrases": [
    {{"phrase": "Hello", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Thank you", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Excuse me", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Where is?", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "How much?", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Help!", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Call police", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "I am vegetarian", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "No meat please", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "The bill please", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Train station", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Toilet", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Hospital", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "I don't understand", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Do you speak English?", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Yes", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "No", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Good morning", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "Good night", "local": "local word", "phonetic": "phonetic"}},
    {{"phrase": "I need a doctor", "local": "local word", "phonetic": "phonetic"}}
  ],
  "page_tips": {{
    "overview": ["Tip 1 for this destination", "Tip 2", "Tip 3"],
    "itinerary": ["Itinerary tip 1", "Tip 2"],
    "packing": ["Packing tip 1", "Tip 2"],
    "budget": ["Budget tip 1", "Tip 2"]
  }},
  "festivals_during_visit": [],
  "nearby_countries_to_combine": [
    {{
      "country": "Country name",
      "city": "City",
      "extra_days": 3,
      "extra_cost_usd": 200,
      "reason": "Why it pairs well"
    }}
  ],
  "emergency_info": {{
    "police": "number",
    "ambulance": "number",
    "fire": "number",
    "tourist_helpline": "number or N/A",
    "embassy_of_origin_country_phone": "+xx-xxx-xxxx",
    "embassy_address": "Address"
  }}
}}

Fill ALL values accurately for {req.destination} for travelers from {req.origin}. Generate at least 5 daily_weather_forecast entries covering the trip dates. Return ONLY the JSON object."""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

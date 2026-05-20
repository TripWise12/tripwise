from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import time
from datetime import datetime

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

class ItineraryRequest(BaseModel):
    destination: str
    origin: str
    start_date: str
    end_date: str
    interests: list[str] = []
    pace: str = "balanced"
    stay_type: str = "hotel"
    budget_usd: int = 2000
    budget_inr: int = 0
    group_size: int = 2
    dietary: list[str] = []
    planning_to_drive: bool = False
    personal_notes: str = ""

@router.post("/generate-itinerary")
async def generate_itinerary(req: ItineraryRequest):
    try:
        start = datetime.strptime(req.start_date, "%Y-%m-%d")
        end = datetime.strptime(req.end_date, "%Y-%m-%d")
        days = max((end - start).days, 1)
    except Exception:
        days = 7

    pace_guide = {
        "hectic": "6-8 activities per day",
        "balanced": "4-5 activities per day",
        "relaxed": "3-4 activities per day"
    }.get(req.pace, "4-5 activities per day")

    budget_note = f"${req.budget_usd} USD" if req.budget_usd else f"INR {req.budget_inr}"

    prompt = f"""You are an expert world travel planner. Create a highly detailed, realistic day-by-day itinerary.

Trip Details:
- From: {req.origin} (tailor transport, visa, currency advice to this origin country)
- To: {req.destination}
- Dates: {req.start_date} to {req.end_date} ({days} days)
- Interests: {', '.join(req.interests) if req.interests else 'culture, food, sightseeing'}
- Pace: {req.pace} ({pace_guide})
- Budget: {budget_note} per person total
- Group size: {req.group_size}
- Stay type: {req.stay_type}
- Dietary: {', '.join(req.dietary) if req.dietary else 'no restrictions'}
- Will drive: {req.planning_to_drive}
- Personal notes from traveler: "{req.personal_notes}"

Return ONLY raw JSON (no markdown fences):

{{
  "destination": "{req.destination}",
  "days": [
    {{
      "day": 1,
      "date": "{req.start_date}",
      "theme": "Arrival and First Impressions",
      "day_tip": "Insider tip specific to this day",
      "slots": [
        {{
          "time": "2:00 PM",
          "duration_mins": 60,
          "type": "transport",
          "title": "Specific activity or place name",
          "location": "Exact location name, area",
          "lat": 35.6762,
          "lng": 139.6503,
          "notes": "Detailed practical notes — what to do, what to expect, how to get there",
          "cost_usd": 10,
          "cost_local": 1500,
          "local_currency": "JPY",
          "booking_required": false,
          "booking_link": null,
          "ticket_link": null,
          "book_days_ahead": null,
          "pro_tip": "Specific insider tip for this activity",
          "what_to_wear": "Comfortable shoes, modest clothing"
        }}
      ],
      "day_total_usd": 80,
      "free_time_note": "Evening free — explore the neighbourhood",
      "rainy_backup": "Specific indoor alternative with booking link if needed",
      "rainy_backup_link": null
    }}
  ],
  "accommodation": {{
    "recommended_area": "Area name",
    "reason": "Why this area",
    "options": [
      {{
        "type": "hotel",
        "name": "Specific property name",
        "area": "Neighbourhood",
        "price_per_night_usd": 80,
        "total_usd": 560,
        "rating": 8.4,
        "why": "Why this suits the trip",
        "booking_link": "https://www.booking.com/hotel/...",
        "amenities": ["Free WiFi", "Breakfast", "Near metro"]
      }}
    ]
  }},
  "local_transport": {{
    "primary_recommendation": "Metro / Grab / etc",
    "reason": "Why this is best",
    "cost_for_trip_usd": 50,
    "daily_cost_usd": 8,
    "how_to_get": "Where to buy or access",
    "official_link": "https://transport-website.com",
    "alternatives": [
      {{"mode": "Taxi", "when": "Late night", "cost_note": "3x metro price"}}
    ],
    "airport_transfer": {{
      "recommendation": "Best transfer method",
      "cost_usd": 15,
      "duration_mins": 45,
      "from": "Airport to recommended area",
      "link": "https://transfer-booking.com"
    }}
  }},
  "food_guide": {{
    "must_try": ["Dish 1", "Dish 2", "Dish 3", "Dish 4", "Dish 5"],
    "vegetarian_options": ["Option 1", "Option 2"],
    "best_food_areas": ["Market 1", "Street 2", "District 3"],
    "budget_per_meal_usd": 10,
    "splurge_meal_usd": 40,
    "food_safety_tips": ["Tip 1", "Tip 2", "Tip 3"],
    "avoid": ["Thing to avoid 1"]
  }},
  "packing_list": {{
    "clothing": [
      {{"item": "Light breathable t-shirts (5)", "essential": true, "reason": "Hot humid weather"}},
      {{"item": "Comfortable walking shoes", "essential": true, "reason": "15,000+ steps daily"}},
      {{"item": "Slip-on shoes", "essential": true, "reason": "Temples require shoe removal"}},
      {{"item": "Light rain jacket", "essential": true, "reason": "Sudden afternoon showers"}},
      {{"item": "Swimwear", "essential": false, "reason": "If visiting beaches or hotel pool"}}
    ],
    "toiletries": [
      {{"item": "Toothbrush and toothpaste", "essential": true, "reason": "Often forgotten"}},
      {{"item": "Sunscreen SPF 50+", "essential": true, "reason": "Strong UV rays"}},
      {{"item": "Insect repellent", "essential": true, "reason": "Mosquitoes at temples and parks"}},
      {{"item": "Deodorant", "essential": true, "reason": "Hot weather"}},
      {{"item": "Wet wipes", "essential": false, "reason": "Useful for street food eating"}}
    ],
    "documents": [
      {{"item": "Passport (6+ months validity)", "essential": true, "reason": "Required for entry"}},
      {{"item": "Visa printout / e-visa", "essential": true, "reason": "Required at immigration"}},
      {{"item": "Travel insurance card", "essential": true, "reason": "Medical emergencies"}},
      {{"item": "Hotel booking confirmations", "essential": true, "reason": "May be asked at immigration"}},
      {{"item": "Emergency contact list", "essential": true, "reason": "Keep separate from phone"}}
    ],
    "electronics": [
      {{"item": "Power adapter (Type X)", "essential": true, "reason": "Different socket type"}},
      {{"item": "Power bank 20,000mAh", "essential": true, "reason": "Long days of navigation"}},
      {{"item": "Camera or phone with good camera", "essential": false, "reason": "Memorable landscapes"}},
      {{"item": "Earphones", "essential": false, "reason": "Long flights and commutes"}}
    ],
    "medications": [
      {{"item": "Personal prescription medications", "essential": true, "reason": "Bring extra supply"}},
      {{"item": "Antidiarrheal tablets", "essential": true, "reason": "New cuisine adjustment"}},
      {{"item": "Antihistamines", "essential": true, "reason": "Allergies and insect bites"}},
      {{"item": "Paracetamol / Ibuprofen", "essential": true, "reason": "Headaches, fever"}},
      {{"item": "Motion sickness tablets", "essential": false, "reason": "If taking boat or winding roads"}}
    ],
    "money": [
      {{"item": "Cash in local currency", "essential": true, "reason": "Many places cash only"}},
      {{"item": "2 debit / credit cards", "essential": true, "reason": "In case one is blocked abroad"}},
      {{"item": "Card copies (photo on phone)", "essential": true, "reason": "If card is lost"}}
    ],
    "misc": [
      {{"item": "Small daypack / backpack", "essential": true, "reason": "Daily explorations"}},
      {{"item": "Reusable water bottle", "essential": true, "reason": "Stay hydrated, reduce plastic"}},
      {{"item": "Padlock for hostel lockers", "essential": false, "reason": "If staying in hostels"}},
      {{"item": "Travel pillow", "essential": false, "reason": "Long flights"}},
      {{"item": "Portable WiFi or local SIM", "essential": true, "reason": "Navigation and communication"}}
    ]
  }},
  "budget_summary": {{
    "flights_usd": 800,
    "accommodation_usd": 560,
    "food_usd": 150,
    "transport_usd": 80,
    "activities_usd": 120,
    "sim_usd": 20,
    "misc_usd": 70,
    "total_usd": 1800,
    "per_person_usd": 1800,
    "group_total_usd": {req.group_size * 1800},
    "budget_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
  }},
  "advance_bookings": [
    {{
      "item": "Attraction or experience name",
      "why_book_ahead": "Why it sells out",
      "book_by": "2 weeks before travel",
      "link": "https://official-booking-link.com",
      "cost_usd": 25,
      "required": true
    }}
  ],
  "emergency_info": {{
    "police": "number",
    "ambulance_fire": "number",
    "tourist_helpline": "number",
    "embassy_phone": "+country-code-number"
  }}
}}

CRITICAL RULES:
1. Generate exactly {days} days
2. Day 1: arrive mid-afternoon — start light
3. Last day: pack and check out — morning activities only
4. Realistic travel time between spots — no impossible back-to-back
5. Pace: {req.pace} = {pace_guide}
6. Budget calibrated to {budget_note} total per person
7. Real coordinates for every location in {req.destination}
8. ALL links must be real working URLs (official sites, booking.com, etc.)
9. Packing list tailored to {req.destination} climate and activities
10. Personal notes to incorporate: "{req.personal_notes}"
11. Return ONLY the JSON, nothing else"""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/edit-itinerary")
async def edit_itinerary(data: dict):
    original = data.get("original_itinerary", {})
    edit_request = data.get("edit_request", "")
    prompt = f"""Edit this travel itinerary based on user feedback.

Original (abbreviated): {json.dumps(original)[:3000]}

User request: "{edit_request}"

Apply changes, keep everything else identical. Return ONLY raw JSON, no markdown."""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

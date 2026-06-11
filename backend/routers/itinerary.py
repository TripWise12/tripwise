from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import time
from datetime import datetime

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

PRIMARY_MODEL = "gemini-3.5-flash"
FALLBACK_MODEL = "gemini-3.1-flash-lite"

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
          "opening_hours": "9:00 AM – 6:00 PM (closed Mondays)",
          "best_time_to_visit": "Early morning to avoid crowds",
          "common_mistakes": ["Forgetting to book tickets", "Arriving at noon when queues are longest"],
          "important_info": "Dress code required. Remove shoes at entrance.",
          "booking_required": false,
          "booking_link": null,
          "ticket_link": null,
          "book_days_ahead": null,
          "pro_tip": "Specific insider tip for this activity",
          "what_to_wear": "Comfortable shoes, modest clothing",
          "image_search_term": "place name city landmark"
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
    "documents": [
      {{"item": "Passport (check 6+ months validity)", "essential": true, "reason": "Required at immigration — check expiry before travel"}},
      {{"item": "Visa / e-Visa printout", "essential": true, "reason": "Show at check-in and immigration if required for destination"}},
      {{"item": "Aadhaar Card / National ID", "essential": true, "reason": "Required for domestic flights and some hotels"}},
      {{"item": "Travel insurance policy printout", "essential": true, "reason": "Medical emergencies abroad — carry insurer's 24hr number"}},
      {{"item": "Flight e-tickets (printed + phone)", "essential": true, "reason": "Some airports require printed boarding pass"}},
      {{"item": "Hotel / accommodation confirmations", "essential": true, "reason": "May be asked at immigration as proof of stay"}},
      {{"item": "Emergency contacts list (paper)", "essential": true, "reason": "If phone dies or is stolen"}},
      {{"item": "International driving permit", "essential": false, "reason": "Only if renting a vehicle at destination"}},
      {{"item": "Priority Pass / Lounge card", "essential": false, "reason": "If you have airport lounge access — check eligibility"}},
      {{"item": "Credit card travel insurance proof", "essential": false, "reason": "Some cards cover travel — carry the letter"}}
    ],
    "clothing": [
      {{"item": "Breathable t-shirts / shirts (quantity based on trip length)", "essential": true, "reason": "Pack based on laundry access — 1 per day or 4-5 + laundry midtrip"}},
      {{"item": "Comfortable walking shoes (broken in)", "essential": true, "reason": "Expect 12,000-18,000 steps daily sightseeing — new shoes = blisters"}},
      {{"item": "Smart-casual outfit (1-2)", "essential": false, "reason": "Upscale restaurants, rooftop bars, or cultural sites with dress codes"}},
      {{"item": "Underwear + socks (1 per day + spare)", "essential": true, "reason": "Pack slightly more than days — laundry may not always be available"}},
      {{"item": "Light jacket or layer", "essential": true, "reason": "AC in malls, restaurants, flights is often very cold regardless of outdoor heat"}},
      {{"item": "Swimwear", "essential": false, "reason": "For hotel pools, beaches, or water activities at destination"}},
      {{"item": "Slip-on sandals / flip flops", "essential": false, "reason": "Temple visits, beach, hostel showers, casual evenings"}},
      {{"item": "Light scarf / sarong", "essential": false, "reason": "Modesty at religious sites + doubles as blanket on cold flights"}}
    ],
    "toiletries": [
      {{"item": "Toothbrush + toothpaste (travel size)", "essential": true, "reason": "Basic hygiene — travel size for carry-on"}},
      {{"item": "Shampoo + conditioner (travel size)", "essential": true, "reason": "Hotel supplies are often poor quality"}},
      {{"item": "Deodorant", "essential": true, "reason": "Essential especially in warm climates"}},
      {{"item": "Sunscreen SPF 50+", "essential": true, "reason": "Strong UV at destination — apply daily"}},
      {{"item": "Moisturiser / lip balm", "essential": false, "reason": "Air conditioning and sun can dry out skin"}},
      {{"item": "Razor + shaving foam", "essential": false, "reason": "Pack in checked luggage if >100ml"}},
      {{"item": "Wet wipes / hand sanitiser", "essential": true, "reason": "Street food, public transport, no soap available"}},
      {{"item": "Insect repellent (DEET 30%+)", "essential": true, "reason": "Mosquitoes active at destination — prevents bites"}},
      {{"item": "Feminine hygiene products", "essential": false, "reason": "Pack enough — availability varies by country"}},
      {{"item": "Mini first aid kit (plasters, antiseptic)", "essential": true, "reason": "Blisters from walking, minor cuts"}}
    ],
    "electronics": [
      {{"item": "Phone charger + cable", "essential": true, "reason": "Primary navigation and communication device"}},
      {{"item": "Power bank 20,000 mAh", "essential": true, "reason": "Long days out without outlets — charge phone 3-4 times"}},
      {{"item": "Universal power adapter", "essential": true, "reason": "Check socket type for destination country"}},
      {{"item": "Earphones / AirPods", "essential": false, "reason": "Long flights, noisy hostels, audio guides"}},
      {{"item": "Camera + memory cards", "essential": false, "reason": "Better shots than phone in low light and landscapes"}},
      {{"item": "Laptop / tablet + charger", "essential": false, "reason": "Only if working remotely or need large screen"}},
      {{"item": "E-reader / Kindle", "essential": false, "reason": "Long transit times — lighter than physical books"}},
      {{"item": "Portable WiFi device (or local SIM)", "essential": true, "reason": "Offline maps fail — stay connected for navigation and emergencies"}}
    ],
    "medications": [
      {{"item": "All personal prescription medications (2-week extra supply)", "essential": true, "reason": "Cannot always source abroad — carry in original packaging"}},
      {{"item": "Paracetamol + Ibuprofen", "essential": true, "reason": "Headaches, fever, inflammation from walking"}},
      {{"item": "Oral Rehydration Salts (ORS sachets)", "essential": true, "reason": "Food poisoning recovery — electrolyte replacement"}},
      {{"item": "Antidiarrheal tablets (Loperamide)", "essential": true, "reason": "Street food and new cuisines can upset digestion"}},
      {{"item": "Antihistamines", "essential": true, "reason": "Allergies, insect bites, dust — non-drowsy for day use"}},
      {{"item": "Motion sickness tablets", "essential": false, "reason": "If taking boats, winding mountain roads, or prone to nausea"}},
      {{"item": "Antacids / indigestion tablets", "essential": false, "reason": "Rich or spicy local food"}},
      {{"item": "Eye drops (lubricating)", "essential": false, "reason": "Dry eyes from AC and long flights"}}
    ],
    "money": [
      {{"item": "Cash in local currency (destination)", "essential": true, "reason": "Markets, street food, small vendors — many are cash-only"}},
      {{"item": "2 × debit/credit cards (different networks)", "essential": true, "reason": "One Visa + one Mastercard in case one is blocked or declined"}},
      {{"item": "Notify bank of travel dates", "essential": true, "reason": "Banks freeze cards for unusual foreign transactions — do this before you leave"}},
      {{"item": "Small emergency cash in USD/EUR", "essential": true, "reason": "Universally accepted if local ATMs fail"}},
      {{"item": "Forex card or travel card (Wise/Niyo)", "essential": false, "reason": "Better exchange rates and lower ATM fees than regular debit cards"}},
      {{"item": "Digital copies of all cards (secure cloud)", "essential": true, "reason": "If wallet is stolen you can cancel immediately"}}
    ],
    "misc": [
      {{"item": "20-30L daypack / backpack", "essential": true, "reason": "Daily sightseeing — fits water, jacket, snacks, camera"}},
      {{"item": "Reusable water bottle (insulated)", "essential": true, "reason": "Stay hydrated, save money, reduce plastic waste"}},
      {{"item": "Padlock (TSA-approved)", "essential": true, "reason": "Checked luggage security + hostel lockers"}},
      {{"item": "Travel pillow + eye mask + earplugs", "essential": false, "reason": "Overnight flights or noisy accommodations"}},
      {{"item": "Lightweight rain poncho", "essential": false, "reason": "Folds to fist-size — saves you from getting soaked"}},
      {{"item": "Packing cubes (set of 3)", "essential": false, "reason": "Keeps luggage organised — clothes, toiletries, electronics separated"}},
      {{"item": "Luggage tags (with contact info)", "essential": true, "reason": "Helps airline return lost bag faster"}},
      {{"item": "Ziplock bags (5-6 assorted sizes)", "essential": false, "reason": "Wet clothes, liquids in carry-on, snacks, document protection"}},
      {{"item": "Travel towel (quick-dry)", "essential": false, "reason": "Budget hotels may not provide — dries in 1 hour"}},
      {{"item": "Portable door alarm / cable lock", "essential": false, "reason": "Extra security at budget guesthouses"}}
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
11. Return ONLY the JSON, nothing else
12. ALWAYS include all 7 packing_list categories: documents, clothing, toiletries, electronics, medications, money, misc — NEVER omit any category
13. toiletries MUST include: toothbrush, toothpaste, shampoo, conditioner, body wash/soap, deodorant, face wash, sunscreen, moisturiser, razor, wet wipes, hand sanitiser, insect repellent, nail clippers, mini first aid kit
14. electronics MUST include: phone charger, charging cable, power bank 20000mAh, universal travel adapter, earphones, portable WiFi or local SIM
15. clothing MUST include: t-shirts quantity for trip length, underwear 1 per day plus spare, socks, comfortable walking shoes, light jacket, plus all destination-appropriate extras
16. Every non-transport slot MUST have a unique image_search_term using specific place name and city — e.g. Burj Khalifa Dubai, Shibuya Crossing Tokyo"""

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
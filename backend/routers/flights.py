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


def get_model(name: str):
    return genai.GenerativeModel(name)


def generate_with_retry(prompt: str, max_retries: int = 3) -> str:
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


def clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


class FlightRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str | None = None
    adults: int = 1
    travel_class: str = "economy"


@router.post("/flights")
async def search_flights(req: FlightRequest):
    prompt = f"""Generate realistic flight search results for an Indian traveler.

Route: {req.origin} to {req.destination}
Departure: {req.departure_date}, Return: {req.return_date or 'one-way'}
Passengers: {req.adults}, Class: {req.travel_class}

Return ONLY raw JSON (no markdown fences):
{{
  "search_info": {{
    "origin": "{req.origin}",
    "destination": "{req.destination}",
    "departure_date": "{req.departure_date}",
    "return_date": "{req.return_date}",
    "adults": {req.adults},
    "currency": "INR"
  }},
  "results": [
    {{
      "id": "FL001",
      "airline": "Air India",
      "airline_code": "AI",
      "flight_number": "AI 302",
      "departure_time": "06:30",
      "arrival_time": "14:45",
      "duration": "8h 15m",
      "stops": 0,
      "stop_cities": [],
      "price_inr": 42500,
      "price_per_person_inr": 42500,
      "baggage_kg": 23,
      "on_time_percent": 78,
      "booking_class": "Economy",
      "badge": "Cheapest",
      "pros": ["Direct flight", "Good baggage allowance"],
      "cons": ["Early departure"]
    }},
    {{
      "id": "FL002",
      "airline": "IndiGo",
      "airline_code": "6E",
      "flight_number": "6E 1234",
      "departure_time": "13:20",
      "arrival_time": "23:55",
      "duration": "10h 35m",
      "stops": 1,
      "stop_cities": ["Singapore"],
      "layover_duration": "2h 10m",
      "price_inr": 38200,
      "price_per_person_inr": 38200,
      "baggage_kg": 20,
      "on_time_percent": 82,
      "booking_class": "Economy",
      "badge": "Best Value",
      "pros": ["Lowest price"],
      "cons": ["1 stop"]
    }},
    {{
      "id": "FL003",
      "airline": "Emirates",
      "airline_code": "EK",
      "flight_number": "EK 500",
      "departure_time": "22:15",
      "arrival_time": "16:30",
      "duration": "12h 15m",
      "stops": 1,
      "stop_cities": ["Dubai"],
      "layover_duration": "2h 45m",
      "price_inr": 51000,
      "price_per_person_inr": 51000,
      "baggage_kg": 30,
      "on_time_percent": 88,
      "booking_class": "Economy",
      "badge": "Most Reliable",
      "pros": ["Highest reliability", "Extra baggage"],
      "cons": ["More expensive"]
    }}
  ],
  "flexible_dates": {{
    "note": "Flying 2-3 days earlier saves significant money on this route",
    "best_date": "2 days before chosen date",
    "savings_inr": 5500
  }},
  "nearby_airports": [],
  "booking_tip": "Book 6-8 weeks in advance for best prices. Tuesday/Wednesday departures are cheaper."
}}

Use correct airlines for the {req.origin} to {req.destination} route. Return ONLY raw JSON."""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/hotels")
async def search_hotels(data: dict):
    destination = data.get("destination", "")
    check_in = data.get("check_in", "")
    check_out = data.get("check_out", "")
    adults = data.get("adults", 2)
    stay_type = data.get("stay_type", "hotel")
    budget_per_night = data.get("budget_per_night_inr", 5000)
    area = data.get("area", "")

    prompt = f"""Generate realistic hotel search results for {destination}.

Check-in: {check_in}, Check-out: {check_out}, Guests: {adults}
Type preference: {stay_type}, Budget: Rs {budget_per_night}/night, Area: {area or 'best area'}

Return ONLY raw JSON (no markdown fences):
{{
  "results": [
    {{
      "id": "H001",
      "name": "Specific real hotel name",
      "type": "{stay_type}",
      "area": "Neighbourhood name",
      "stars": 4,
      "rating": 8.6,
      "rating_label": "Excellent",
      "price_per_night_inr": 5500,
      "total_inr": 38500,
      "amenities": ["Free WiFi", "Breakfast included", "Metro: 3 min walk"],
      "distance_to_center": "1.2 km to city center",
      "why_recommended": "Perfect location, suits your travel style",
      "badge": "Best Location",
      "free_cancellation": true,
      "breakfast_included": false,
      "booking_link": "https://www.booking.com"
    }}
  ],
  "areas_guide": [
    {{
      "area": "Main tourist area",
      "vibe": "What the area feels like",
      "best_for": ["Type of traveler"],
      "avg_price_inr": 5500
    }}
  ]
}}

Generate 4-5 realistic options for {destination} matching {stay_type} and Rs {budget_per_night} budget. Return ONLY raw JSON."""

    try:
        raw = generate_with_retry(prompt)
        return json.loads(clean_json(raw))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

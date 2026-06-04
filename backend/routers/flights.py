from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os, json, time
from typing import Optional

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
PRIMARY_MODEL = "gemini-3.5-flash"
FALLBACK_MODEL = "gemini-3.1-flash-lite"

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

class FlightRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1
    travel_class: str = "economy"

class TransportRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1

class HotelRequest(BaseModel):
    destination: str
    check_in: str
    check_out: str
    adults: int = 2
    stay_type: str = "any"
    budget_per_night_usd: int = 100
    area: Optional[str] = ""

@router.post("/flights")
async def search_flights(req: FlightRequest):
    prompt = f"""Generate realistic flight search results for travelers.

Route: {req.origin} → {req.destination}
Departure: {req.departure_date}, Return: {req.return_date or 'one-way'}
Passengers: {req.adults}, Class: {req.travel_class}

Return ONLY raw JSON:
{{
  "search_info": {{
    "origin": "{req.origin}",
    "destination": "{req.destination}",
    "departure_date": "{req.departure_date}",
    "return_date": "{req.return_date}",
    "adults": {req.adults}
  }},
  "results": [
    {{
      "id": "FL001",
      "airline": "Airline name",
      "airline_code": "AI",
      "flight_number": "AI 302",
      "departure_time": "06:30",
      "arrival_time": "14:45",
      "duration": "8h 15m",
      "stops": 0,
      "stop_cities": [],
      "price_usd": 420,
      "price_per_person_usd": 420,
      "baggage_kg": 23,
      "on_time_percent": 78,
      "badge": "Cheapest",
      "pros": ["Direct flight"],
      "cons": ["Early departure"],
      "book_url": "https://www.skyscanner.com",
      "skyscanner_url": "https://www.skyscanner.com"
    }},
    {{
      "id": "FL002",
      "airline": "Second airline",
      "airline_code": "6E",
      "flight_number": "6E 1234",
      "departure_time": "13:20",
      "arrival_time": "23:55",
      "duration": "10h 35m",
      "stops": 1,
      "stop_cities": ["Hub city"],
      "layover_duration": "2h 10m",
      "price_usd": 310,
      "price_per_person_usd": 310,
      "baggage_kg": 20,
      "on_time_percent": 82,
      "badge": "Best Value",
      "pros": ["Lowest price"],
      "cons": ["1 stop"],
      "book_url": "https://www.skyscanner.com",
      "skyscanner_url": "https://www.skyscanner.com"
    }},
    {{
      "id": "FL003",
      "airline": "Premium airline",
      "airline_code": "EK",
      "flight_number": "EK 500",
      "departure_time": "22:15",
      "arrival_time": "16:30",
      "duration": "12h 15m",
      "stops": 1,
      "stop_cities": ["Dubai"],
      "layover_duration": "2h 45m",
      "price_usd": 580,
      "price_per_person_usd": 580,
      "baggage_kg": 30,
      "on_time_percent": 91,
      "badge": "Most Reliable",
      "pros": ["Highest reliability", "30kg baggage"],
      "cons": ["Most expensive"],
      "book_url": "https://www.skyscanner.com",
      "skyscanner_url": "https://www.skyscanner.com"
    }}
  ],
  "flexible_dates": {{
    "note": "Flying 2-3 days earlier saves significant money",
    "savings_usd": 85
  }},
  "booking_platforms": [
    {{"name": "Skyscanner", "url": "https://www.skyscanner.com", "why": "Best for comparing all airlines"}},
    {{"name": "Google Flights", "url": "https://flights.google.com", "why": "Best price calendar view"}},
    {{"name": "Kayak", "url": "https://www.kayak.com", "why": "Best for flexible date search"}}
  ],
  "booking_tip": "Book 6-8 weeks ahead. Set price alerts on Google Flights."
}}

Use real airlines that fly {req.origin} to {req.destination}. Return ONLY raw JSON."""

    try:
        result = json.loads(clean_json(generate_with_retry(prompt)))
        # Inject real Skyscanner URL
        orig = req.origin.split(',')[0].strip()[:3].lower()
        dest = req.destination.split(',')[0].strip()[:3].lower()
        date = req.departure_date.replace('-', '')
        sky_url = f"https://www.skyscanner.com/transport/flights/{orig}/{dest}/{date}/"
        for r in result.get("results", []):
            r["skyscanner_url"] = sky_url
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport")
async def search_all_transport(req: TransportRequest):
    """Full transport comparison — flights, trains, buses, road trip."""
    prompt = f"""You are a travel transport expert. Find ALL transport options between {req.origin} and {req.destination}.

Date: {req.departure_date}, Passengers: {req.adults}

Return ONLY raw JSON:
{{
  "route": "{req.origin} → {req.destination}",
  "distance_km": 5800,
  "recommended_mode": "flight",
  "recommended_reason": "Too far for train, flights are most practical",
  "options": [
    {{
      "mode": "flight",
      "mode_icon": "✈️",
      "title": "Fly direct or via hub",
      "duration": "8h 30m direct",
      "price_from_usd": 280,
      "price_to_usd": 620,
      "comfort": 4,
      "eco_score": 2,
      "available": true,
      "badge": "Recommended",
      "pros": ["Fastest", "Multiple daily options"],
      "cons": ["High carbon footprint", "Airport hassle"],
      "book_platforms": [
        {{"name": "Skyscanner", "url": "https://www.skyscanner.com", "note": "Best price comparison"}},
        {{"name": "Google Flights", "url": "https://flights.google.com", "note": "Price calendar & alerts"}}
      ],
      "tips": ["Book 6-8 weeks ahead", "Fly midweek for cheaper fares"]
    }},
    {{
      "mode": "train",
      "mode_icon": "🚆",
      "title": "High-speed rail",
      "duration": "N/A — too far",
      "price_from_usd": null,
      "available": false,
      "reason_unavailable": "No direct train route — countries not connected by rail",
      "pros": [],
      "cons": [],
      "book_platforms": []
    }},
    {{
      "mode": "bus",
      "mode_icon": "🚌",
      "title": "Long distance bus",
      "duration": "N/A",
      "price_from_usd": null,
      "available": false,
      "reason_unavailable": "Not feasible for this international route",
      "pros": [],
      "cons": [],
      "book_platforms": []
    }},
    {{
      "mode": "road_trip",
      "mode_icon": "🚗",
      "title": "Drive / road trip",
      "duration": "N/A",
      "price_from_usd": null,
      "available": false,
      "reason_unavailable": "International route, not driveable",
      "pros": [],
      "cons": [],
      "book_platforms": []
    }}
  ],
  "carbon_comparison": [
    {{"mode": "flight", "kg_co2": 890}},
    {{"mode": "train", "kg_co2": 12}},
    {{"mode": "bus", "kg_co2": 45}}
  ],
  "local_transport_at_destination": {{
    "city": "{req.destination}",
    "primary_mode": "Metro / MRT",
    "why": "Most cities have excellent metro systems",
    "cost_per_day_usd": 5,
    "pass_recommendation": "3-day tourist pass",
    "pass_cost_usd": 12,
    "key_routes": [
      {{
        "from": "Airport",
        "to": "City Center",
        "line": "Airport Express / Line 1",
        "duration_mins": 30,
        "cost_usd": 3,
        "tip": "Buy ticket at airport metro station"
      }}
    ],
    "apps": [
      {{"name": "Citymapper", "platform": "iOS/Android", "url": "https://citymapper.com", "why": "Best for real-time transit"}},
      {{"name": "Google Maps", "platform": "iOS/Android", "url": "https://maps.google.com", "why": "Works everywhere"}}
    ],
    "avoid": "Avoid taxis at the airport — use metro or pre-booked transfers",
    "taxi_app": "Grab / Uber / local app depending on city"
  }}
}}

Be specific about {req.destination}'s actual local transport system (MRT lines, metro names, bus networks).
Return ONLY raw JSON."""

    try:
        return json.loads(clean_json(generate_with_retry(prompt)))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hotels")
async def search_hotels(req: HotelRequest):
    nights = 1
    try:
        from datetime import datetime
        d1 = datetime.strptime(req.check_in, "%Y-%m-%d")
        d2 = datetime.strptime(req.check_out, "%Y-%m-%d")
        nights = max(1, (d2 - d1).days)
    except Exception:
        pass

    prompt = f"""Generate comprehensive hotel search results for {req.destination}.

Check-in: {req.check_in}, Check-out: {req.check_out} ({nights} nights)
Guests: {req.adults}, Type: {req.stay_type}, Max budget: ${req.budget_per_night_usd}/night

Return ONLY raw JSON with this exact structure:
{{
  "destination": "{req.destination}",
  "search_summary": "X options found across Y areas",
  "recommended_area": "Best area name and why in one sentence",
  "area_guide": [
    {{
      "area": "Area name",
      "vibe": "Trendy, walkable, nightlife",
      "best_for": ["Couples", "First-timers"],
      "avg_price_usd": 80,
      "pros": ["Central", "Great food scene"],
      "cons": ["Can be noisy"],
      "distance_to_center": "0.5 km"
    }}
  ],
  "results": [
    {{
      "id": "H001",
      "name": "REAL specific hotel name that exists in {req.destination}",
      "type": "hotel",
      "category": "budget",
      "chain_or_local": "local",
      "area": "Neighbourhood name",
      "lat": 0.0000,
      "lng": 0.0000,
      "stars": 3,
      "rating": 8.4,
      "rating_label": "Very Good",
      "reviews_count": 1240,
      "price_per_night_usd": 65,
      "total_usd": 455,
      "badge": "Best Value",
      "amenities": ["Free WiFi", "Breakfast $8", "Metro 3 min walk"],
      "distance_to_center": "1.2 km",
      "distance_from_airport": "22 km / 35 min by train",
      "nearest_transit": "Station name — X min walk",
      "nearest_metro": "Metro/Subway station — 3 min walk",
      "why_recommended": "One sentence on why this is a great pick",
      "free_cancellation": true,
      "breakfast_included": false,
      "platform_prices": [
        {{
          "platform": "Booking.com",
          "price_per_night_usd": 65,
          "total_usd": {65 * nights},
          "note": "Free cancellation",
          "url": "https://www.booking.com/searchresults.html?ss={req.destination}&checkin={req.check_in}&checkout={req.check_out}&group_adults={req.adults}"
        }},
        {{
          "platform": "Agoda",
          "price_per_night_usd": 61,
          "total_usd": {61 * nights},
          "note": "Members deal",
          "url": "https://www.agoda.com/search?city={req.destination}&checkIn={req.check_in}&checkOut={req.check_out}&adults={req.adults}"
        }},
        {{
          "platform": "Hotels.com",
          "price_per_night_usd": 68,
          "total_usd": {68 * nights},
          "note": "Earns reward nights",
          "url": "https://www.hotels.com/search.do?q-destination={req.destination}&q-check-in={req.check_in}&q-check-out={req.check_out}"
        }},
        {{
          "platform": "Expedia",
          "price_per_night_usd": 70,
          "total_usd": {70 * nights},
          "note": "Bundle with flight",
          "url": "https://www.expedia.com/Hotel-Search?destination={req.destination}&startDate={req.check_in}&endDate={req.check_out}&adults={req.adults}"
        }},
        {{
          "platform": "Direct / official site",
          "price_per_night_usd": 63,
          "total_usd": {63 * nights},
          "note": "Often cheapest + free upgrades",
          "url": "https://www.google.com/search?q=official+website+HOTEL_NAME+{req.destination}"
        }}
      ]
    }}
  ],
  "booking_tips": [
    "Book 4-6 weeks ahead for best prices in {req.destination}",
    "Free cancellation gives flexibility if plans change — always prefer it",
    "Check hotel official website LAST — they often beat OTA prices by 5-15%"
  ],
  "transit_hubs": [
    {{
      "name": "Main transit hub name",
      "lat": 0.0,
      "lng": 0.0,
      "lines": "Metro lines or bus routes",
      "distance_from_center": "0 km — city center"
    }}
  ]
}}

Generate 5-6 REAL hotels in {req.destination} — mix of budget/mid/luxury and local/chain.
For platform_prices: vary the prices realistically (±10-15% between platforms) — simulate actual cross-platform comparison.
Mark the cheapest platform clearly in the note field (add "✓ Cheapest" to that entry).
Use REAL lat/lng coordinates for {req.destination}. 
Return ONLY raw JSON."""

    try:
        return json.loads(clean_json(generate_with_retry(prompt)))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
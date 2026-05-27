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
    prompt = f"""Generate comprehensive hotel search results for {req.destination}.

Check-in: {req.check_in}, Check-out: {req.check_out}
Guests: {req.adults}, Type: {req.stay_type}, Budget: ${req.budget_per_night_usd}/night

Return ONLY raw JSON:
{{
  "destination": "{req.destination}",
  "search_summary": "X options found across Y areas",
  "recommended_area": "Best area to stay",
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
      "name": "Specific real hotel name",
      "type": "hotel",
      "category": "budget",
      "chain_or_local": "local",
      "area": "Neighbourhood name",
      "lat": 35.7148,
      "lng": 139.7967,
      "stars": 3,
      "rating": 8.4,
      "rating_label": "Very Good",
      "reviews_count": 1240,
      "price_per_night_usd": 65,
      "total_usd": 455,
      "badge": "Best Value",
      "amenities": ["Free WiFi", "Breakfast $8", "Metro 3 min walk"],
      "distance_to_center": "1.2 km",
      "distance_to_main_attraction": "800m to Senso-ji Temple",
      "nearby_metro": "Asakusa Station — 3 min walk",
      "why_recommended": "Perfect base for exploring east Tokyo",
      "free_cancellation": true,
      "breakfast_included": false,
      "google_maps_search": "hotel name city",
      "booking_link": "https://www.booking.com",
      "compare_links": [
        {{"platform": "Booking.com", "url": "https://www.booking.com", "note": "Best cancellation policy"}},
        {{"platform": "Hotels.com", "url": "https://www.hotels.com", "note": "Earn free nights"}},
        {{"platform": "Agoda", "url": "https://www.agoda.com", "note": "Best prices in Asia"}}
      ]
    }},
    {{
      "id": "H002",
      "name": "Chain hotel name (e.g. Marriott, Hilton, IHG)",
      "type": "hotel",
      "category": "mid-range",
      "chain_or_local": "chain",
      "area": "Central area",
      "stars": 4,
      "rating": 8.8,
      "rating_label": "Excellent",
      "reviews_count": 3200,
      "price_per_night_usd": 120,
      "total_usd": 840,
      "badge": "Top Rated",
      "amenities": ["Free WiFi", "Pool", "Gym", "Restaurant", "Concierge"],
      "distance_to_center": "0.3 km",
      "distance_to_main_attraction": "500m to main landmark",
      "nearby_metro": "Central Station — 1 min walk",
      "why_recommended": "Brand reliability, great loyalty points",
      "free_cancellation": true,
      "breakfast_included": true,
      "google_maps_search": "hotel name area city",
      "booking_link": "https://www.booking.com",
      "compare_links": [
        {{"platform": "Booking.com", "url": "https://www.booking.com", "note": ""}},
        {{"platform": "Official site", "url": "https://marriott.com", "note": "Best rate guarantee + points"}}
      ]
    }},
    {{
      "id": "H003",
      "name": "Local guesthouse or boutique name",
      "type": "guesthouse",
      "category": "budget",
      "chain_or_local": "local",
      "area": "Authentic neighbourhood",
      "stars": 2,
      "rating": 9.1,
      "rating_label": "Superb",
      "reviews_count": 420,
      "price_per_night_usd": 35,
      "total_usd": 245,
      "badge": "Hidden Gem",
      "amenities": ["Free WiFi", "Common kitchen", "Local tips from owner"],
      "distance_to_center": "2.5 km",
      "distance_to_main_attraction": "1.2 km to local market",
      "why_recommended": "Authentic local experience, owner gives great tips",
      "free_cancellation": false,
      "breakfast_included": true,
      "google_maps_search": "guesthouse name city",
      "booking_link": "https://www.airbnb.com",
      "compare_links": [
        {{"platform": "Airbnb", "url": "https://www.airbnb.com", "note": "Best for unique stays"}},
        {{"platform": "Booking.com", "url": "https://www.booking.com", "note": ""}}
      ]
    }}
  ],
  "booking_tips": [
    "Book 4-6 weeks ahead for best prices",
    "Free cancellation gives flexibility if plans change",
    "Local guesthouses often have better value than chain hotels"
  ],
  "comparison_platforms": [
    {{"name": "Booking.com", "url": "https://www.booking.com", "best_for": "Widest selection, free cancellation"}},
    {{"name": "Hotels.com", "url": "https://www.hotels.com", "best_for": "Loyalty rewards — 10 nights = 1 free"}},
    {{"name": "Agoda", "url": "https://www.agoda.com", "best_for": "Asia-Pacific destinations"}},
    {{"name": "Airbnb", "url": "https://www.airbnb.com", "best_for": "Apartments, homes, unique stays"}},
    {{"name": "Hostelworld", "url": "https://www.hostelworld.com", "best_for": "Hostels and budget stays"}}
  ]
}}

Generate 5 real hotel options in {req.destination} — mix of budget/mid/luxury and local/chain.
Include REAL lat/lng coordinates for each hotel in {req.destination}.
Return ONLY raw JSON."""

    try:
        return json.loads(clean_json(generate_with_retry(prompt)))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
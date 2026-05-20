from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import secrets
import json

router = APIRouter()

# Only initialize Supabase if both URL and KEY are properly set
_supabase_url = os.getenv("SUPABASE_URL", "").strip()
_supabase_key = os.getenv("SUPABASE_KEY", "").strip()

supabase = None
if _supabase_url and _supabase_key and _supabase_url.startswith("https://"):
    try:
        from supabase import create_client
        supabase = create_client(_supabase_url, _supabase_key)
        print("[TripWise] Supabase connected")
    except Exception as e:
        print(f"[TripWise] Supabase init failed (trips will not be saved): {e}")
else:
    print("[TripWise] Supabase not configured — running without database")


class TripCreate(BaseModel):
    title: str = "My Trip"
    destination: str
    origin: str
    start_date: str
    end_date: str
    interests: list[str] = []
    pace: str = "balanced"
    budget_inr: int = 100000
    group_size: int = 2
    stay_type: str = "hotel"
    dietary: list[str] = []
    viability_report: dict | None = None
    itinerary: dict | None = None
    user_id: str | None = None


@router.post("/trips")
async def create_trip(trip: TripCreate):
    invite_code = secrets.token_urlsafe(6)

    if not supabase:
        return {
            "id": secrets.token_urlsafe(8),
            "invite_code": invite_code,
            **trip.dict(),
            "created_at": "2025-01-01T00:00:00Z"
        }

    data = {
        **trip.dict(),
        "invite_code": invite_code,
        "viability_report": json.dumps(trip.viability_report) if trip.viability_report else None,
        "itinerary": json.dumps(trip.itinerary) if trip.itinerary else None,
    }

    try:
        result = supabase.table("trips").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}")
async def get_trip(trip_id: str):
    if not supabase:
        raise HTTPException(status_code=404, detail="Database not configured")
    try:
        result = supabase.table("trips").select("*").eq("id", trip_id).single().execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=404, detail="Trip not found")


@router.put("/trips/{trip_id}")
async def update_trip(trip_id: str, updates: dict):
    if not supabase:
        return {"id": trip_id, **updates}
    try:
        result = supabase.table("trips").update(updates).eq("id", trip_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/join/{invite_code}")
async def get_trip_by_invite(invite_code: str):
    if not supabase:
        raise HTTPException(status_code=404, detail="Database not configured")
    try:
        result = supabase.table("trips").select("*").eq("invite_code", invite_code).single().execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=404, detail="Invite code not found")


@router.post("/trips/{trip_id}/join")
async def join_trip(trip_id: str, data: dict):
    if not supabase:
        return {"success": True, "trip_id": trip_id}
    user_id = data.get("user_id")
    try:
        result = supabase.table("trip_members").insert({
            "trip_id": trip_id,
            "user_id": user_id,
            "role": "member"
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}/members")
async def get_members(trip_id: str):
    if not supabase:
        return []
    try:
        result = supabase.table("trip_members").select("*").eq("trip_id", trip_id).execute()
        return result.data
    except Exception:
        return []

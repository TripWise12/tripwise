from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import os
import secrets
from typing import Optional

router = APIRouter()

_supabase_url = os.getenv("SUPABASE_URL", "").strip()
_supabase_key = os.getenv("SUPABASE_KEY", "").strip()

supabase = None
if _supabase_url and _supabase_key and _supabase_url.startswith("https://"):
    try:
        from supabase import create_client
        supabase = create_client(_supabase_url, _supabase_key)
        print("[TripWise] Supabase connected ✓")
    except Exception as e:
        print(f"[TripWise] Supabase init failed: {e}")
else:
    print("[TripWise] Supabase not configured")


class TripCreate(BaseModel):
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    title: str = "My Trip"
    destination: str
    origin: str
    start_date: str
    end_date: str
    interests: list[str] = []
    pace: str = "balanced"
    stay_type: str = "hotel"
    budget_usd: int = 0
    group_size: int = 1
    dietary: list[str] = []
    personal_notes: str = ""
    planning_to_drive: bool = False
    viability_report: Optional[dict] = None
    itinerary: Optional[dict] = None
    status: str = "planned"


# ── CREATE ────────────────────────────────────────────────────────────────────
@router.post("/trips")
async def create_trip(trip: TripCreate):
    invite_code = secrets.token_urlsafe(6)
    if not supabase:
        return {
            "id": secrets.token_urlsafe(12),
            "invite_code": invite_code,
            **trip.model_dump(),
            "created_at": "2026-01-01T00:00:00Z",
        }
    data = {
        "user_id":           trip.user_id,
        "user_email":        trip.user_email,
        "user_name":         trip.user_name,
        "title":             trip.title,
        "destination":       trip.destination,
        "origin":            trip.origin,
        "start_date":        trip.start_date,
        "end_date":          trip.end_date,
        "interests":         trip.interests,
        "pace":              trip.pace,
        "stay_type":         trip.stay_type,
        "budget_usd":        trip.budget_usd,
        "group_size":        trip.group_size,
        "dietary":           trip.dietary,
        "personal_notes":    trip.personal_notes,
        "planning_to_drive": trip.planning_to_drive,
        "invite_code":       invite_code,
        "viability_report":  trip.viability_report,
        "itinerary":         trip.itinerary,
        "status":            trip.status,
    }
    try:
        result = supabase.table("trips").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── HISTORY — MUST come before /{trip_id} to avoid route conflict ─────────────
@router.get("/trips/history/{user_id}")
async def get_user_history(user_id: str):
    if not supabase:
        return []
    try:
        result = (
            supabase.table("trips")
            .select("id, title, destination, origin, start_date, end_date, status, created_at, group_size, budget_usd, invite_code")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── JOIN by invite code — MUST come before /{trip_id} ────────────────────────
@router.get("/trips/join/{invite_code}")
async def get_trip_by_invite(invite_code: str):
    if not supabase:
        raise HTTPException(status_code=404, detail="Database not configured")
    try:
        result = (
            supabase.table("trips")
            .select("*")
            .eq("invite_code", invite_code)
            .single()
            .execute()
        )
        return result.data
    except Exception:
        raise HTTPException(status_code=404, detail="Invite code not found")


# ── GET single trip by ID ─────────────────────────────────────────────────────
@router.get("/trips/{trip_id}")
async def get_trip(trip_id: str):
    if not supabase:
        raise HTTPException(status_code=404, detail="Database not configured")
    try:
        result = supabase.table("trips").select("*").eq("id", trip_id).single().execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=404, detail="Trip not found")


# ── UPDATE ────────────────────────────────────────────────────────────────────
@router.put("/trips/{trip_id}")
async def update_trip(trip_id: str, updates: dict):
    if not supabase:
        return {"id": trip_id, **updates}
    try:
        result = supabase.table("trips").update(updates).eq("id", trip_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, user_id: str = Query(...)):
    if not supabase:
        return {"success": True}
    try:
        supabase.table("trips").delete().eq("id", trip_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ADD MEMBER (join group trip) ──────────────────────────────────────────────
@router.post("/trips/{trip_id}/members")
async def join_trip(trip_id: str, data: dict):
    if not supabase:
        return {"success": True, "trip_id": trip_id}
    try:
        # Check if already a member
        existing = (
            supabase.table("trip_members")
            .select("id")
            .eq("trip_id", trip_id)
            .eq("user_id", data.get("user_id"))
            .execute()
        )
        if existing.data:
            return {"success": True, "already_member": True}
        supabase.table("trip_members").insert({
            "trip_id":    trip_id,
            "user_id":    data.get("user_id"),
            "user_email": data.get("user_email"),
            "user_name":  data.get("user_name"),
            "role":       "member",
        }).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET MEMBERS ───────────────────────────────────────────────────────────────
@router.get("/trips/{trip_id}/members")
async def get_members(trip_id: str):
    if not supabase:
        return []
    try:
        # Get the trip owner
        trip_result = supabase.table("trips").select("user_id, user_name, user_email, created_at").eq("id", trip_id).single().execute()
        trip = trip_result.data
        
        # Get joined members
        members_result = supabase.table("trip_members").select("*").eq("trip_id", trip_id).execute()
        members = members_result.data or []
        
        # Build combined list — owner first
        owner_ids = {m["user_id"] for m in members}
        all_members = []
        
        if trip:
            all_members.append({
                "user_id":   trip["user_id"],
                "user_name": trip.get("user_name") or "Trip Creator",
                "user_email": trip.get("user_email") or "",
                "role":      "owner",
                "joined_at": trip.get("created_at", ""),
            })
        
        for m in members:
            if m["user_id"] != (trip.get("user_id") if trip else None):
                all_members.append({
                    "user_id":   m["user_id"],
                    "user_name": m.get("user_name") or "",
                    "user_email": m.get("user_email") or "",
                    "role":      m.get("role", "member"),
                    "joined_at": m.get("joined_at", ""),
                })
        
        return all_members
    except Exception as e:
        print(f"get_members error: {e}")
        return []


# ── REMOVE MEMBER (owner only) ────────────────────────────────────────────────
@router.delete("/trips/{trip_id}/members/{member_user_id}")
async def remove_member(trip_id: str, member_user_id: str):
    if not supabase:
        return {"success": True}
    try:
        supabase.table("trip_members").delete()\
            .eq("trip_id", trip_id)\
            .eq("user_id", member_user_id)\
            .execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
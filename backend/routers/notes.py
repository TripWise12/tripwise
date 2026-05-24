from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from typing import Optional

router = APIRouter()

_url = os.getenv("SUPABASE_URL", "").strip()
_key = os.getenv("SUPABASE_KEY", "").strip()
supabase = None
if _url and _key and _url.startswith("https://"):
    try:
        from supabase import create_client
        supabase = create_client(_url, _key)
    except Exception as e:
        print(f"[TripWise] Supabase notes init: {e}")

class Note(BaseModel):
    trip_id: str
    user_id: str
    user_name: Optional[str] = ""
    content: str
    pinned: bool = False

class NoteUpdate(BaseModel):
    pinned: Optional[bool] = None
    content: Optional[str] = None

@router.post("/trips/{trip_id}/notes")
async def add_note(trip_id: str, note: Note):
    if not supabase:
        return {"id": "mock", **note.model_dump(), "created_at": "2026-01-01T00:00:00Z"}
    try:
        result = supabase.table("trip_notes").insert({
            "trip_id":   trip_id,
            "user_id":   note.user_id,
            "user_name": note.user_name,
            "content":   note.content,
            "pinned":    note.pinned,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trips/{trip_id}/notes")
async def get_notes(trip_id: str):
    if not supabase:
        return []
    try:
        result = (
            supabase.table("trip_notes")
            .select("*")
            .eq("trip_id", trip_id)
            .order("pinned", desc=True)
            .order("created_at", desc=False)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/trips/{trip_id}/notes/{note_id}")
async def update_note(trip_id: str, note_id: str, update: NoteUpdate):
    if not supabase:
        return {"id": note_id}
    updates = {k: v for k, v in update.model_dump().items() if v is not None}
    try:
        result = supabase.table("trip_notes").update(updates).eq("id", note_id).eq("trip_id", trip_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/trips/{trip_id}/notes/{note_id}")
async def delete_note(trip_id: str, note_id: str, user_id: str):
    if not supabase:
        return {"success": True}
    try:
        supabase.table("trip_notes").delete().eq("id", note_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
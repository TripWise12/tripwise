from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()

_supabase_url = os.getenv("SUPABASE_URL", "").strip()
_supabase_key = os.getenv("SUPABASE_KEY", "").strip()

supabase = None
if _supabase_url and _supabase_key and _supabase_url.startswith("https://"):
    try:
        from supabase import create_client
        supabase = create_client(_supabase_url, _supabase_key)
    except Exception as e:
        print(f"[TripWise] Supabase init failed (group): {e}")


class Comment(BaseModel):
    trip_id: str
    user_id: str
    activity_index: str
    content: str


@router.post("/trips/{trip_id}/comments")
async def add_comment(trip_id: str, comment: Comment):
    if not supabase:
        return {"id": "mock", **comment.dict()}
    try:
        result = supabase.table("comments").insert({
            "trip_id": trip_id,
            "user_id": comment.user_id,
            "activity_index": comment.activity_index,
            "content": comment.content,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}/comments")
async def get_comments(trip_id: str):
    if not supabase:
        return []
    try:
        result = supabase.table("comments").select("*").eq("trip_id", trip_id).execute()
        return result.data
    except Exception:
        return []


@router.post("/trips/{trip_id}/vote")
async def vote_on_activity(trip_id: str, data: dict):
    return {"success": True, "trip_id": trip_id, "vote": data.get("vote")}

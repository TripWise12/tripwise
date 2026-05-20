from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from collections import defaultdict

router = APIRouter()

_supabase_url = os.getenv("SUPABASE_URL", "").strip()
_supabase_key = os.getenv("SUPABASE_KEY", "").strip()

supabase = None
if _supabase_url and _supabase_key and _supabase_url.startswith("https://"):
    try:
        from supabase import create_client
        supabase = create_client(_supabase_url, _supabase_key)
    except Exception as e:
        print(f"[TripWise] Supabase init failed (expenses): {e}")


class Expense(BaseModel):
    trip_id: str
    paid_by: str
    paid_by_name: str
    title: str
    amount_inr: float
    category: str = "misc"
    split_between: list[str] = []
    split_type: str = "equal"


@router.post("/trips/{trip_id}/expense")
async def add_expense(trip_id: str, expense: Expense):
    if not supabase:
        return {"id": "mock_expense", **expense.dict()}
    try:
        result = supabase.table("expenses").insert({**expense.dict(), "trip_id": trip_id}).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}/expenses")
async def get_expenses(trip_id: str):
    if not supabase:
        return []
    try:
        result = supabase.table("expenses").select("*").eq("trip_id", trip_id).execute()
        return result.data
    except Exception:
        return []


@router.get("/trips/{trip_id}/splits")
async def calculate_splits(trip_id: str):
    if not supabase:
        return {"balances": {}, "settlements": [], "total_spent": 0}
    try:
        expenses_result = supabase.table("expenses").select("*").eq("trip_id", trip_id).execute()
        members_result = supabase.table("trip_members").select("*").eq("trip_id", trip_id).execute()
        expenses = expenses_result.data
        members = [m["user_id"] for m in members_result.data]
        if not members:
            return {"balances": {}, "settlements": [], "total_spent": 0}

        total_paid = defaultdict(float)
        total_owed = defaultdict(float)
        total_spent = 0

        for expense in expenses:
            amount = expense["amount_inr"]
            paid_by = expense["paid_by"]
            split_between = expense.get("split_between") or members
            total_paid[paid_by] += amount
            total_spent += amount
            share = amount / len(split_between)
            for member in split_between:
                total_owed[member] += share

        balances = {m: total_paid[m] - total_owed[m] for m in members}
        settlements = []
        creditors = {k: v for k, v in balances.items() if v > 0.5}
        debtors = {k: v for k, v in balances.items() if v < -0.5}

        for debtor, amount_owed in debtors.items():
            remaining = abs(amount_owed)
            for creditor in list(creditors.keys()):
                if remaining <= 0:
                    break
                pay = min(remaining, creditors[creditor])
                settlements.append({"from": debtor, "to": creditor, "amount_inr": round(pay, 2)})
                creditors[creditor] -= pay
                remaining -= pay

        return {
            "balances": {k: round(v, 2) for k, v in balances.items()},
            "settlements": settlements,
            "total_spent": round(total_spent, 2),
            "per_person_share": round(total_spent / len(members), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

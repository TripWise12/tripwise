from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from typing import Optional
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
    paid_by: str          # user_id of payer
    paid_by_name: str     # display name
    title: str
    amount_usd: float
    category: str = "misc"
    split_between: list[str] = []   # list of user_ids to split among
    split_type: str = "equal"


@router.post("/trips/{trip_id}/expense")
async def add_expense(trip_id: str, expense: Expense):
    if not supabase:
        return {"id": "mock_expense", **expense.model_dump()}
    try:
        result = supabase.table("expenses").insert({
            "trip_id":       trip_id,
            "paid_by":       expense.paid_by,
            "paid_by_name":  expense.paid_by_name,
            "title":         expense.title,
            "amount_usd":    expense.amount_usd,
            "category":      expense.category,
            "split_between": expense.split_between,
            "split_type":    expense.split_type,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}/expenses")
async def get_expenses(trip_id: str):
    if not supabase:
        return []
    try:
        result = (
            supabase.table("expenses")
            .select("*")
            .eq("trip_id", trip_id)
            .order("created_at", desc=False)
            .execute()
        )
        return result.data
    except Exception:
        return []


@router.delete("/trips/{trip_id}/expense/{expense_id}")
async def delete_expense(trip_id: str, expense_id: str, user_id: str):
    if not supabase:
        return {"success": True}
    try:
        supabase.table("expenses").delete().eq("id", expense_id).eq("trip_id", trip_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips/{trip_id}/splits")
async def calculate_splits(trip_id: str):
    if not supabase:
        return {"balances": {}, "settlements": [], "total_spent": 0}
    try:
        expenses_result = supabase.table("expenses").select("*").eq("trip_id", trip_id).execute()
        members_result = supabase.table("trip_members").select("*").eq("trip_id", trip_id).execute()
        expenses = expenses_result.data or []
        members = members_result.data or []
        member_ids = [m["user_id"] for m in members]

        if not member_ids:
            return {"balances": {}, "settlements": [], "total_spent": 0}

        total_paid: dict = defaultdict(float)
        total_owed: dict = defaultdict(float)
        total_spent = 0.0

        for expense in expenses:
            amount = expense.get("amount_usd", 0)
            paid_by = expense["paid_by"]
            split_between = expense.get("split_between") or member_ids
            total_paid[paid_by] += amount
            total_spent += amount
            share = amount / len(split_between)
            for member in split_between:
                total_owed[member] += share

        # Name mapping
        names = {m["user_id"]: (m.get("user_name") or m.get("user_email") or m["user_id"]) for m in members}
        balances = {m: round(total_paid[m] - total_owed[m], 2) for m in member_ids}

        creditors = {k: v for k, v in balances.items() if v > 0.5}
        debtors = {k: abs(v) for k, v in balances.items() if v < -0.5}
        settlements = []
        cred_list = sorted(creditors.items(), key=lambda x: -x[1])
        debt_list = sorted(debtors.items(), key=lambda x: -x[1])
        ci, di = 0, 0
        while ci < len(cred_list) and di < len(debt_list):
            cred_id, cred_amt = cred_list[ci]
            debt_id, debt_amt = debt_list[di]
            pay = round(min(cred_amt, debt_amt), 2)
            if pay > 0.5:
                settlements.append({
                    "from": debt_id,
                    "from_name": names.get(debt_id, debt_id),
                    "to": cred_id,
                    "to_name": names.get(cred_id, cred_id),
                    "amount_usd": pay,
                })
            cred_list[ci] = (cred_id, round(cred_amt - pay, 2))
            debt_list[di] = (debt_id, round(debt_amt - pay, 2))
            if cred_list[ci][1] < 0.5:
                ci += 1
            if debt_list[di][1] < 0.5:
                di += 1

        return {
            "balances": {names.get(k, k): v for k, v in balances.items()},
            "settlements": settlements,
            "total_spent": round(total_spent, 2),
            "per_person_share": round(total_spent / len(member_ids), 2) if member_ids else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

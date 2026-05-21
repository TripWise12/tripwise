from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import viability, itinerary, flights, trips, group, expenses
import os
import httpx
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tripwise")

app = FastAPI(title="TripWise API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tripwiseai.vercel.app")
RENDER_URL   = os.getenv("RENDER_URL", "")   # set to your own Render URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tripwiseai.vercel.app",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(viability.router, prefix="/api", tags=["Viability"])
app.include_router(itinerary.router, prefix="/api", tags=["Itinerary"])
app.include_router(flights.router,   prefix="/api", tags=["Flights"])
app.include_router(trips.router,     prefix="/api", tags=["Trips"])
app.include_router(group.router,     prefix="/api", tags=["Group"])
app.include_router(expenses.router,  prefix="/api", tags=["Expenses"])


# ── KEEP-ALIVE BOT ──────────────────────────────────────────────────────────
# Pings this server every 10 minutes so Render free tier never sleeps.
async def keep_alive():
    """Ping /health every 10 minutes to prevent Render free tier sleep."""
    await asyncio.sleep(30)   # wait 30s after startup before first ping
    url = RENDER_URL or str(app.url_path_for("health"))
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                target = RENDER_URL + "/health" if RENDER_URL else "http://localhost:8000/health"
                resp = await client.get(target)
                logger.info(f"[KeepAlive] ping → {resp.status_code}")
        except Exception as e:
            logger.warning(f"[KeepAlive] ping failed: {e}")
        await asyncio.sleep(600)   # 10 minutes


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(keep_alive())
    logger.info("[TripWise] Server started. Keep-alive bot running.")


@app.get("/health")
def health():
    return {"status": "ok", "service": "TripWise API", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "TripWise API — Intelligent Travel Planning"}

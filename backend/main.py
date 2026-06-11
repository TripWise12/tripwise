from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import viability, itinerary, flights, trips, group, expenses, discover, notes
import os, httpx, asyncio, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tripwise")

app = FastAPI(title="TripWise API", version="2.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tripwiseai.vercel.app")
RENDER_URL   = os.getenv("RENDER_URL", "")

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

app.include_router(viability.router,  prefix="/api", tags=["Viability"])
app.include_router(itinerary.router,  prefix="/api", tags=["Itinerary"])
app.include_router(flights.router,    prefix="/api", tags=["Flights"])
app.include_router(trips.router,      prefix="/api", tags=["Trips"])
app.include_router(group.router,      prefix="/api", tags=["Group"])
app.include_router(expenses.router,   prefix="/api", tags=["Expenses"])
app.include_router(discover.router,   prefix="/api", tags=["Discover"])
app.include_router(notes.router,      prefix="/api", tags=["Notes"])

async def keep_alive():
    await asyncio.sleep(30)
    while True:
        try:
            target = (RENDER_URL + "/health") if RENDER_URL else "http://localhost:8000/health"
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(target)
                logger.info(f"[KeepAlive] {resp.status_code}")
        except Exception as e:
            logger.warning(f"[KeepAlive] failed: {e}")
        await asyncio.sleep(600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(keep_alive())
    logger.info("[TripWise] v2.0 started")

@app.get("/health")
def health():
    return {"status": "ok", "service": "TripWise API", "version": "2.0.0"}

@app.get("/")
def root():
    return {"message": "TripWise API — Intelligent Travel Planning"}

@app.get("/api/place-image")
async def place_image(q: str = "", sig: int = 0):
    """Return a relevant travel image URL for a place/activity search term.
    Tries Unsplash API first (if key set), falls back to deterministic Picsum."""
    import hashlib
    key = os.getenv("UNSPLASH_ACCESS_KEY", "")
    seed = int(hashlib.md5(f"{q}{sig}".encode()).hexdigest(), 16) % 1000

    if key and q:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                r = await client.get(
                    "https://api.unsplash.com/search/photos",
                    params={"query": q, "per_page": 1, "page": sig + 1, "orientation": "landscape"},
                    headers={"Authorization": f"Client-ID {key}"}
                )
                data = r.json()
                results = data.get("results", [])
                if results:
                    url = results[0]["urls"].get("regular", "")
                    if url:
                        return {"url": url}
        except Exception as e:
            logger.warning(f"[PlaceImage] Unsplash failed for '{q}': {e}")

    # Fallback: Picsum with deterministic seed
    return {"url": f"https://picsum.photos/seed/{seed}/800/300"}
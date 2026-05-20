from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import viability, itinerary, flights, trips, group, expenses
import os

app = FastAPI(title="TripIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "https://tripiq.vercel.app"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(viability.router, prefix="/api", tags=["Viability"])
app.include_router(itinerary.router, prefix="/api", tags=["Itinerary"])
app.include_router(flights.router, prefix="/api", tags=["Flights"])
app.include_router(trips.router, prefix="/api", tags=["Trips"])
app.include_router(group.router, prefix="/api", tags=["Group"])
app.include_router(expenses.router, prefix="/api", tags=["Expenses"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "TripIQ API — Travel planning intelligence"}

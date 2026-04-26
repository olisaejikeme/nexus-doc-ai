import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import cloudinary
from contextlib import asynccontextmanager

from app.api.v1.endpoints.router import api_router
from app.core.cors import configure_cors
from app.core.openapi import custom_openapi
from app.exceptions.http_exceptions import http_exception_handler
from configs.settings import settings
from scripts.seed import seed

load_dotenv()

cloudinary.config(
    cloud_name=settings.cloudinary_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed()
    yield

app = FastAPI(lifespan=lifespan, title="NexusDoc API")

# Middleware & Exception Handlers
configure_cors(app)
app.openapi = custom_openapi(app)
app.add_exception_handler(HTTPException, http_exception_handler)

# Routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "online", "service": "NexusDoc API"}
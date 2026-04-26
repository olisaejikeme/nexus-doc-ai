from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from configs.settings import settings

def configure_cors(app: FastAPI):
    """
        Configures CORS for Nexus AI
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        allow_headers=["Origin", "Content-Type", "Accept", "Authorization",
                       "X-Requested-With", "Access-Control-Request-Method",
                       "Access-Control-Request-Headers"],
        expose_headers=[
            "Origin", "Content-Type", "Accept", "Access-Control-Allow-Origin", "Authorization"
        ]
    )